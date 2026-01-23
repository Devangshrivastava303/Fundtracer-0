from django.urls import path
from . import views
from . import milestone_views
from donations.views import get_campaign_donations

app_name = 'campaigns'

urlpatterns = [
    # Categories
    path('categories/', views.list_categories, name='list_categories'),
    
    # Campaign listing and filtering
    path('', views.list_campaigns, name='list_campaigns'),
    
    # Campaign creation
    path('create/', views.create_campaign, name='create_campaign'),
    
    # Campaign details, update, delete
    path('<str:id>/', views.get_campaign, name='get_campaign'),
    path('<str:id>/donations/', get_campaign_donations, name='campaign_donations'),
    path('<str:id>/update/', views.update_campaign, name='update_campaign'),
    path('<str:id>/delete/', views.delete_campaign, name='delete_campaign'),
    path('<str:id>/stats/', views.get_campaign_stats, name='campaign_stats'),
    
    # Milestones endpoints
    path('<str:campaign_id>/milestones/', milestone_views.milestones_list_create, name='milestones_list_create'),
    path('<str:campaign_id>/milestones/<str:milestone_id>/', milestone_views.get_milestone_detail, name='get_milestone'),
    path('<str:campaign_id>/milestones/<str:milestone_id>/', milestone_views.update_milestone, name='update_milestone'),
    path('<str:campaign_id>/milestones/<str:milestone_id>/complete/', milestone_views.complete_milestone, name='complete_milestone'),
    path('<str:campaign_id>/milestones/<str:milestone_id>/delete/', milestone_views.delete_milestone, name='delete_milestone'),
]
