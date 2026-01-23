from django.urls import path
from core.admin_views import (
    admin_dashboard_stats,
    admin_list_donations,
    admin_approve_donation,
    admin_reject_donation,
    admin_list_campaigns,
    admin_verify_campaign,
    admin_reject_campaign,
    admin_list_users,
    admin_get_user_detail,
)

app_name = 'admin'

urlpatterns = [
    # Dashboard
    path('stats/', admin_dashboard_stats, name='dashboard_stats'),
    
    # Donations Management
    path('donations/', admin_list_donations, name='list_donations'),
    path('donations/<str:donation_id>/approve/', admin_approve_donation, name='approve_donation'),
    path('donations/<str:donation_id>/reject/', admin_reject_donation, name='reject_donation'),
    
    # Campaigns Management
    path('campaigns/', admin_list_campaigns, name='list_campaigns'),
    path('campaigns/<str:campaign_id>/verify/', admin_verify_campaign, name='verify_campaign'),
    path('campaigns/<str:campaign_id>/reject/', admin_reject_campaign, name='reject_campaign'),
    
    # Users Management
    path('users/', admin_list_users, name='list_users'),
    path('users/<str:user_id>/', admin_get_user_detail, name='user_detail'),
]
