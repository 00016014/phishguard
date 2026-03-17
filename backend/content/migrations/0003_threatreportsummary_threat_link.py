from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('content', '0002_pricingfeature_pricingplan'),
    ]

    operations = [
        migrations.AddField(
            model_name='threatreportsummary',
            name='threat_link',
            field=models.CharField(
                blank=True,
                default='',
                max_length=100,
                help_text='threat_id of the linked ThreatIntelligence entry (e.g. threat-001). Leave blank to link to the database index.',
            ),
            preserve_default=False,
        ),
    ]
