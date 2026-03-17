from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('content', '0003_threatreportsummary_threat_link'),
    ]

    operations = [
        migrations.AddField(
            model_name='learningmodulehighlight',
            name='link',
            field=models.CharField(blank=True, default='/interactive-learning-lab', max_length=255),
        ),
    ]
