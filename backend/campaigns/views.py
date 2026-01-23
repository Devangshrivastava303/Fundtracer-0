from django.shortcuts import render
from rest_framework import viewsets
from .models import Campaign
from .serializers import CampaignListSerializer, CampaignDetailSerializer


class CampaignViewSet(viewsets.ModelViewSet):
    queryset = Campaign.objects.all()
    
    def get_serializer_class(self):
        if self.action == 'retrieve':
            return CampaignDetailSerializer
        return CampaignListSerializer
