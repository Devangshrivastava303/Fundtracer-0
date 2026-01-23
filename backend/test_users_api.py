#!/usr/bin/env python
"""Test users API endpoint"""
import os
import sys
import django
import json

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from accounts.models import User
from rest_framework.test import APIClient
from rest_framework_simplejwt.tokens import RefreshToken

# Create test client
client = APIClient()

# Get or create superuser
admin_user, created = User.objects.get_or_create(
    email='admin@test.com',
    defaults={
        'full_name': 'Admin User',
        'is_staff': True,
        'is_superuser': True,
        'is_active': True,
    }
)

if created:
    admin_user.set_password('admin123')
    admin_user.save()
    print(f"✓ Created superuser: {admin_user.email}")
else:
    print(f"✓ Using existing superuser: {admin_user.email}")

# Generate token
refresh = RefreshToken.for_user(admin_user)
access_token = str(refresh.access_token)

print(f"✓ Generated token: {access_token[:30]}...")

# Test the endpoint
print("\nTesting /api/admin/users/ endpoint:")
response = client.get(
    '/api/admin/users/',
    HTTP_AUTHORIZATION=f'Bearer {access_token}'
)

print(f"Status Code: {response.status_code}")
print(f"Response: {json.dumps(response.json(), indent=2)}")
