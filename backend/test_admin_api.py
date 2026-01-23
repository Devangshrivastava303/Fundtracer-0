#!/usr/bin/env python
"""
Test admin API endpoints
"""
import os
import django
from django.test import Client
from django.contrib.auth import get_user_model

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

User = get_user_model()

# Get or create a superuser for testing
user, created = User.objects.get_or_create(
    email='admin@test.com',
    defaults={
        'full_name': 'Admin User',
        'is_staff': True,
        'is_superuser': True,
        'is_active': True,
    }
)

if created:
    user.set_password('admin123')
    user.save()
    print(f"✓ Created superuser: {user.email}")
else:
    print(f"✓ Superuser already exists: {user.email}")

# Test the endpoints
client = Client()

# Get token first
response = client.post('/api/auth/login/', {
    'email': 'admin@test.com',
    'password': 'admin123'
}, content_type='application/json')

if response.status_code == 200:
    import json
    data = json.loads(response.content)
    token = data.get('access')
    print(f"✓ Login successful, token: {token[:20]}...")
    
    # Test admin stats endpoint
    headers = {'HTTP_AUTHORIZATION': f'Bearer {token}'}
    response = client.get('/api/admin/stats/', **headers)
    print(f"✓ Admin stats endpoint: {response.status_code}")
    if response.status_code == 200:
        data = json.loads(response.content)
        print(f"  - Total users: {data.get('total_users')}")
        print(f"  - Total campaigns: {data.get('total_campaigns')}")
        print(f"  - Total donations: {data.get('total_donations')}")
    else:
        print(f"  Error: {response.content}")
    
    # Test donations list endpoint
    response = client.get('/api/admin/donations/', **headers)
    print(f"✓ Admin donations endpoint: {response.status_code}")
    
else:
    print(f"✗ Login failed: {response.status_code}")
    print(f"  Error: {response.content}")
