# Generated migration to add campaign categories data

from django.db import migrations


def add_categories(apps, schema_editor):
    """Add default campaign categories"""
    CampaignCategory = apps.get_model('campaigns', 'CampaignCategory')
    
    categories = [
        {
            'name': 'Education',
            'description': 'Education campaigns for schools and learning'
        },
        {
            'name': 'Medical',
            'description': 'Medical campaigns for health and treatment'
        },
        {
            'name': 'Disaster Relief',
            'description': 'Disaster relief campaigns'
        },
        {
            'name': 'Stray Welfare',
            'description': 'Campaigns for stray animals welfare'
        },
        {
            'name': 'Environment',
            'description': 'Environmental and conservation campaigns'
        },
    ]
    
    for category in categories:
        CampaignCategory.objects.get_or_create(
            name=category['name'],
            defaults={'description': category['description']}
        )


def remove_categories(apps, schema_editor):
    """Remove categories if migration is reversed"""
    CampaignCategory = apps.get_model('campaigns', 'CampaignCategory')
    CampaignCategory.objects.all().delete()


class Migration(migrations.Migration):

    dependencies = [
        ('campaigns', '0004_campaign_fundtracer_verified_campaign_image'),
    ]

    operations = [
        migrations.RunPython(add_categories, remove_categories),
    ]
