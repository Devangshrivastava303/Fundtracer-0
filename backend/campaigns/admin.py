from django.contrib import admin
from .models import Campaign, CampaignCategory


@admin.register(CampaignCategory)
class CampaignCategoryAdmin(admin.ModelAdmin):
    list_display = ('id', 'name', 'created_at')
    search_fields = ('name',)


@admin.register(Campaign)
class CampaignAdmin(admin.ModelAdmin):
    list_display = ('id', 'title', 'created_by', 'goal_amount', 'raised_amount', 'campaign_type', 'is_active', 'created_at')
    list_filter = ('campaign_type', 'is_active', 'category', 'created_at')
    search_fields = ('title', 'description', 'created_by__email')
