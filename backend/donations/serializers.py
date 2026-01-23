from rest_framework import serializers
from donations.models import Donation, DonationReceipt
from accounts.serializers import UserSerializer
from campaigns.serializers import CampaignListSerializer


class DonationSerializer(serializers.ModelSerializer):
    donor = UserSerializer(read_only=True)
    campaign_title = serializers.CharField(source='campaign.title', read_only=True)
    campaign = serializers.PrimaryKeyRelatedField(read_only=True)

    class Meta:
        model = Donation
        fields = [
            'id', 'donor', 'campaign', 'campaign_title', 'amount',
            'payment_method', 'status', 'transaction_id', 'message',
            'is_anonymous', 'created_at'
        ]
        read_only_fields = ['id', 'donor', 'campaign', 'status', 'created_at', 'campaign_title']


class DonationCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Donation
        fields = ['campaign', 'amount', 'payment_method', 'message', 'is_anonymous']

    def create(self, validated_data):
        validated_data['donor'] = self.context['request'].user
        return super().create(validated_data)


class DonationReceiptSerializer(serializers.ModelSerializer):
    donation = DonationSerializer(read_only=True)

    class Meta:
        model = DonationReceipt
        fields = ['id', 'donation', 'receipt_number', 'receipt_pdf', 'created_at']
        read_only_fields = ['id', 'created_at']
