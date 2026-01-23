from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, IsAdminUser
from rest_framework.response import Response
from rest_framework.pagination import PageNumberPagination
from donations.models import Donation
from accounts.models import User
from campaigns.models import Campaign
from donations.serializers import DonationSerializer
from accounts.serializers import UserSerializer
from campaigns.serializers import CampaignDetailSerializer
from django.db.models import Q, Sum, Count
from datetime import timedelta
from django.utils import timezone


# -------------------- ADMIN VERIFICATION CHECK --------------------
def is_admin(user):
    """Check if user is admin"""
    return user and (user.is_staff or user.is_superuser)


# -------------------- DASHBOARD STATS --------------------
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def admin_dashboard_stats(request):
    """
    Get admin dashboard statistics
    GET /api/admin/stats/
    """
    if not is_admin(request.user):
        return Response({
            'error': 'Admin access required'
        }, status=status.HTTP_403_FORBIDDEN)
    
    # Total stats
    total_users = User.objects.count()
    total_campaigns = Campaign.objects.count()
    total_donations = Donation.objects.count()
    total_amount = Donation.objects.aggregate(Sum('amount'))['amount__sum'] or 0
    
    # Active campaigns
    active_campaigns = Campaign.objects.filter(is_active=True).count()
    
    # Pending donations
    pending_donations = Donation.objects.filter(status='PENDING').count()
    
    # Recent activity (last 30 days)
    thirty_days_ago = timezone.now() - timedelta(days=30)
    activity_last_30_days = Donation.objects.filter(created_at__gte=thirty_days_ago).count()
    amount_last_30_days = Donation.objects.filter(created_at__gte=thirty_days_ago).aggregate(Sum('amount'))['amount__sum'] or 0
    
    return Response({
        'total_users': total_users,
        'total_campaigns': total_campaigns,
        'total_donations': total_donations,
        'total_amount_raised': str(total_amount),
        'active_campaigns': active_campaigns,
        'pending_donations': pending_donations,
        'activity_last_30_days': activity_last_30_days,
        'total_amount_last_30_days': str(amount_last_30_days),
    }, status=status.HTTP_200_OK)


# -------------------- DONATIONS MANAGEMENT --------------------
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def admin_list_donations(request):
    """
    List all donations with filters
    GET /api/admin/donations/?status=PENDING&campaign_id=123&page=1
    """
    if not is_admin(request.user):
        return Response({
            'error': 'Admin access required'
        }, status=status.HTTP_403_FORBIDDEN)
    
    queryset = Donation.objects.all().order_by('-created_at')
    
    # Filters
    status_filter = request.query_params.get('status')
    campaign_id = request.query_params.get('campaign_id')
    
    if status_filter:
        queryset = queryset.filter(status=status_filter)
    
    if campaign_id:
        queryset = queryset.filter(campaign_id=campaign_id)
    
    # Pagination
    paginator = PageNumberPagination()
    paginator.page_size = 20
    paginated_queryset = paginator.paginate_queryset(queryset, request)
    
    serializer = DonationSerializer(paginated_queryset, many=True)
    
    return paginator.get_paginated_response(serializer.data)


@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def admin_approve_donation(request, donation_id):
    """
    Approve a donation
    PUT /api/admin/donations/<donation_id>/approve/
    """
    if not is_admin(request.user):
        return Response({
            'error': 'Admin access required'
        }, status=status.HTTP_403_FORBIDDEN)
    
    try:
        donation = Donation.objects.get(id=donation_id)
    except Donation.DoesNotExist:
        return Response({
            'error': 'Donation not found'
        }, status=status.HTTP_404_NOT_FOUND)
    
    donation.status = 'COMPLETED'
    donation.transaction_id = request.data.get('transaction_id', donation.transaction_id)
    donation.save()
    
    serializer = DonationSerializer(donation)
    
    return Response(serializer.data, status=status.HTTP_200_OK)


@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def admin_reject_donation(request, donation_id):
    """
    Reject a donation
    PUT /api/admin/donations/<donation_id>/reject/
    """
    if not is_admin(request.user):
        return Response({
            'error': 'Admin access required'
        }, status=status.HTTP_403_FORBIDDEN)
    
    try:
        donation = Donation.objects.get(id=donation_id)
    except Donation.DoesNotExist:
        return Response({
            'error': 'Donation not found'
        }, status=status.HTTP_404_NOT_FOUND)
    
    donation.status = 'FAILED'
    donation.save()
    
    serializer = DonationSerializer(donation)
    
    return Response(serializer.data, status=status.HTTP_200_OK)


