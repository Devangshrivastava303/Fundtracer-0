import uuid
from django.db import models
from django.conf import settings


class CampaignCategory(models.Model):
    name = models.CharField(max_length=100, unique=True)
    description = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name_plural = "Campaign Categories"
        ordering = ['name']

    def __str__(self):
        return self.name


class NGO(models.Model):
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    registration_number = models.CharField(max_length=100)
    documents = models.TextField()
    is_verified = models.BooleanField(default=False)

    def __str__(self):
        return self.registration_number


class Campaign(models.Model):
    CAMPAIGN_TYPE_CHOICES = [
        ('INDIVIDUAL', 'Individual'),
        ('NGO', 'NGO'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    title = models.CharField(max_length=255)
    description = models.TextField()
    goal_amount = models.DecimalField(max_digits=12, decimal_places=2)
    raised_amount = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    campaign_type = models.CharField(max_length=20, choices=CAMPAIGN_TYPE_CHOICES)
    category = models.ForeignKey(CampaignCategory, on_delete=models.PROTECT)
    is_active = models.BooleanField()
    image = models.ImageField(upload_to='campaigns/', null=True, blank=True)
    fundtracer_verified = models.BooleanField(default=False)
    documents_verified = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    created_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='campaigns')

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return self.title

    @property
    def progress_percentage(self):
        if self.goal_amount > 0:
            return (self.raised_amount / self.goal_amount) * 100
        return 0
