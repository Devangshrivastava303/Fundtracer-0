from django.urls import path
from . import views

app_name = 'accounts'

urlpatterns = [
    path('signup/', views.signup, name='signup'),
    path('login/', views.login, name='login'),
    path('phone-login/', views.phone_login, name='phone_login'),
    path('phone-signup/', views.phone_signup, name='phone_signup'),
    path('logout/', views.logout, name='logout'),
    path('me/', views.get_profile, name='profile'),
    path('me/update/', views.update_profile, name='update_profile'),
    path('change-password/', views.change_password, name='change_password'),
    path('refresh-token/', views.refresh_token_view, name='refresh_token'),
]
