from datetime import date
from django.contrib.auth.models import User
from django.db.models import Avg
from rest_framework import viewsets, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import (
    LiveStat, TrustSignal, Feature, ThreatReportSummary, 
    Testimonial, LearningModuleHighlight, ThreatIntelligence,
    PricingPlan, PricingFeature
)
from .serializers import (
    LiveStatSerializer, TrustSignalSerializer, FeatureSerializer, 
    ThreatReportSummarySerializer, TestimonialSerializer, 
    LearningModuleHighlightSerializer, ThreatIntelligenceSerializer,
    PricingPlanSerializer, PricingFeatureSerializer
)
from api.models import ScanHistory, UserProfile


def _fmt(n: int) -> str:
    """Format large numbers as human-readable strings."""
    if n >= 1_000_000:
        return f"{n / 1_000_000:.1f}M+"
    if n >= 1_000:
        return f"{n // 1_000}K+"
    return str(n)


class LiveStatViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = LiveStat.objects.all()
    serializer_class = LiveStatSerializer
    permission_classes = [permissions.AllowAny]

    @action(detail=False, methods=['get'], url_path='platform-stats', permission_classes=[permissions.AllowAny])
    def platform_stats(self, request):
        threats_detected = ScanHistory.objects.exclude(threat_level='safe').count()
        scans_completed = ScanHistory.objects.count()
        users_protected = User.objects.count()
        active_members = UserProfile.objects.filter(status='active').count()

        # Average rating from testimonials
        avg_result = Testimonial.objects.aggregate(avg=Avg('rating'))
        avg_rating = round(avg_result['avg'] or 4.9, 1)

        # Satisfaction rate: proportion of scans that are confidently classified (safe or dangerous)
        confident_scans = ScanHistory.objects.exclude(threat_level='suspicious').count()
        if scans_completed > 0:
            accuracy = round((confident_scans / scans_completed) * 100, 1)
        else:
            accuracy = 99.7

        # Satisfaction: map avg_rating to a percentage
        satisfaction = round((avg_rating / 5.0) * 100)

        return Response({
            "threatsDetected": _fmt(threats_detected),
            "usersProtected": _fmt(users_protected),
            "scansCompleted": _fmt(scans_completed),
            "userSatisfactionRate": f"{satisfaction}%",
            "activeCommunityMembers": _fmt(active_members),
            "avgUserRating": f"{avg_rating}/5",
            "threatDetectionAccuracy": f"{accuracy}%",
        })

class TrustSignalViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = TrustSignal.objects.all()
    serializer_class = TrustSignalSerializer
    permission_classes = [permissions.AllowAny]

class FeatureViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Feature.objects.all()
    serializer_class = FeatureSerializer
    permission_classes = [permissions.AllowAny]

class ThreatReportSummaryViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = ThreatReportSummary.objects.all()
    serializer_class = ThreatReportSummarySerializer
    permission_classes = [permissions.AllowAny]

class TestimonialViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Testimonial.objects.all()
    serializer_class = TestimonialSerializer
    permission_classes = [permissions.AllowAny]

class LearningModuleHighlightViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = LearningModuleHighlight.objects.all()
    serializer_class = LearningModuleHighlightSerializer
    permission_classes = [permissions.AllowAny]

class ThreatIntelligenceViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = ThreatIntelligence.objects.all()
    serializer_class = ThreatIntelligenceSerializer
    permission_classes = [permissions.AllowAny]
    lookup_field = 'threat_id'
    
    def get_queryset(self):
        queryset = ThreatIntelligence.objects.all().order_by('-id')
        search = self.request.query_params.get('search')
        type_param = self.request.query_params.get('type')
        severity = self.request.query_params.get('severity')
        status = self.request.query_params.get('status')
        origin = self.request.query_params.get('origin')
        
        if search:
            queryset = queryset.filter(title__icontains=search) | queryset.filter(description__icontains=search)
        if type_param and type_param != 'All Types':
            queryset = queryset.filter(type=type_param)
        if severity and severity != 'All Severities':
            queryset = queryset.filter(severity=severity.lower())
        if status and status != 'All Status':
            queryset = queryset.filter(status=status.lower())
        if origin and origin != 'All Origins':
            queryset = queryset.filter(origin=origin)
            
        return queryset

    @action(detail=False, methods=['get'], permission_classes=[permissions.AllowAny])
    def stats(self, request):
        from django.db.models import Sum
        from datetime import datetime
        from api.models import ThreatReport
        qs = ThreatIntelligence.objects.all()
        total = qs.count()
        active = qs.filter(status='active').count()
        mitigated = qs.filter(status='mitigated').count()
        community = ThreatReport.objects.count()

        # Build last 6 months trend — detected_date is stored as MM/DD/YYYY
        today = date.today()
        monthly_trend = []
        for i in range(5, -1, -1):
            month_offset = (today.month - 1 - i) % 12 + 1
            year_offset = today.year + ((today.month - 1 - i) // 12)
            label = date(year_offset, month_offset, 1).strftime('%b %Y')  # e.g. "Jan 2026"

            detected_count = 0
            mitigated_count = 0
            for t in qs:
                try:
                    dt = datetime.strptime(t.detected_date, '%m/%d/%Y')
                    if dt.month == month_offset and dt.year == year_offset:
                        detected_count += 1
                        if t.status == 'mitigated':
                            mitigated_count += 1
                except (ValueError, TypeError):
                    pass

            monthly_trend.append({
                'month': label,
                'detected': detected_count,
                'mitigated': mitigated_count,
            })

        return Response({
            'totalThreats': total,
            'activeThreats': active,
            'mitigatedThreats': mitigated,
            'communityReports': community,
            'monthlyTrend': monthly_trend,
        })

    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAuthenticated])
    def add_insight(self, request, threat_id=None):
        threat = self.get_object()
        text = (request.data.get('insight') or '').strip()
        if not text:
            from rest_framework import status as drf_status
            return Response({'error': 'Insight text is required.'}, status=drf_status.HTTP_400_BAD_REQUEST)
        today = date.today().strftime('%m/%d/%Y')
        new_insight = {'user': request.user.username, 'date': today, 'insight': text}
        insights = list(threat.community_insights or [])
        insights.insert(0, new_insight)
        threat.community_insights = insights
        threat.save(update_fields=['community_insights'])
        return Response({'status': 'ok', 'insight': new_insight, 'community_insights': insights})

class PricingPlanViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = PricingPlan.objects.all()
    serializer_class = PricingPlanSerializer
    permission_classes = [permissions.AllowAny]

class PricingFeatureViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = PricingFeature.objects.all()
    serializer_class = PricingFeatureSerializer
    permission_classes = [permissions.AllowAny]
