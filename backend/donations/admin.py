from django.contrib import admin
from .models import Donation, DonationReceipt


@admin.register(Donation)
class DonationAdmin(admin.ModelAdmin):
    list_display = ['id', 'donor', 'campaign', 'amount', 'status', 'created_at']
    list_filter = ['status', 'payment_method', 'created_at']
    search_fields = ['donor__email', 'campaign__title']
    readonly_fields = ['id', 'created_at', 'updated_at']


@admin.register(DonationReceipt)
class DonationReceiptAdmin(admin.ModelAdmin):
    list_display = ['id', 'receipt_number', 'donation', 'created_at']
    readonly_fields = ['id', 'created_at']
