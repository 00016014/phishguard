from django.db import models
from django.contrib.auth.models import User
from django.db.models.signals import post_save
from django.dispatch import receiver
from django.utils import timezone

class UserProfile(models.Model):
    ROLE_CHOICES = (
        ('admin', 'Admin'),
        ('user', 'User'),
    )
    TIER_CHOICES = (
        ('free', 'Free'),
        ('pro', 'Pro'),
        ('enterprise', 'Enterprise'),
    )
    STATUS_CHOICES = (
        ('active', 'Active'),
        ('inactive', 'Inactive'),
        ('suspended', 'Suspended'),
    )
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    avatar = models.TextField(null=True, blank=True)
    role = models.CharField(max_length=10, choices=ROLE_CHOICES, default='user')
    tier = models.CharField(max_length=20, choices=TIER_CHOICES, default='free')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='active')
    scans_used = models.IntegerField(default=0)
    scans_limit = models.IntegerField(default=10)
    api_calls_used = models.IntegerField(default=0)
    api_calls_limit = models.IntegerField(default=50)
    alerts_used = models.IntegerField(default=0)
    alerts_limit = models.IntegerField(default=3)
    renewal_date = models.DateField(null=True, blank=True)
    points = models.IntegerField(default=0)
    streak = models.IntegerField(default=0)
    last_activity = models.DateTimeField(auto_now=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return str(self.user.username)

    def get_renewal_date_str(self):
        if self.renewal_date:
            return self.renewal_date.isoformat()
        today = timezone.now().date()
        if today.month == 12:
            next_month = today.replace(year=today.year + 1, month=1, day=1)
        else:
            next_month = today.replace(month=today.month + 1, day=1)
        return next_month.isoformat()

    def apply_tier_limits(self):
        """Set API call / alert / scan limits based on tier."""
        if self.tier == 'pro':
            self.scans_limit = 500
            self.api_calls_limit = 5000
            self.alerts_limit = 9999  # effectively unlimited
        elif self.tier == 'enterprise':
            self.scans_limit = 99999
            self.api_calls_limit = 99999
            self.alerts_limit = 99999
        else:  # free
            self.scans_limit = 10
            self.api_calls_limit = 50
            self.alerts_limit = 3

class DailyCheckIn(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='daily_checkins')
    date = models.DateField()
    points_earned = models.IntegerField(default=5)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('user', 'date')

    def __str__(self):
        return f"{self.user.username} - {self.date}"


@receiver(post_save, sender=User)
def create_user_profile(sender, instance, created, **kwargs):
    if created:
        role = 'admin' if instance.username.lower() == 'admin' else 'user'
        today = timezone.now().date()
        if today.month == 12:
            renewal = today.replace(year=today.year + 1, month=1, day=1)
        else:
            renewal = today.replace(month=today.month + 1, day=1)
        UserProfile.objects.get_or_create(
            user=instance,
            defaults={'role': role, 'renewal_date': renewal}
        )

@receiver(post_save, sender=User)
def save_user_profile(sender, instance, **kwargs):
    if hasattr(instance, 'profile'):
        instance.profile.save()
    else:
        role = 'admin' if instance.username.lower() == 'admin' else 'user'
        UserProfile.objects.get_or_create(user=instance, defaults={'role': role})

class ScanHistory(models.Model):
    TYPE_CHOICES = (
        ('email', 'Email'),
        ('url', 'URL'),
        ('file', 'File'),
        ('qr', 'QR Code'),
    )
    THREAT_LEVEL_CHOICES = (
        ('safe', 'Safe'),
        ('low', 'Low'),
        ('medium', 'Medium'),
        ('high', 'High'),
        ('critical', 'Critical'),
    )
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='scans')
    type = models.CharField(max_length=20, choices=TYPE_CHOICES)
    content = models.TextField()
    threat_level = models.CharField(max_length=20, choices=THREAT_LEVEL_CHOICES)
    score = models.IntegerField()
    details = models.JSONField(default=list)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.user.username} - {self.type} - {self.threat_level}"

