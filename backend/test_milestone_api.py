"""
Test script to verify milestone API is working correctly
Run this from the backend directory: python test_milestone_api.py
"""
import os
import django
import requests
import json
from datetime import datetime, timedelta

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from accounts.models import User
from campaigns.models import Campaign, CampaignCategory
from accounts.tokens import get_tokens_for_user

# Test setup
print("=" * 50)
print("MILESTONE API TEST")
print("=" * 50)

# Get or create test user
test_user = User.objects.filter(email='testuser@example.com').first()
if not test_user:
    test_user = User.objects.create_user(
        email='testuser@example.com',
        password='testpass123'
    )
    print(f"✓ Created test user: {test_user.email}")
else:
    print(f"✓ Using existing test user: {test_user.email}")

# Get or create a campaign
campaign = Campaign.objects.filter(created_by=test_user).first()
if not campaign:
    category = CampaignCategory.objects.first() or CampaignCategory.objects.create(name='General')
    campaign = Campaign.objects.create(
        title='Test Campaign for Milestones',
        description='This is a test campaign',
        category=category,
        goal_amount=10000,
        campaign_type='INDIVIDUAL',
        is_active=True,
        created_by=test_user
    )
    print(f"✓ Created test campaign: {campaign.id}")
else:
    print(f"✓ Using existing campaign: {campaign.id}")

# Create access token
tokens = get_tokens_for_user(test_user)
token = tokens['access_token']
print(f"✓ Generated access token")

# Test milestone creation
BASE_URL = 'http://127.0.0.1:8000/api'
headers = {
    'Authorization': f'Bearer {token}',
    'Content-Type': 'application/json'
}

milestone_data = {
    'title': 'First Milestone',
    'description': 'Complete initial fundraising goal',
    'due_date': (datetime.now() + timedelta(days=30)).isoformat(),
}

print(f"\n--- Testing Milestone Creation ---")
print(f"Campaign ID: {campaign.id}")
print(f"Payload: {json.dumps(milestone_data, indent=2)}")

response = requests.post(
    f'{BASE_URL}/campaigns/{campaign.id}/milestones/',
    json=milestone_data,
    headers=headers
)

print(f"Status Code: {response.status_code}")
print(f"Response: {json.dumps(response.json(), indent=2)}")

if response.status_code == 201:
    print("✓ Milestone created successfully!")
else:
    print("✗ Failed to create milestone")

# Test milestone retrieval
print(f"\n--- Testing Milestone Retrieval ---")
response = requests.get(
    f'{BASE_URL}/campaigns/{campaign.id}/milestones/',
    headers=headers
)

print(f"Status Code: {response.status_code}")
print(f"Response: {json.dumps(response.json(), indent=2)}")

print("\n" + "=" * 50)
