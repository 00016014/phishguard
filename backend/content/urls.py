from django.urls import path, include
from rest_framework.routers import SimpleRouter
from .views import (
    LiveStatViewSet, TrustSignalViewSet, FeatureViewSet, 
    ThreatReportSummaryViewSet, TestimonialViewSet, 
    LearningModuleHighlightViewSet, ThreatIntelligenceViewSet,
    PricingPlanViewSet, PricingFeatureViewSet
)

router = SimpleRouter()
router.register(r'live-stats', LiveStatViewSet)
router.register(r'trust-signals', TrustSignalViewSet)
router.register(r'features', FeatureViewSet)
router.register(r'threat-summaries', ThreatReportSummaryViewSet)
router.register(r'testimonials', TestimonialViewSet)
router.register(r'module-highlights', LearningModuleHighlightViewSet)
router.register(r'threat-intelligence', ThreatIntelligenceViewSet)
router.register(r'pricing-plans', PricingPlanViewSet)
router.register(r'pricing-features', PricingFeatureViewSet)

urlpatterns = [
    path('', include(router.urls)),
]
