from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from campaigns.models import Campaign, Milestone
from campaigns.serializers import MilestoneSerializer, MilestoneDetailSerializer
from core.models import Notification
from django.utils import timezone
from django.db import transaction


# -------------------- GET/CREATE MILESTONES FOR CAMPAIGN --------------------
@api_view(['GET', 'POST'])
@permission_classes([AllowAny])
def milestones_list_create(request, campaign_id):
    """
    GET: Get all milestones for a campaign (public)
    POST: Create a new milestone for a campaign (creator only)
    /api/campaigns/<campaign_id>/milestones/
    """
    try:
        campaign = Campaign.objects.get(id=campaign_id)
    except Campaign.DoesNotExist:
        return Response({
            'error': 'Campaign not found'
        }, status=status.HTTP_404_NOT_FOUND)

    # Handle GET request
    if request.method == 'GET':
        milestones = Milestone.objects.filter(campaign=campaign).order_by('order')
        serializer = MilestoneSerializer(milestones, many=True)

        return Response({
            'message': 'Milestones retrieved successfully',
            'data': serializer.data
        }, status=status.HTTP_200_OK)

    # Handle POST request
    elif request.method == 'POST':
        # Check authentication for POST
        if not request.user or not request.user.is_authenticated:
            return Response({
                'error': 'Authentication credentials were not provided'
            }, status=status.HTTP_401_UNAUTHORIZED)
        
        # Check if user is campaign creator
        if campaign.created_by != request.user:
            return Response({
                'error': 'You do not have permission to add milestones to this campaign'
            }, status=status.HTTP_403_FORBIDDEN)

        serializer = MilestoneSerializer(data=request.data)

        if serializer.is_valid():
            # Get the next order number
            last_milestone = Milestone.objects.filter(campaign=campaign).order_by('-order').first()
            next_order = (last_milestone.order + 1) if last_milestone else 1

            milestone = serializer.save(campaign=campaign, order=next_order)

            return Response({
                'message': 'Milestone created successfully',
                'data': MilestoneDetailSerializer(milestone).data
            }, status=status.HTTP_201_CREATED)

        return Response({
            'error': 'Milestone creation failed',
            'errors': serializer.errors
        }, status=status.HTTP_400_BAD_REQUEST)


# -------------------- GET MILESTONES FOR CAMPAIGN --------------------
@api_view(['GET'])
@permission_classes([AllowAny])
def get_campaign_milestones(request, campaign_id):
    """
    Get all milestones for a campaign
    GET /api/campaigns/<campaign_id>/milestones/
    """
    try:
        campaign = Campaign.objects.get(id=campaign_id)
    except Campaign.DoesNotExist:
        return Response({
            'error': 'Campaign not found'
        }, status=status.HTTP_404_NOT_FOUND)

    milestones = Milestone.objects.filter(campaign=campaign).order_by('order')
    serializer = MilestoneSerializer(milestones, many=True)

    return Response({
        'message': 'Milestones retrieved successfully',
        'data': serializer.data
    }, status=status.HTTP_200_OK)


# -------------------- CREATE MILESTONE --------------------
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_milestone(request, campaign_id):
    """
    Create a new milestone for a campaign
    POST /api/campaigns/<campaign_id>/milestones/
    """
    try:
        campaign = Campaign.objects.get(id=campaign_id)
    except Campaign.DoesNotExist:
        return Response({
            'error': 'Campaign not found'
        }, status=status.HTTP_404_NOT_FOUND)

    # Check if user is campaign creator
    if campaign.created_by != request.user:
        return Response({
            'error': 'You do not have permission to add milestones to this campaign'
        }, status=status.HTTP_403_FORBIDDEN)

    serializer = MilestoneSerializer(data=request.data)

    if serializer.is_valid():
        # Get the next order number
        last_milestone = Milestone.objects.filter(campaign=campaign).order_by('-order').first()
        next_order = (last_milestone.order + 1) if last_milestone else 1

        milestone = serializer.save(campaign=campaign, order=next_order)

        return Response({
            'message': 'Milestone created successfully',
            'data': MilestoneDetailSerializer(milestone).data
        }, status=status.HTTP_201_CREATED)

    return Response({
        'error': 'Milestone creation failed',
        'errors': serializer.errors
    }, status=status.HTTP_400_BAD_REQUEST)


