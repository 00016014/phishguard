from django.contrib import admin
from .models import UserProfile, ScanHistory, ThreatReport, LearningModule, LearningProgress

@admin.register(UserProfile)
class UserProfileAdmin(admin.ModelAdmin):
    list_display = ('user', 'role', 'tier', 'points', 'streak')

@admin.register(ScanHistory)
class ScanHistoryAdmin(admin.ModelAdmin):
    list_display = ('user', 'type', 'threat_level', 'score', 'created_at')

@admin.register(ThreatReport)
class ThreatReportAdmin(admin.ModelAdmin):
    list_display = ('title', 'user', 'threat_type', 'risk_level', 'status')

@admin.register(LearningModule)
class LearningModuleAdmin(admin.ModelAdmin):
    list_display = ('title', 'type', 'difficulty', 'points')

@admin.register(LearningProgress)
class LearningProgressAdmin(admin.ModelAdmin):
    list_display = ('user', 'module', 'completed', 'score', 'completed_at')
