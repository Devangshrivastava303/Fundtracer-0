from rest_framework_simplejwt.tokens import RefreshToken
from datetime import timedelta


def get_tokens_for_user(user):
    """
    Generate access and refresh tokens for a user
    """
    refresh = RefreshToken.for_user(user)
    
    return {
        'access_token': str(refresh.access_token),
        'refresh_token': str(refresh),
        'expires_in': int(timedelta(hours=1).total_seconds())
    }
