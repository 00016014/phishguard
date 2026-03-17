from django.contrib import admin
from .models import (
    LiveStat, TrustSignal, Feature, ThreatReportSummary, 
    Testimonial, LearningModuleHighlight, ThreatIntelligence
)

@admin.register(LiveStat)
class LiveStatAdmin(admin.ModelAdmin):
    list_display = ('title', 'value')

@admin.register(TrustSignal)
class TrustSignalAdmin(admin.ModelAdmin):
    list_display = ('name', 'type')

@admin.register(Feature)
class FeatureAdmin(admin.ModelAdmin):
    list_display = ('title', 'order')

@admin.register(ThreatReportSummary)
class ThreatReportSummaryAdmin(admin.ModelAdmin):
    list_display = ('title', 'category', 'severity')

@admin.register(Testimonial)
class TestimonialAdmin(admin.ModelAdmin):
    list_display = ('name', 'company', 'rating')

@admin.register(LearningModuleHighlight)
class LearningModuleHighlightAdmin(admin.ModelAdmin):
    list_display = ('title', 'level', 'rating')

@admin.register(ThreatIntelligence)
class ThreatIntelligenceAdmin(admin.ModelAdmin):
    list_display = ('threat_id', 'title', 'type', 'severity', 'status')
    search_fields = ('title', 'threat_id', 'description')
    list_filter = ('type', 'severity', 'status')