# -------------------- UPDATE MILESTONE --------------------
@api_view(['PUT', 'PATCH'])
@permission_classes([IsAuthenticated])
def update_milestone(request, campaign_id, milestone_id):
    """
    Update a milestone
    PUT/PATCH /api/campaigns/<campaign_id>/milestones/<milestone_id>/
    """
    try:
        campaign = Campaign.objects.get(id=campaign_id)
        milestone = Milestone.objects.get(id=milestone_id, campaign=campaign)
    except (Campaign.DoesNotExist, Milestone.DoesNotExist):
        return Response({
            'error': 'Campaign or milestone not found'
        }, status=status.HTTP_404_NOT_FOUND)

    # Check if user is campaign creator
    if campaign.created_by != request.user:
        return Response({
            'error': 'You do not have permission to update this milestone'
        }, status=status.HTTP_403_FORBIDDEN)

    serializer = MilestoneSerializer(milestone, data=request.data, partial=True)

    if serializer.is_valid():
        milestone = serializer.save()
        return Response({
            'message': 'Milestone updated successfully',
            'data': MilestoneDetailSerializer(milestone).data
        }, status=status.HTTP_200_OK)

    return Response({
        'error': 'Milestone update failed',
        'errors': serializer.errors
    }, status=status.HTTP_400_BAD_REQUEST)


# -------------------- COMPLETE MILESTONE --------------------
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def complete_milestone(request, campaign_id, milestone_id):
    """
    Mark a milestone as completed with image upload and notify donors
    POST /api/campaigns/<campaign_id>/milestones/<milestone_id>/complete/
    Expected: multipart/form-data with 'image' field
    """
    try:
        campaign = Campaign.objects.get(id=campaign_id)
        milestone = Milestone.objects.get(id=milestone_id, campaign=campaign)
    except (Campaign.DoesNotExist, Milestone.DoesNotExist):
        return Response({
            'error': 'Campaign or milestone not found'
        }, status=status.HTTP_404_NOT_FOUND)

    # Check if user is campaign creator
    if campaign.created_by != request.user:
        return Response({
            'error': 'You do not have permission to complete this milestone'
        }, status=status.HTTP_403_FORBIDDEN)

    # Check if image is provided
    if 'image' not in request.FILES:
        return Response({
            'error': 'Image file is required to complete milestone'
        }, status=status.HTTP_400_BAD_REQUEST)

    image_file = request.FILES['image']
    
    # Validate file size (max 10MB)
    if image_file.size > 10 * 1024 * 1024:
        return Response({
            'error': 'Image file size must be less than 10MB'
        }, status=status.HTTP_400_BAD_REQUEST)

    with transaction.atomic():
        milestone.image = image_file
        milestone.is_completed = True
        milestone.completed_at = timezone.now()
        milestone.save()

        # Notify all donors about the milestone completion
        donors = campaign.donations.values_list('donor', flat=True).distinct()

        for donor_id in donors:
            Notification.objects.create(
                recipient_id=donor_id,
                campaign=campaign,
                notification_type='MILESTONE_UPLOADED',
                title=f'Milestone Completed: {milestone.title}',
                message=f'The campaign "{campaign.title}" has uploaded a new milestone: {milestone.title}. {milestone.description}',
            )

    return Response({
        'message': 'Milestone completed successfully with image and donors notified',
        'data': MilestoneDetailSerializer(milestone).data
    }, status=status.HTTP_200_OK)


# -------------------- GET MILESTONE DETAILS --------------------
@api_view(['GET'])
@permission_classes([AllowAny])
def get_milestone_detail(request, campaign_id, milestone_id):
    """
    Get details of a specific milestone
    GET /api/campaigns/<campaign_id>/milestones/<milestone_id>/
    """
    try:
        campaign = Campaign.objects.get(id=campaign_id)
        milestone = Milestone.objects.get(id=milestone_id, campaign=campaign)
    except (Campaign.DoesNotExist, Milestone.DoesNotExist):
        return Response({
            'error': 'Campaign or milestone not found'
        }, status=status.HTTP_404_NOT_FOUND)

    serializer = MilestoneDetailSerializer(milestone)
    return Response({
        'message': 'Milestone retrieved successfully',
        'data': serializer.data
    }, status=status.HTTP_200_OK)


# -------------------- DELETE MILESTONE --------------------
@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def delete_milestone(request, campaign_id, milestone_id):
    """
    Delete a milestone
    DELETE /api/campaigns/<campaign_id>/milestones/<milestone_id>/
    """
    try:
        campaign = Campaign.objects.get(id=campaign_id)
        milestone = Milestone.objects.get(id=milestone_id, campaign=campaign)
    except (Campaign.DoesNotExist, Milestone.DoesNotExist):
        return Response({
            'error': 'Campaign or milestone not found'
        }, status=status.HTTP_404_NOT_FOUND)

    # Check if user is campaign creator
    if campaign.created_by != request.user:
        return Response({
            'error': 'You do not have permission to delete this milestone'
        }, status=status.HTTP_403_FORBIDDEN)

    milestone.delete()

    return Response({
        'message': 'Milestone deleted successfully'
    }, status=status.HTTP_204_NO_CONTENT)
