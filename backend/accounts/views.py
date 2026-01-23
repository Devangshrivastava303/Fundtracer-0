from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from accounts.serializers import (
    SignupSerializer, LoginSerializer, UserSerializer, 
    RefreshTokenSerializer
)
from accounts.tokens import get_tokens_for_user
from accounts.models import User
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth.hashers import check_password


# -------------------- SIGNUP --------------------
@api_view(['POST'])
@permission_classes([AllowAny])
def signup(request):
    """
    User signup endpoint
    POST /api/auth/signup/
    """
    serializer = SignupSerializer(data=request.data)
    
    if serializer.is_valid():
        user = serializer.save()
        tokens = get_tokens_for_user(user)
        user_data = UserSerializer(user).data
        
        return Response({
            'message': 'Signup successful',
            'user': user_data,
            'access_token': tokens['access_token'],
            'refresh_token': tokens['refresh_token'],
            'expires_in': tokens['expires_in']
        }, status=status.HTTP_201_CREATED)
    
    return Response({
        'error': 'Signup failed',
        'errors': serializer.errors
    }, status=status.HTTP_400_BAD_REQUEST)


# -------------------- LOGIN --------------------
@api_view(['POST'])
@permission_classes([AllowAny])
def login(request):
    """
    User login endpoint
    POST /api/auth/login/
    """
    serializer = LoginSerializer(data=request.data)
    
    if serializer.is_valid():
        user = serializer.validated_data['user']
        tokens = get_tokens_for_user(user)
        user_data = UserSerializer(user).data
        
        return Response({
            'message': 'Login successful',
            'user': user_data,
            'access_token': tokens['access_token'],
            'refresh_token': tokens['refresh_token'],
            'expires_in': tokens['expires_in']
        }, status=status.HTTP_200_OK)
    
    return Response({
        'error': 'Login failed',
        'errors': serializer.errors
    }, status=status.HTTP_401_UNAUTHORIZED)


# -------------------- LOGOUT --------------------
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def logout(request):
    """
    User logout endpoint
    POST /api/auth/logout/
    """
    return Response({
        'message': 'Logout successful'
    }, status=status.HTTP_200_OK)


# -------------------- GET CURRENT USER PROFILE --------------------
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_profile(request):
    """
    Get current user profile
    GET /api/auth/me/
    """
    user = request.user
    serializer = UserSerializer(user)
    
    return Response({
        'message': 'Profile retrieved successfully',
        'user': serializer.data
    }, status=status.HTTP_200_OK)


# -------------------- UPDATE USER PROFILE --------------------
@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def update_profile(request):
    """
    Update current user profile
    PUT /api/auth/me/update/
    Required: password (for verification)
    """
    user = request.user
    data = request.data
    password = data.get('password')
    
    # Verify password
    if not password:
        return Response({
            'error': 'Password is required to update profile'
        }, status=status.HTTP_400_BAD_REQUEST)
    
    if not check_password(password, user.password):
        return Response({
            'error': 'Incorrect password',
            'password': ['Incorrect password']
        }, status=status.HTTP_401_UNAUTHORIZED)
    
    # Update allowed fields
    allowed_fields = ['full_name', 'phone_number', 'bio']
    for field in allowed_fields:
        if field in data:
            setattr(user, field, data[field])
    
    user.save()
    serializer = UserSerializer(user)
    
    return Response({
        'message': 'Profile updated successfully',
        'user': serializer.data
    }, status=status.HTTP_200_OK)


# -------------------- REFRESH TOKEN --------------------
@api_view(['POST'])
@permission_classes([AllowAny])
def refresh_token_view(request):
    """
    Refresh access token
    POST /api/auth/refresh-token/
    """
    refresh = request.data.get('refresh_token')
    
    if not refresh:
        return Response({
            'error': 'Refresh token required'
        }, status=status.HTTP_400_BAD_REQUEST)
    
    try:
        refresh_token = RefreshToken(refresh)
        access_token = str(refresh_token.access_token)
        
        return Response({
            'message': 'Token refreshed successfully',
            'access_token': access_token,
            'expires_in': 3600
        }, status=status.HTTP_200_OK)
    except Exception as e:
        return Response({
            'error': 'Invalid refresh token'
        }, status=status.HTTP_401_UNAUTHORIZED)






# -------------------- CHANGE PASSWORD --------------------
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def change_password(request):
    """
    Change user password
    POST /api/auth/change-password/
    Required fields: old_password, new_password
    """
    user = request.user
    old_password = request.data.get('old_password')
    new_password = request.data.get('new_password')
    
    if not old_password or not new_password:
        return Response({
            'error': 'Old password and new password are required'
        }, status=status.HTTP_400_BAD_REQUEST)
    
    if not check_password(old_password, user.password):
        return Response({
            'error': 'Old password is incorrect',
            'old_password': ['Old password is incorrect']
        }, status=status.HTTP_400_BAD_REQUEST)
    
    user.set_password(new_password)
    user.save()
    
    return Response({
        'message': 'Password changed successfully'
    }, status=status.HTTP_200_OK)
