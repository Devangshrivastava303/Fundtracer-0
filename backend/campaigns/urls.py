from django.urls import path
from . import views

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
    path('<str:id>/update/', views.update_campaign, name='update_campaign'),
    path('<str:id>/delete/', views.delete_campaign, name='delete_campaign'),
    path('<str:id>/stats/', views.get_campaign_stats, name='campaign_stats'),
]
