from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from rest_framework.pagination import PageNumberPagination
from campaigns.models import Campaign, CampaignLike
from campaigns.serializers import (
    CampaignListSerializer, CampaignDetailSerializer,
    CampaignCreateUpdateSerializer, CampaignCategorySerializer
)
from core.permissions import IsOwner, IsNGO
from django.db.models import Q


# -------------------- LIST CAMPAIGNS --------------------
@api_view(['GET'])
@permission_classes([AllowAny])
def list_campaigns(request):
    """
    List all campaigns with pagination and filtering
    GET /api/campaigns/
    Query parameters: ?page=1&category=medical&search=title&status=active&created_by=me
    """
    queryset = Campaign.objects.all()
    
    # Filters
    category = request.query_params.get('category')
    status_filter = request.query_params.get('status')
    search = request.query_params.get('search')
    created_by = request.query_params.get('created_by')
    
    # Filter by created_by=me for authenticated users
    if created_by == 'me' and request.user.is_authenticated:
        queryset = queryset.filter(created_by=request.user)
    
    if category:
        queryset = queryset.filter(category=category)
    
    if status_filter == 'active':
        queryset = queryset.filter(is_active=True)
    elif status_filter == 'inactive':
        queryset = queryset.filter(is_active=False)
    
    if search:
        queryset = queryset.filter(
            Q(title__icontains=search) |
            Q(description__icontains=search)
        )
    
    # Pagination
    paginator = PageNumberPagination()
    paginator.page_size = 10
    paginated_queryset = paginator.paginate_queryset(queryset, request)
    
    serializer = CampaignListSerializer(paginated_queryset, many=True)
    
    return paginator.get_paginated_response(serializer.data)


# -------------------- GET CAMPAIGN DETAILS --------------------
@api_view(['GET'])
@permission_classes([AllowAny])
def get_campaign(request, id):
    """
    Get campaign details
    GET /api/campaigns/<id>/
    """
    try:
        campaign = Campaign.objects.get(id=id)
    except Campaign.DoesNotExist:
        return Response({
            'error': 'Campaign not found'
        }, status=status.HTTP_404_NOT_FOUND)
    
    serializer = CampaignDetailSerializer(
        campaign,
        context={'request': request}
    )
    
    return Response({
        'message': 'Campaign retrieved successfully',
        'data': serializer.data
    }, status=status.HTTP_200_OK)


# -------------------- CREATE CAMPAIGN --------------------
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_campaign(request):
    """
    Create new campaign (both Donors and NGOs)
    POST /api/campaigns/create/
    """
    serializer = CampaignCreateUpdateSerializer(
        data=request.data,
        context={'request': request}
    )
    
    if serializer.is_valid():
        campaign = serializer.save()
        response_serializer = CampaignDetailSerializer(
            campaign,
            context={'request': request}
        )
        
        return Response({
            'message': 'Campaign created successfully',
            'data': response_serializer.data
        }, status=status.HTTP_201_CREATED)
    
    return Response({
        'error': 'Campaign creation failed',
        'errors': serializer.errors
    }, status=status.HTTP_400_BAD_REQUEST)


# -------------------- UPDATE CAMPAIGN --------------------
@api_view(['PUT'])
@permission_classes([IsAuthenticated, IsOwner])
def update_campaign(request, id):
    """
    Update campaign (owner only)
    PUT /api/campaigns/<id>/update/
    """
    try:
        campaign = Campaign.objects.get(id=id)
    except Campaign.DoesNotExist:
        return Response({
            'error': 'Campaign not found'
        }, status=status.HTTP_404_NOT_FOUND)
    
    # Check ownership
    if campaign.created_by != request.user:
        return Response({
            'error': 'You do not have permission to update this campaign'
        }, status=status.HTTP_403_FORBIDDEN)
    
    serializer = CampaignCreateUpdateSerializer(
        campaign,
        data=request.data,
        partial=True,
        context={'request': request}
    )
    
    if serializer.is_valid():
        campaign = serializer.save()
        response_serializer = CampaignDetailSerializer(
            campaign,
            context={'request': request}
        )
        
        return Response({
            'message': 'Campaign updated successfully',
            'data': response_serializer.data
        }, status=status.HTTP_200_OK)
    
    return Response({
        'error': 'Campaign update failed',
        'errors': serializer.errors
    }, status=status.HTTP_400_BAD_REQUEST)


