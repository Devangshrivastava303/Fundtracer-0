#!/usr/bin/env python
import os
import django
import sys

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from campaigns.models import Campaign
from campaigns.serializers import CampaignListSerializer
from django.test import RequestFactory

# Create a mock request
factory = RequestFactory()
request = factory.get('/api/campaigns/')

# Get campaigns
campaigns = Campaign.objects.all()[:1]
print(f"Total campaigns: {Campaign.objects.count()}")
print(f"Testing with {len(campaigns)} campaigns")

if campaigns:
    campaign = campaigns[0]
    print(f"\nCampaign: {campaign.title}")
    print(f"Campaign ID: {campaign.id}")
    print(f"Campaign category: {campaign.category}")
    print(f"Campaign created_by: {campaign.created_by}")
    
    try:
        serializer = CampaignListSerializer(campaigns, many=True, context={'request': request})
        data = serializer.data
        print("\nSerialization successful!")
        print(f"Serialized data: {data[0]}")
    except Exception as e:
        print(f"\nError during serialization: {e}")
        import traceback
        traceback.print_exc()
else:
    print("No campaigns found")
