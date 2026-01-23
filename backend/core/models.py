import uuid
from django.db import models
from django.conf import settings
from campaigns.models import Campaign


class Notification(models.Model):
    """Notifications for donors and campaign creators"""
    NOTIFICATION_TYPES = [
        ('MILESTONE_UPLOADED', 'Milestone Uploaded'),
        ('MILESTONE_OVERDUE', 'Milestone Overdue'),
        ('CAMPAIGN_FUNDED', 'Campaign Funded'),
        ('DONATION_RECEIVED', 'Donation Received'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    recipient = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='notifications')
    campaign = models.ForeignKey(Campaign, on_delete=models.CASCADE, null=True, blank=True)
    notification_type = models.CharField(max_length=50, choices=NOTIFICATION_TYPES)
    title = models.CharField(max_length=255)
    message = models.TextField()
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.notification_type} - {self.title}"

    def mark_as_read(self):
        """Mark notification as read"""
        self.is_read = True
        self.save()