# -------------------- CAMPAIGNS MANAGEMENT --------------------
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def admin_list_campaigns(request):
    """
    List all campaigns with filters
    GET /api/admin/campaigns/?verified=true&active=true&category=1&page=1
    """
    if not is_admin(request.user):
        return Response({
            'error': 'Admin access required'
        }, status=status.HTTP_403_FORBIDDEN)
    
    queryset = Campaign.objects.all().order_by('-created_at')
    
    # Filters
    verified = request.query_params.get('verified')
    active = request.query_params.get('active')
    category = request.query_params.get('category')
    
    if verified == 'true':
        queryset = queryset.filter(fundtracer_verified=True)
    elif verified == 'false':
        queryset = queryset.filter(fundtracer_verified=False)
    
    if active == 'true':
        queryset = queryset.filter(is_active=True)
    elif active == 'false':
        queryset = queryset.filter(is_active=False)
    
    if category:
        queryset = queryset.filter(category_id=category)
    
    # Pagination
    paginator = PageNumberPagination()
    paginator.page_size = 20
    paginated_queryset = paginator.paginate_queryset(queryset, request)
    
    serializer = CampaignDetailSerializer(
        paginated_queryset,
        many=True,
        context={'request': request}
    )
    
    return paginator.get_paginated_response(serializer.data)


@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def admin_verify_campaign(request, campaign_id):
    """
    Verify/approve a campaign
    PUT /api/admin/campaigns/<campaign_id>/verify/
    """
    if not is_admin(request.user):
        return Response({
            'error': 'Admin access required'
        }, status=status.HTTP_403_FORBIDDEN)
    
    try:
        campaign = Campaign.objects.get(id=campaign_id)
    except Campaign.DoesNotExist:
        return Response({
            'error': 'Campaign not found'
        }, status=status.HTTP_404_NOT_FOUND)
    
    campaign.fundtracer_verified = True
    campaign.save()
    
    serializer = CampaignDetailSerializer(
        campaign,
        context={'request': request}
    )
    
    return Response(serializer.data, status=status.HTTP_200_OK)


@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def admin_reject_campaign(request, campaign_id):
    """
    Reject/unverify a campaign
    PUT /api/admin/campaigns/<campaign_id>/reject/
    """
    if not is_admin(request.user):
        return Response({
            'error': 'Admin access required'
        }, status=status.HTTP_403_FORBIDDEN)
    
    try:
        campaign = Campaign.objects.get(id=campaign_id)
    except Campaign.DoesNotExist:
        return Response({
            'error': 'Campaign not found'
        }, status=status.HTTP_404_NOT_FOUND)
    
    campaign.fundtracer_verified = False
    campaign.is_active = False
    campaign.save()
    
    serializer = CampaignDetailSerializer(
        campaign,
        context={'request': request}
    )
    
    return Response(serializer.data, status=status.HTTP_200_OK)


# -------------------- USERS MANAGEMENT --------------------
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def admin_list_users(request):
    """
    List all users
    GET /api/admin/users/?role=donor&page=1
    """
    if not is_admin(request.user):
        return Response({
            'error': 'Admin access required'
        }, status=status.HTTP_403_FORBIDDEN)
    
    queryset = User.objects.all().order_by('-created_at')
    
    # Filter by role
    role = request.query_params.get('role')
    if role:
        queryset = queryset.filter(role=role)
    
    # Pagination
    paginator = PageNumberPagination()
    paginator.page_size = 20
    paginated_queryset = paginator.paginate_queryset(queryset, request)
    
    serializer = UserSerializer(paginated_queryset, many=True)
    
    return paginator.get_paginated_response(serializer.data)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def admin_get_user_detail(request, user_id):
    """
    Get detailed user information
    GET /api/admin/users/<user_id>/
    """
    if not is_admin(request.user):
        return Response({
            'error': 'Admin access required'
        }, status=status.HTTP_403_FORBIDDEN)
    
    try:
        user = User.objects.get(id=user_id)
    except User.DoesNotExist:
        return Response({
            'error': 'User not found'
        }, status=status.HTTP_404_NOT_FOUND)
    
    # Get user stats
    donations_count = Donation.objects.filter(donor=user).count()
    campaigns_count = Campaign.objects.filter(created_by=user).count()
    total_donated = Donation.objects.filter(donor=user).aggregate(Sum('amount'))['amount__sum'] or 0
    
    serializer = UserSerializer(user)
    
    # Combine user data with stats
    response_data = serializer.data
    response_data['donations_count'] = donations_count
    response_data['campaigns_count'] = campaigns_count
    response_data['total_donated'] = str(total_donated)
    
    return Response(response_data, status=status.HTTP_200_OK)
