from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from rest_framework.pagination import PageNumberPagination
from donations.models import Donation, DonationReceipt
from donations.serializers import DonationSerializer, DonationCreateSerializer, DonationReceiptSerializer
from campaigns.models import Campaign
from django.db import transaction


# -------------------- DEBUG - COUNT USER DONATIONS --------------------
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_donation_count(request):
    """
    Debug endpoint to check donation count
    GET /api/donations/count/
    """
    donations = Donation.objects.filter(donor=request.user)
    return Response({
        'total_donations': donations.count(),
        'user_id': request.user.id,
        'user_email': request.user.email,
    }, status=status.HTTP_200_OK)


# -------------------- CREATE DONATION --------------------
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_donation(request):
    """
    Create a new donation
    POST /api/donations/
    """
    serializer = DonationCreateSerializer(
        data=request.data,
        context={'request': request}
    )
    
    if serializer.is_valid():
        # Get campaign object (already deserialized by DRF)
        campaign = serializer.validated_data.get('campaign')
        
        if not campaign:
            return Response({
                'error': 'Campaign not found'
            }, status=status.HTTP_404_NOT_FOUND)
        
        donation = serializer.save()
        
        # Update campaign raised amount
        with transaction.atomic():
            campaign.raised_amount += donation.amount
            campaign.save()
        
        response_serializer = DonationSerializer(donation)
        
        return Response({
            'message': 'Donation created successfully',
            'data': response_serializer.data
        }, status=status.HTTP_201_CREATED)
    
    return Response({
        'error': 'Donation creation failed',
        'errors': serializer.errors
    }, status=status.HTTP_400_BAD_REQUEST)


# -------------------- GET USER DONATIONS --------------------
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_user_donations(request):
    """
    Get current user's donation history
    GET /api/donations/my-donations/
    """
    donations = Donation.objects.filter(donor=request.user)
    
    # Pagination
    paginator = PageNumberPagination()
    paginator.page_size = 10
    paginated_queryset = paginator.paginate_queryset(donations, request)
    
    serializer = DonationSerializer(paginated_queryset, many=True)
    
    return paginator.get_paginated_response(serializer.data)


# -------------------- GET CAMPAIGN DONATIONS --------------------
@api_view(['GET'])
@permission_classes([AllowAny])
def get_campaign_donations(request, id=None, campaign_id=None):
    """
    Get all donations for a campaign
    GET /api/campaigns/<id>/donations/
    """
    # Accept both 'id' and 'campaign_id' parameters
    campaign_identifier = id or campaign_id
    
    if not campaign_identifier:
        return Response({
            'error': 'Campaign ID is required'
        }, status=status.HTTP_400_BAD_REQUEST)
    
    try:
        campaign = Campaign.objects.get(id=campaign_identifier)
    except Campaign.DoesNotExist:
        return Response({
            'error': 'Campaign not found'
        }, status=status.HTTP_404_NOT_FOUND)
    
    # Get recent donations, excluding anonymous ones for display
    donations = Donation.objects.filter(
        campaign=campaign
    ).exclude(is_anonymous=True).order_by('-created_at')
    
    # Pagination
    paginator = PageNumberPagination()
    paginator.page_size = 10
    paginated_queryset = paginator.paginate_queryset(donations, request)
    
    serializer = DonationSerializer(paginated_queryset, many=True)
    
    return paginator.get_paginated_response(serializer.data)


# -------------------- GET DONATION DETAILS --------------------
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_donation_detail(request, donation_id):
    """
    Get donation details
    GET /api/donations/<id>/
    """
    try:
        donation = Donation.objects.get(id=donation_id)
    except Donation.DoesNotExist:
        return Response({
            'error': 'Donation not found'
        }, status=status.HTTP_404_NOT_FOUND)
    
    # Check if user is the donor
    if donation.donor != request.user:
        return Response({
            'error': 'You do not have permission to view this donation'
        }, status=status.HTTP_403_FORBIDDEN)
    
    serializer = DonationSerializer(donation)
    
    return Response({
        'message': 'Donation retrieved successfully',
        'data': serializer.data
    }, status=status.HTTP_200_OK)


# -------------------- UPDATE DONATION STATUS --------------------
@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def update_donation_status(request, donation_id):
    """
    Update donation status (for admin/payment gateway)
    PUT /api/donations/<id>/status/
    """
    try:
        donation = Donation.objects.get(id=donation_id)
    except Donation.DoesNotExist:
        return Response({
            'error': 'Donation not found'
        }, status=status.HTTP_404_NOT_FOUND)
    
    # Check if user is the donor
    if donation.donor != request.user:
        return Response({
            'error': 'You do not have permission to update this donation'
        }, status=status.HTTP_403_FORBIDDEN)
    
    status_update = request.data.get('status')
    transaction_id = request.data.get('transaction_id')
    
    if status_update in ['PENDING', 'COMPLETED', 'FAILED', 'REFUNDED']:
        with transaction.atomic():
            # If status is changing to COMPLETED, update campaign raised amount
            if status_update == 'COMPLETED' and donation.status != 'COMPLETED':
                donation.campaign.raised_amount += donation.amount
                donation.campaign.save()
            
            donation.status = status_update
            if transaction_id:
                donation.transaction_id = transaction_id
            donation.save()
    else:
        return Response({
            'error': 'Invalid status'
        }, status=status.HTTP_400_BAD_REQUEST)
    
    serializer = DonationSerializer(donation)
    
    return Response({
        'message': 'Donation status updated successfully',
        'data': serializer.data
    }, status=status.HTTP_200_OK)
