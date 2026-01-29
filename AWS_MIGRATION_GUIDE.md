# AWS Cloud Storage Migration Guide

## Overview

This guide helps you migrate from localStorage to AWS cloud storage for Fundtracer. The solution includes:

- **DynamoDB** for user data, settings, and sessions
- **S3** for file uploads (images, PDFs, documents)
- **CloudFront** (optional) for CDN delivery
- Fallback to localStorage for development

## Prerequisites

1. AWS Account with the following services:
   - DynamoDB
   - S3
   - (Optional) Cognito for advanced auth
   - (Optional) CloudFront for CDN

2. AWS CLI configured
3. Node.js and npm

## Setup Instructions

### 1. Create DynamoDB Tables

```bash
# Users Table
aws dynamodb create-table \
  --table-name fundtracer-users \
  --attribute-definitions AttributeName=id,AttributeType=S \
  --key-schema AttributeName=id,KeyType=HASH \
  --billing-mode PAY_PER_REQUEST \
  --ttl-specification Enabled=true,AttributeName=ttl \
  --region us-east-1

# Settings Table
aws dynamodb create-table \
  --table-name fundtracer-settings \
  --attribute-definitions AttributeName=userId,AttributeType=S \
  --key-schema AttributeName=userId,KeyType=HASH \
  --billing-mode PAY_PER_REQUEST \
  --region us-east-1

# Sessions Table
aws dynamodb create-table \
  --table-name fundtracer-sessions \
  --attribute-definitions AttributeName=userId,AttributeType=S AttributeName=sessionId,AttributeType=S \
  --key-schema AttributeName=userId,KeyType=HASH AttributeName=sessionId,KeyType=RANGE \
  --billing-mode PAY_PER_REQUEST \
  --ttl-specification Enabled=true,AttributeName=ttl \
  --global-secondary-indexes '[{
    "IndexName": "userIdIndex",
    "KeySchema": [{"AttributeName": "userId", "KeyType": "HASH"}],
    "Projection": {"ProjectionType": "ALL"},
    "ProvisionedThroughput": {"ReadCapacityUnits": 5, "WriteCapacityUnits": 5}
  }]' \
  --region us-east-1
```

### 2. Create S3 Bucket

```bash
aws s3 mb s3://fundtracer-storage --region us-east-1

# Enable versioning (recommended)
aws s3api put-bucket-versioning \
  --bucket fundtracer-storage \
  --versioning-configuration Status=Enabled

# Block public access
aws s3api put-public-access-block \
  --bucket fundtracer-storage \
  --public-access-block-configuration \
  "BlockPublicAcls=true,IgnorePublicAcls=true,BlockPublicPolicy=true,RestrictPublicBuckets=true"
```

### 3. Create IAM User/Role

Create an IAM user with permissions for DynamoDB and S3:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "dynamodb:PutItem",
        "dynamodb:GetItem",
        "dynamodb:DeleteItem",
        "dynamodb:UpdateItem",
        "dynamodb:Query"
      ],
      "Resource": [
        "arn:aws:dynamodb:us-east-1:*:table/fundtracer-*"
      ]
    },
    {
      "Effect": "Allow",
      "Action": [
        "s3:PutObject",
        "s3:GetObject",
        "s3:DeleteObject",
        "s3:ListBucket"
      ],
      "Resource": [
        "arn:aws:s3:::fundtracer-storage",
        "arn:aws:s3:::fundtracer-storage/*"
      ]
    }
  ]
}
```

### 4. Configure Environment Variables

Copy `.env.aws` to `.env.local` and update with your AWS credentials:

```bash
cp .env.aws .env.local
```

Edit `.env.local`:
```
NEXT_PUBLIC_USE_AWS_STORAGE=true
NEXT_PUBLIC_AWS_REGION=us-east-1
NEXT_PUBLIC_AWS_ACCESS_KEY_ID=your_access_key
NEXT_PUBLIC_AWS_SECRET_ACCESS_KEY=your_secret_key
NEXT_PUBLIC_S3_BUCKET=fundtracer-storage
```

### 5. Install AWS SDK

```bash
npm install aws-sdk
# or
yarn add aws-sdk
```

## Usage Examples

### Updating Auth Code

**Before (localStorage):**
```typescript
localStorage.setItem("user", JSON.stringify(data.user));
localStorage.setItem("access_token", data.access_token);
```

**After (AWS Cloud Storage):**
```typescript
import { cloudStorageService } from '@/lib/cloud-storage';

