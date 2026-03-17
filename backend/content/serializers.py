from rest_framework import serializers
from .models import (
    LiveStat, TrustSignal, Feature, ThreatReportSummary, 
    Testimonial, LearningModuleHighlight, ThreatIntelligence,
    PricingPlan, PricingFeature
)
from api.models import ThreatReport, ScanHistory

class LiveStatSerializer(serializers.ModelSerializer):
    class Meta:
        model = LiveStat
        fields = '__all__'

class TrustSignalSerializer(serializers.ModelSerializer):
    class Meta:
        model = TrustSignal
        fields = '__all__'

class FeatureSerializer(serializers.ModelSerializer):
    class Meta:
        model = Feature
        fields = '__all__'

class ThreatReportSummarySerializer(serializers.ModelSerializer):
    class Meta:
        model = ThreatReportSummary
        fields = '__all__'

class TestimonialSerializer(serializers.ModelSerializer):
    class Meta:
        model = Testimonial
        fields = '__all__'

class LearningModuleHighlightSerializer(serializers.ModelSerializer):
    class Meta:
        model = LearningModuleHighlight
        fields = '__all__'

class ThreatIntelligenceSerializer(serializers.ModelSerializer):
    community_reports = serializers.SerializerMethodField()
    affected_users = serializers.SerializerMethodField()

    class Meta:
        model = ThreatIntelligence
        fields = '__all__'

    def get_community_reports(self, obj):
        # Count real user-submitted threat reports matching this threat type
        count = ThreatReport.objects.filter(threat_type__iexact=obj.type).count()
        # Add the seeded baseline so counts never drop below original data
        return obj.community_reports + count

    def get_affected_users(self, obj):
        # Count unique users who encountered scans matching this threat type keyword
        type_lower = obj.type.lower()
        # Map threat type to scan type
        scan_type_map = {
            'email phishing': 'email',
            'sms phishing': 'email',
            'url phishing': 'url',
            'spear phishing': 'email',
            'vishing': 'email',
        }
        scan_type = scan_type_map.get(type_lower)
        if scan_type:
            live_count = ScanHistory.objects.filter(
                type=scan_type
            ).exclude(threat_level='safe').values('user').distinct().count()
        else:
            live_count = 0
        return obj.affected_users + live_count

class PricingPlanSerializer(serializers.ModelSerializer):
    class Meta:
        model = PricingPlan
        fields = '__all__'

class PricingFeatureSerializer(serializers.ModelSerializer):
    class Meta:
        model = PricingFeature
        fields = '__all__'
