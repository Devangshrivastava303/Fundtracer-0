# Notification utilities and helper functions
from core.models import Notification


def create_notification(recipient, campaign, notification_type, title, message):
    """Helper function to create a notification"""
    return Notification.objects.create(
        recipient=recipient,
        campaign=campaign,
        notification_type=notification_type,
        title=title,
        message=message,
    )


def notify_donors(campaign, notification_type, title, message):
    """Notify all donors of a campaign"""
    donors = campaign.donations.values_list('donor', flat=True).distinct()
    notifications = []
    
    for donor_id in donors:
        notifications.append(
            Notification(
                recipient_id=donor_id,
                campaign=campaign,
                notification_type=notification_type,
                title=title,
                message=message,
            )
        )
    
    if notifications:
        Notification.objects.bulk_create(notifications)