# -------------------- DELETE CAMPAIGN --------------------
@api_view(['DELETE'])
@permission_classes([IsAuthenticated, IsOwner])
def delete_campaign(request, id):
    """
    Delete campaign (owner only)
    DELETE /api/campaigns/<id>/delete/
    """
    try:
        campaign = Campaign.objects.get(id=id)
    except Campaign.DoesNotExist:
        return Response({
            'error': 'Campaign not found'
        }, status=status.HTTP_404_NOT_FOUND)
    
    # Check ownership
    if campaign.created_by != request.user:
        return Response({
            'error': 'You do not have permission to delete this campaign'
        }, status=status.HTTP_403_FORBIDDEN)
    
    campaign.delete()
    
    return Response({
        'message': 'Campaign deleted successfully'
    }, status=status.HTTP_204_NO_CONTENT)


# -------------------- GET CAMPAIGN STATS --------------------
@api_view(['GET'])
@permission_classes([AllowAny])
def get_campaign_stats(request, id):
    """
    Get campaign statistics
    GET /api/campaigns/<id>/stats/
    """
    try:
        campaign = Campaign.objects.get(id=id)
    except Campaign.DoesNotExist:
        return Response({
            'error': 'Campaign not found'
        }, status=status.HTTP_404_NOT_FOUND)
    
    progress = 0
    if campaign.goal_amount > 0:
        progress = round((campaign.raised_amount / campaign.goal_amount) * 100, 2)
    
    return Response({
        'message': 'Campaign stats retrieved successfully',
        'data': {
            'campaign_id': str(campaign.id),
            'title': campaign.title,
            'goal_amount': float(campaign.goal_amount),
            'raised_amount': float(campaign.raised_amount),
            'remaining_amount': float(campaign.goal_amount - campaign.raised_amount),
            'progress_percentage': progress,
            'is_active': campaign.is_active
        }
    }, status=status.HTTP_200_OK)


# -------------------- LIST CATEGORIES --------------------
@api_view(['GET'])
@permission_classes([AllowAny])
def list_categories(request):
    """
    List all campaign categories
    GET /api/categories/
    """
    from campaigns.models import CampaignCategory
    
    categories = CampaignCategory.objects.all()
    serializer = CampaignCategorySerializer(categories, many=True)
    
    return Response({
        'message': 'Categories retrieved successfully',
        'data': serializer.data
    }, status=status.HTTP_200_OK)


# -------------------- TOGGLE CAMPAIGN LIKE/UNLIKE --------------------
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def toggle_campaign_like(request, id):
    """
    Toggle campaign like status (add to wishlist or unlike)
    POST /api/campaigns/<id>/like/
    """
    try:
        campaign = Campaign.objects.get(id=id)
    except Campaign.DoesNotExist:
        return Response({
            'error': 'Campaign not found'
        }, status=status.HTTP_404_NOT_FOUND)
    
    like_obj, created = CampaignLike.objects.get_or_create(
        user=request.user,
        campaign=campaign
    )
    
    if not created:
        # Unlike the campaign
        like_obj.delete()
        return Response({
            'message': 'Campaign removed from wishlist',
            'is_liked': False,
            'likes_count': campaign.likes.count()
        }, status=status.HTTP_200_OK)
    else:
        # Like the campaign
        return Response({
            'message': 'Campaign added to wishlist',
            'is_liked': True,
            'likes_count': campaign.likes.count()
        }, status=status.HTTP_200_OK)


# -------------------- GET USER'S LIKED CAMPAIGNS --------------------
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_user_liked_campaigns(request):
    """
    Get all campaigns liked/wishlisted by the current user
    GET /api/campaigns/wishlist/
    """
    liked_campaigns = Campaign.objects.filter(
        likes__user=request.user
    ).distinct()
    
    # Pagination
    paginator = PageNumberPagination()
    paginator.page_size = 10
    paginated_queryset = paginator.paginate_queryset(liked_campaigns, request)
    
    serializer = CampaignListSerializer(
        paginated_queryset,
        many=True,
        context={'request': request}
    )
    
    return paginator.get_paginated_response(serializer.data)