await cloudStorageService.setItem("user", JSON.stringify(data.user));
await cloudStorageService.setItem("access_token", data.access_token);
```

### Getting User Data

**Before:**
```typescript
const user = JSON.parse(localStorage.getItem("user") || "{}");
```

**After:**
```typescript
import { cloudStorageService } from '@/lib/cloud-storage';

const userStr = await cloudStorageService.getItem("user");
const user = userStr ? JSON.parse(userStr) : {};
```

### Uploading Files

**New capability with AWS:**
```typescript
import { cloudStorageService } from '@/lib/cloud-storage';

// Upload milestone proof
const file = event.target.files[0];
const url = await cloudStorageService.uploadFile(
  file,
  `campaigns/${campaignId}/milestones/${milestoneId}/${file.name}`,
  userId
);

// Get signed URL (expires in 1 hour)
const signedUrl = await cloudStorageService.getSignedUrl(url, 3600);
```

### Logout (Clear Data)

**Before:**
```typescript
localStorage.removeItem("user");
localStorage.removeItem("access_token");
```

**After:**
```typescript
import { cloudStorageService } from '@/lib/cloud-storage';

await cloudStorageService.clear();
```

## Migration Checklist

- [ ] Create AWS account and services
- [ ] Set up DynamoDB tables
- [ ] Create S3 bucket
- [ ] Create IAM user with appropriate permissions
- [ ] Install aws-sdk package
- [ ] Copy and configure `.env.aws` to `.env.local`
- [ ] Update auth/page.tsx to use cloudStorageService
- [ ] Update header.tsx to use cloudStorageService
- [ ] Update all components that use localStorage
- [ ] Test user registration and login
- [ ] Test file uploads
- [ ] Test logout and data clearing
- [ ] Deploy to production with AWS credentials

## Files to Update

1. `frontend/app/auth/page.tsx` - Replace localStorage with cloudStorageService
2. `frontend/app/components/header.tsx` - Update logout logic
3. `frontend/app/components/profile-dropdown.tsx` - Update logout
4. `frontend/app/components/milestone-viewer.tsx` - Use S3 for file uploads
5. Any other component using localStorage

## Fallback Strategy

The system automatically falls back to localStorage if:
- AWS credentials are not configured
- `NEXT_PUBLIC_USE_AWS_STORAGE=false`
- AWS call fails

This allows for gradual migration and development without AWS.

## Cost Optimization

### DynamoDB
- Use on-demand billing for variable load
- Enable TTL to auto-delete expired sessions
- Estimated cost: ~$1/month for moderate usage

### S3
- Use S3 Standard for active content
- Enable intelligent-tiering for cost savings
- Estimated cost: ~$0.023 per GB stored

### CloudFront (Optional)
- Cache frequently accessed files
- Reduce S3 bandwidth costs
- Estimated cost: ~$0.085 per GB

## Security Best Practices

1. **Never commit credentials to git**
   - Use `.env.local` (not in version control)
   - Use IAM roles in production

2. **Encrypt sensitive data**
   - Enable S3 encryption
   - Use DynamoDB encryption
   - Use HTTPS only

3. **Access Control**
   - Use bucket policies to restrict access
   - Implement API key rotation
   - Use signed URLs for temporary access

4. **Monitoring**
   - Enable CloudTrail for audit logs
   - Set up CloudWatch alarms
   - Monitor S3 access patterns

## Troubleshooting

### "Cannot find module 'aws-sdk'"
```bash
npm install aws-sdk
```

### "Access Denied" errors
- Check IAM permissions
- Verify AWS credentials in `.env.local`
- Check S3 bucket policy

### DynamoDB throttling
- Switch to on-demand billing
- Or increase provisioned capacity
- Add DAX for caching (advanced)

### High AWS costs
- Review S3 storage usage
- Check DynamoDB read/write units
- Implement lifecycle policies

## Next Steps

1. Complete the migration checklist
2. Test thoroughly in staging environment
3. Deploy to production with AWS services
4. Monitor usage and optimize costs
5. Consider advanced features like Cognito

For more help, refer to:
- [AWS DynamoDB Documentation](https://docs.aws.amazon.com/dynamodb/)
- [AWS S3 Documentation](https://docs.aws.amazon.com/s3/)
- [AWS SDK for JavaScript](https://docs.aws.amazon.com/sdk-for-javascript/)
