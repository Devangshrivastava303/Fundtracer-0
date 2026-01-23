from django.urls import path
from . import views

app_name = 'donations'

urlpatterns = [
    # User donations (must come before the single item path)
    path('my-donations/', views.get_user_donations, name='user_donations'),
    path('count/', views.get_donation_count, name='donation_count'),
    
    # Donation creation
    path('', views.create_donation, name='create_donation'),
    
    # Donation details
    path('<str:donation_id>/', views.get_donation_detail, name='donation_detail'),
    path('<str:donation_id>/status/', views.update_donation_status, name='update_donation_status'),
]