class ThreatReport(models.Model):
    STATUS_CHOICES = (
        ('pending', 'Pending'),
        ('approved', 'Approved'),
        ('rejected', 'Rejected'),
        ('investigating', 'Investigating'),
        ('resolved', 'Resolved'),
    )
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='reports')
    title = models.CharField(max_length=255)
    description = models.TextField()
    threat_type = models.CharField(max_length=100)
    risk_level = models.CharField(max_length=50)
    evidence = models.TextField(blank=True, null=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return str(self.title)

class LearningModule(models.Model):
    TYPE_CHOICES = (
        ('Quiz', 'Quiz'),
        ('Simulation', 'Simulation'),
        ('Assessment', 'Assessment'),
    )
    DIFFICULTY_CHOICES = (
        ('Beginner', 'Beginner'),
        ('Intermediate', 'Intermediate'),
        ('Advanced', 'Advanced'),
        ('Expert', 'Expert'),
    )
    title = models.CharField(max_length=255)
    description = models.TextField()
    type = models.CharField(max_length=20, choices=TYPE_CHOICES, default='Quiz')
    difficulty = models.CharField(max_length=20, choices=DIFFICULTY_CHOICES, default='Beginner')
    duration = models.CharField(max_length=20, default='15 min')
    points = models.IntegerField(default=100)
    icon = models.CharField(max_length=50, default='AcademicCapIcon')
    content_data = models.JSONField(default=dict)
    
    def __str__(self):
        return str(self.title)

class Bookmark(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='bookmarks')
    threat_id = models.CharField(max_length=100)
    threat_title = models.CharField(max_length=255)
    threat_type = models.CharField(max_length=100, blank=True)
    threat_severity = models.CharField(max_length=50, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('user', 'threat_id')

    def __str__(self):
        return f"{self.user.username} - {self.threat_title}"


class MitigatedThreat(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='mitigated_threats')
    threat_id = models.CharField(max_length=100)
    threat_title = models.CharField(max_length=255)
    threat_type = models.CharField(max_length=100, blank=True)
    threat_severity = models.CharField(max_length=50, blank=True)
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('user', 'threat_id')

    def __str__(self):
        return f"{self.user.username} mitigated {self.threat_title}"


class CustomAlert(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='alerts')
    title = models.CharField(max_length=255)
    keyword = models.CharField(max_length=100)
    threat_type = models.CharField(max_length=100, blank=True)
    min_severity = models.CharField(max_length=50, blank=True)
    active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.user.username} - {self.title}"


class LearningProgress(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='learning_progress')
    module = models.ForeignKey(LearningModule, on_delete=models.CASCADE)
    completed = models.BooleanField(default=False)
    score = models.IntegerField(default=0)
    completed_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        unique_together = ('user', 'module')

    def __str__(self):
        return f"{self.user.username} - {self.module.title if self.module else 'Unknown'}"

class SystemLog(models.Model):
    LEVEL_CHOICES = (
        ('INFO', 'INFO'),
        ('WARN', 'WARN'),
        ('ERROR', 'ERROR'),
    )
    level = models.CharField(max_length=10, choices=LEVEL_CHOICES, default='INFO')
    message = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.level}: {self.message[:50]}"


class OTPCode(models.Model):
    PURPOSE_REGISTRATION = 'registration'
    PURPOSE_PASSWORD_RESET = 'password_reset'
    PURPOSE_CHOICES = (
        (PURPOSE_REGISTRATION, 'Registration'),
        (PURPOSE_PASSWORD_RESET, 'Password Reset'),
    )
    email = models.EmailField()
    code = models.CharField(max_length=6)
    purpose = models.CharField(max_length=20, choices=PURPOSE_CHOICES)
    pending_data = models.JSONField(null=True, blank=True)
    is_used = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    expires_at = models.DateTimeField()

    class Meta:
        indexes = [models.Index(fields=['email', 'purpose', 'is_used'])]

    def __str__(self):
        return f"{self.email} [{self.purpose}] {'used' if self.is_used else 'active'}"
