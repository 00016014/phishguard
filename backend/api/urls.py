from django.urls import path, include
from rest_framework.routers import SimpleRouter
from .views import (
    UserViewSet, ScanViewSet, ThreatReportViewSet,
    LearningLabViewSet, AdminViewSet, BookmarkViewSet, CustomAlertViewSet,
    MitigatedThreatViewSet, csrf_view,
)

router = SimpleRouter()
router.register(r'users', UserViewSet)
router.register(r'scans', ScanViewSet)
router.register(r'threat-reports', ThreatReportViewSet)
router.register(r'learning-lab', LearningLabViewSet)
router.register(r'admin', AdminViewSet, basename='admin')
router.register(r'bookmarks', BookmarkViewSet, basename='bookmarks')
router.register(r'alerts', CustomAlertViewSet, basename='alerts')
router.register(r'mitigated-threats', MitigatedThreatViewSet, basename='mitigated-threats')

urlpatterns = [
    path('', include(router.urls)),
    path('csrf/', csrf_view, name='csrf'),
]
