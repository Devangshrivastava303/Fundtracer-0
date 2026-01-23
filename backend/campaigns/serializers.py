from rest_framework import serializers
from campaigns.models import Campaign, CampaignCategory
from accounts.serializers import UserSerializer


class CampaignCategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = CampaignCategory
        fields = ['id', 'name', 'description']


class CampaignListSerializer(serializers.ModelSerializer):
    created_by = UserSerializer(read_only=True)
    category = CampaignCategorySerializer(read_only=True)
    progress_percentage = serializers.SerializerMethodField()
    donation_count = serializers.SerializerMethodField()

    class Meta:
        model = Campaign
        fields = [
            'id', 'title', 'description', 'goal_amount', 'raised_amount',
            'progress_percentage', 'category', 'campaign_type', 'is_active',
            'image', 'fundtracer_verified', 'created_by', 'donation_count', 'created_at'
        ]

    def get_progress_percentage(self, obj):
        if obj.goal_amount == 0:
            return 0
        return round((obj.raised_amount / obj.goal_amount) * 100, 2)

    def get_donation_count(self, obj):
        return obj.donations.count()


class CampaignDetailSerializer(serializers.ModelSerializer):
    created_by = UserSerializer(read_only=True)
    category = CampaignCategorySerializer(read_only=True)
    progress_percentage = serializers.SerializerMethodField()
    is_owner = serializers.SerializerMethodField()
    donation_count = serializers.SerializerMethodField()

    class Meta:
        model = Campaign
        fields = [
            'id', 'title', 'description', 'goal_amount', 'raised_amount',
            'progress_percentage', 'category', 'campaign_type', 'is_active',
            'image', 'fundtracer_verified', 'created_by', 'is_owner', 'donation_count', 'created_at'
        ]

    def get_progress_percentage(self, obj):
        if obj.goal_amount == 0:
            return 0
        return round((obj.raised_amount / obj.goal_amount) * 100, 2)

    def get_is_owner(self, obj):
        request = self.context.get('request')
        if request and request.user:
            return obj.created_by == request.user
        return False

    def get_donation_count(self, obj):
        return obj.donations.count()


class CampaignCreateUpdateSerializer(serializers.ModelSerializer):
    category_id = serializers.IntegerField(write_only=True)

    class Meta:
        model = Campaign
        fields = ['title', 'description', 'goal_amount', 'category_id', 'campaign_type', 'is_active', 'image']

    def create(self, validated_data):
        validated_data['created_by'] = self.context['request'].user
        category_id = validated_data.pop('category_id')
        campaign = Campaign.objects.create(
            category_id=category_id,
            **validated_data
        )
        return campaign

    def update(self, instance, validated_data):
        if 'category_id' in validated_data:
            category_id = validated_data.pop('category_id')
            instance.category_id = category_id
        return super().update(instance, validated_data)
