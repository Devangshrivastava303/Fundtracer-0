import uuid
from django.db import models
from django.conf import settings
from campaigns.models import Campaign


class Donation(models.Model):
    PAYMENT_STATUS = (
        ('PENDING', 'Pending'),
        ('COMPLETED', 'Completed'),
        ('FAILED', 'Failed'),
        ('REFUNDED', 'Refunded'),
    )

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    
    donor = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='donations')
    campaign = models.ForeignKey(Campaign, on_delete=models.CASCADE, related_name='donations')
    
    amount = models.DecimalField(max_digits=12, decimal_places=2)
    payment_method = models.CharField(max_length=50, default='card')  # card, upi, netbanking
    
    status = models.CharField(max_length=20, choices=PAYMENT_STATUS, default='PENDING')
    transaction_id = models.CharField(max_length=255, unique=True, null=True, blank=True)
    
    message = models.TextField(null=True, blank=True)
    is_anonymous = models.BooleanField(default=False)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.donor.email} - ${self.amount} to {self.campaign.title}"


class DonationReceipt(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    donation = models.OneToOneField(Donation, on_delete=models.CASCADE, related_name='receipt')
    
    receipt_number = models.CharField(max_length=255, unique=True)
    receipt_pdf = models.FileField(upload_to='receipts/')
    
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"Receipt - {self.receipt_number}"
