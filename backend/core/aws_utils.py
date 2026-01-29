"""
AWS Integration Helper for Django Backend
==========================================

This module provides utilities for the Django backend to work with
AWS services (DynamoDB, S3) when storing user sessions, files, and settings.

Usage:
------
from core.aws_utils import AWSStorageHelper

# Save user session
aws_helper = AWSStorageHelper()
aws_helper.save_session(user_id="123", tokens={...})

# Generate signed URL for file
signed_url = aws_helper.get_signed_url("campaigns/123/file.pdf")
"""

import os
import json
import logging
from datetime import datetime, timedelta
from typing import Optional, Dict, Any
from functools import lru_cache

# AWS SDK imports (boto3)
try:
    import boto3
    from botocore.exceptions import ClientError, BotoCoreError
except ImportError:
    boto3 = None
    ClientError = Exception
    BotoCoreError = Exception

logger = logging.getLogger(__name__)


class AWSStorageHelper:
    """
    Helper class for Django to interact with AWS services.
    Provides methods for DynamoDB and S3 operations.
    """

    def __init__(self):
        """Initialize AWS clients from environment variables."""
        self.aws_enabled = os.getenv("USE_AWS_STORAGE", "false").lower() == "true"
        self.region = os.getenv("AWS_REGION", "us-east-1")

        if self.aws_enabled and boto3:
            self.dynamodb = boto3.resource(
                "dynamodb",
                region_name=self.region,
                aws_access_key_id=os.getenv("AWS_ACCESS_KEY_ID"),
                aws_secret_access_key=os.getenv("AWS_SECRET_ACCESS_KEY"),
            )
            self.s3 = boto3.client(
                "s3",
                region_name=self.region,
                aws_access_key_id=os.getenv("AWS_ACCESS_KEY_ID"),
                aws_secret_access_key=os.getenv("AWS_SECRET_ACCESS_KEY"),
            )
        else:
            self.dynamodb = None
            self.s3 = None

        # Table and bucket names
        self.users_table = os.getenv("DYNAMODB_USERS_TABLE", "fundtracer-users")
        self.settings_table = os.getenv("DYNAMODB_SETTINGS_TABLE", "fundtracer-settings")
        self.sessions_table = os.getenv("DYNAMODB_SESSIONS_TABLE", "fundtracer-sessions")
        self.s3_bucket = os.getenv("S3_BUCKET", "fundtracer-storage")

    # ========== DynamoDB User Operations ==========

    def save_user_session(
        self, user_id: str, tokens: Dict[str, str], expires_in: int = 86400
    ) -> bool:
        """
        Save user session to DynamoDB.

        Args:
            user_id: User ID
            tokens: Dict with 'access_token' and 'refresh_token'
            expires_in: Seconds until session expires (default: 24 hours)

        Returns:
            bool: True if successful, False otherwise
        """
        if not self.aws_enabled or not self.dynamodb:
            logger.debug("AWS storage disabled, skipping session save")
            return False

        try:
            table = self.dynamodb.Table(self.sessions_table)
            ttl = int((datetime.now() + timedelta(seconds=expires_in)).timestamp())

            table.put_item(
                Item={
                    "userId": user_id,
                    "accessToken": tokens.get("access_token"),
                    "refreshToken": tokens.get("refresh_token"),
                    "createdAt": datetime.now().isoformat(),
                    "expiresAt": (datetime.now() + timedelta(seconds=expires_in)).isoformat(),
                    "ttl": ttl,  # Auto-delete after expiry
                }
            )
            logger.info(f"Session saved for user {user_id}")
            return True

        except (ClientError, BotoCoreError) as e:
            logger.error(f"Failed to save session: {str(e)}")
            return False

    def get_user_session(self, user_id: str) -> Optional[Dict[str, Any]]:
        """
        Retrieve user session from DynamoDB.

        Args:
            user_id: User ID

        Returns:
            Dict with session data or None if not found
        """
        if not self.aws_enabled or not self.dynamodb:
            return None

        try:
            table = self.dynamodb.Table(self.sessions_table)
            response = table.get_item(Key={"userId": user_id})
            return response.get("Item")

        except (ClientError, BotoCoreError) as e:
            logger.error(f"Failed to get session: {str(e)}")
            return None

    def delete_user_session(self, user_id: str) -> bool:
        """
        Delete user session from DynamoDB.

        Args:
            user_id: User ID

        Returns:
            bool: True if successful
        """
        if not self.aws_enabled or not self.dynamodb:
            return False

        try:
            table = self.dynamodb.Table(self.sessions_table)
            table.delete_item(Key={"userId": user_id})
            logger.info(f"Session deleted for user {user_id}")
            return True

        except (ClientError, BotoCoreError) as e:
            logger.error(f"Failed to delete session: {str(e)}")
            return False

    # ========== DynamoDB Settings Operations ==========

    def save_user_setting(self, user_id: str, key: str, value: Any) -> bool:
        """
        Save individual user setting.

        Args:
            user_id: User ID
            key: Setting key (e.g., 'theme', 'notifications')
            value: Setting value

        Returns:
            bool: True if successful
        """
        if not self.aws_enabled or not self.dynamodb:
            return False

        try:
            table = self.dynamodb.Table(self.settings_table)
            table.put_item(
                Item={
                    "userId": user_id,
                    "settingKey": key,
                    "settingValue": value if isinstance(value, (str, int, float, bool)) else json.dumps(value),
                    "updatedAt": datetime.now().isoformat(),
                }
            )
            logger.info(f"Setting saved: {user_id}.{key}")
            return True

        except (ClientError, BotoCoreError) as e:
            logger.error(f"Failed to save setting: {str(e)}")
            return False

    def get_user_settings(self, user_id: str) -> Dict[str, Any]:
        """
        Get all settings for a user.

        Args:
            user_id: User ID

        Returns:
            Dict mapping setting keys to values
        """
        if not self.aws_enabled or not self.dynamodb:
            return {}

        try:
            table = self.dynamodb.Table(self.settings_table)
            response = table.query(KeyConditionExpression="userId = :uid", ExpressionAttributeValues={":uid": user_id})

            settings = {}
            for item in response.get("Items", []):
                key = item.get("settingKey")
                value = item.get("settingValue")
                # Try to parse JSON values
                try:
                    settings[key] = json.loads(value) if isinstance(value, str) else value
                except (json.JSONDecodeError, TypeError):
                    settings[key] = value

            return settings

        except (ClientError, BotoCoreError) as e:
            logger.error(f"Failed to get settings: {str(e)}")
            return {}

    # ========== S3 File Operations ==========

    def generate_signed_url(
        self, key: str, expiration: int = 3600
    ) -> Optional[str]:
        """
        Generate signed URL for S3 object.

        Args:
            key: S3 object key (path)
            expiration: URL expiration in seconds (default: 1 hour)

        Returns:
            Signed URL string or None if failed
        """
        if not self.aws_enabled or not self.s3:
            logger.debug("AWS storage disabled, cannot generate signed URL")
            return None

        try:
            url = self.s3.generate_presigned_url(
                "get_object",
                Params={
                    "Bucket": self.s3_bucket,
                    "Key": key,
                },
                ExpiresIn=expiration,
            )
            return url

        except (ClientError, BotoCoreError) as e:
            logger.error(f"Failed to generate signed URL: {str(e)}")
            return None

    def upload_file_metadata(
        self, key: str, metadata: Dict[str, str]
    ) -> bool:
        """
        Store file metadata (after file is uploaded from frontend).

        Args:
            key: S3 object key
            metadata: File metadata (uploader, size, timestamp, etc.)

        Returns:
            bool: True if successful
        """
        if not self.aws_enabled or not self.s3:
            return False

        try:
            # Store metadata as object tags or in DynamoDB
            # For now, we'll just log it
            logger.info(f"File metadata for {key}: {metadata}")
            return True

        except (ClientError, BotoCoreError) as e:
            logger.error(f"Failed to store file metadata: {str(e)}")
            return False

    def delete_s3_file(self, key: str) -> bool:
        """
        Delete file from S3.

        Args:
            key: S3 object key

        Returns:
            bool: True if successful
        """
        if not self.aws_enabled or not self.s3:
            return False

        try:
            self.s3.delete_object(Bucket=self.s3_bucket, Key=key)
            logger.info(f"File deleted from S3: {key}")
            return True

        except (ClientError, BotoCoreError) as e:
            logger.error(f"Failed to delete S3 file: {str(e)}")
            return False

    # ========== Utility Methods ==========

    def is_enabled(self) -> bool:
        """Check if AWS storage is enabled."""
        return self.aws_enabled and self.dynamodb is not None and self.s3 is not None

    def health_check(self) -> bool:
        """
        Verify AWS connectivity and credentials.

        Returns:
            bool: True if AWS is accessible, False otherwise
        """
        if not self.aws_enabled:
            return False

        try:
            # Try to list DynamoDB tables
            if self.dynamodb:
                response = self.dynamodb.tables.all()
                list(response)  # Force evaluation

            # Try to list S3 buckets
            if self.s3:
                self.s3.list_buckets()

            logger.info("AWS health check passed")
            return True

        except (ClientError, BotoCoreError) as e:
            logger.error(f"AWS health check failed: {str(e)}")
            return False


