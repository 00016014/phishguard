from django.db import models

class LiveStat(models.Model):
    title = models.CharField(max_length=100)
    value = models.CharField(max_length=50)
    
    def __str__(self):
        return str(self.title)

class TrustSignal(models.Model):
    TYPE_CHOICES = (
        ('certification', 'Certification'),
        ('award', 'Award'),
        ('partnership', 'Partnership'),
    )
    type = models.CharField(max_length=20, choices=TYPE_CHOICES)
    name = models.CharField(max_length=255)
    description = models.TextField()
    logo = models.URLField()
    alt = models.CharField(max_length=255)
    
    def __str__(self):
        return str(self.name)

class Feature(models.Model):
    icon = models.CharField(max_length=100)
    title = models.CharField(max_length=255)
    description = models.TextField()
    link = models.CharField(max_length=255)
    color = models.CharField(max_length=50)
    order = models.IntegerField(default=0)
    
    class Meta:
        ordering = ['order']
        
    def __str__(self):
        return str(self.title)

class ThreatReportSummary(models.Model):
    SEVERITY_CHOICES = (
        ('critical', 'Critical'),
        ('high', 'High'),
        ('medium', 'Medium'),
        ('low', 'Low'),
    )
    title = models.CharField(max_length=255)
    category = models.CharField(max_length=100)
    severity = models.CharField(max_length=20, choices=SEVERITY_CHOICES)
    date = models.CharField(max_length=100)
    description = models.TextField()
    affected_users = models.CharField(max_length=50)
    threat_link = models.CharField(
        max_length=100,
        blank=True,
        help_text='threat_id of the linked ThreatIntelligence entry (e.g. threat-001). Leave blank to link to the database index.',
    )
    
    def __str__(self):
        return str(self.title)

class Testimonial(models.Model):
    name = models.CharField(max_length=255)
    role = models.CharField(max_length=255)
    company = models.CharField(max_length=255)
    image = models.URLField()
    alt = models.CharField(max_length=255)
    quote = models.TextField()
    rating = models.IntegerField(default=5)
    
    def __str__(self):
        return str(self.name)

class LearningModuleHighlight(models.Model):
    LEVEL_CHOICES = (
        ('beginner', 'Beginner'),
        ('intermediate', 'Intermediate'),
        ('advanced', 'Advanced'),
    )
    title = models.CharField(max_length=255)
    description = models.TextField()
    duration = models.CharField(max_length=50)
    level = models.CharField(max_length=20, choices=LEVEL_CHOICES)
    image = models.URLField()
    alt = models.CharField(max_length=255)
    completions = models.CharField(max_length=50)
    rating = models.FloatField()
    link = models.CharField(max_length=255, blank=True, default='/interactive-learning-lab')

    def __str__(self):
        return str(self.title)

class ThreatIntelligence(models.Model):
    SEVERITY_CHOICES = (
        ('critical', 'Critical'),
        ('high', 'High'),
        ('medium', 'Medium'),
        ('low', 'Low'),
    )
    STATUS_CHOICES = (
        ('active', 'Active'),
        ('mitigated', 'Mitigated'),
        ('archived', 'Archived'),
    )
    threat_id = models.CharField(max_length=50, unique=True)
    title = models.CharField(max_length=255)
    type = models.CharField(max_length=100)
    severity = models.CharField(max_length=20, choices=SEVERITY_CHOICES)
    detected_date = models.CharField(max_length=100)
    affected_users = models.IntegerField()
    description = models.TextField()
    image = models.URLField()
    alt = models.CharField(max_length=255)
    origin = models.CharField(max_length=100)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES)
    community_reports = models.IntegerField(default=0)
    detailed_analysis = models.TextField()
    prevention_tips = models.JSONField(default=list)
    real_world_examples = models.JSONField(default=list)
    related_threats = models.JSONField(default=list)
    community_insights = models.JSONField(default=list)
    
    def __str__(self):
        return str(self.title)

class PricingPlan(models.Model):
    plan_id = models.CharField(max_length=50, unique=True)
    name = models.CharField(max_length=100)
    description = models.TextField()
    monthly_price = models.IntegerField()
    annual_price = models.IntegerField()
    badge = models.CharField(max_length=100, blank=True, null=True)
    badge_color = models.CharField(max_length=100, blank=True, null=True)
    cta = models.CharField(max_length=100)
    cta_style = models.CharField(max_length=255)
    highlight = models.BooleanField(default=False)
    icon = models.CharField(max_length=100)
    icon_bg = models.CharField(max_length=100)
    icon_color = models.CharField(max_length=100)
    order = models.IntegerField(default=0)
    
    class Meta:
        ordering = ['order']
        
    def __str__(self):
        return str(self.name)

class PricingFeature(models.Model):
    name = models.CharField(max_length=255)
    category = models.CharField(max_length=100)
    free_value = models.CharField(max_length=255)
    pro_value = models.CharField(max_length=255)
    enterprise_value = models.CharField(max_length=255)
    order = models.IntegerField(default=0)
    
    class Meta:
        ordering = ['order']
        
    def __str__(self):
        return str(self.name)