# ========== Django Integration Example ==========

"""
Usage in Django views:

from core.aws_utils import AWSStorageHelper
from rest_framework.response import Response

class LoginView(APIView):
    def post(self, request):
        # ... authentication logic ...
        user = authenticate(...)
        
        # Save session to AWS
        aws = AWSStorageHelper()
        aws.save_user_session(
            user_id=str(user.id),
            tokens={"access_token": token.key},
            expires_in=86400
        )
        
        return Response({"token": token.key})


class MilestoneUploadView(APIView):
    def post(self, request, campaign_id, milestone_id):
        file = request.FILES['file']
        
        # File is uploaded to S3 from frontend
        # Backend stores metadata
        aws = AWSStorageHelper()
        s3_key = f"campaigns/{campaign_id}/milestones/{milestone_id}/{file.name}"
        
        aws.upload_file_metadata(
            key=s3_key,
            metadata={
                "uploader": request.user.id,
                "size": file.size,
                "timestamp": datetime.now().isoformat(),
                "content_type": file.content_type,
            }
        )
        
        # Create milestone proof record
        milestone = Milestone.objects.get(id=milestone_id)
        milestone.proof_documents.append({
            "s3_key": s3_key,
            "uploaded_at": datetime.now().isoformat(),
        })
        milestone.save()
        
        return Response({"success": True})
"""

# ========== Settings Configuration ==========

"""
Add to Django settings.py:

# AWS Configuration
USE_AWS_STORAGE = os.getenv("USE_AWS_STORAGE", "false") == "true"
AWS_REGION = os.getenv("AWS_REGION", "us-east-1")
AWS_ACCESS_KEY_ID = os.getenv("AWS_ACCESS_KEY_ID")
AWS_SECRET_ACCESS_KEY = os.getenv("AWS_SECRET_ACCESS_KEY")

# DynamoDB Tables
DYNAMODB_USERS_TABLE = os.getenv("DYNAMODB_USERS_TABLE", "fundtracer-users")
DYNAMODB_SETTINGS_TABLE = os.getenv("DYNAMODB_SETTINGS_TABLE", "fundtracer-settings")
DYNAMODB_SESSIONS_TABLE = os.getenv("DYNAMODB_SESSIONS_TABLE", "fundtracer-sessions")

# S3 Bucket
S3_BUCKET = os.getenv("S3_BUCKET", "fundtracer-storage")

# Add aws_utils to INSTALLED_APPS if needed
INSTALLED_APPS = [
    # ...
    "core",  # where aws_utils.py lives
]
"""
