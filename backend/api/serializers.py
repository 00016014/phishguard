from rest_framework import serializers
from django.contrib.auth.models import User
from .models import UserProfile, ScanHistory, ThreatReport, LearningModule, LearningProgress, SystemLog, Bookmark, CustomAlert, MitigatedThreat, DailyCheckIn

class UserProfileSerializer(serializers.ModelSerializer):
    renewal_date = serializers.SerializerMethodField()

    class Meta:
        model = UserProfile
        fields = [
            'role', 'tier', 'status',
            'scans_used', 'scans_limit',
            'api_calls_used', 'api_calls_limit',
            'alerts_used', 'alerts_limit',
            'renewal_date', 'points', 'streak', 'last_activity', 'avatar',
        ]

    def get_renewal_date(self, obj):
        return obj.get_renewal_date_str()

class UserSerializer(serializers.ModelSerializer):
    profile = UserProfileSerializer(read_only=True)
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'date_joined', 'profile']

class AdminUserSerializer(serializers.ModelSerializer):
    profile = UserProfileSerializer(read_only=True)
    scans_count = serializers.IntegerField(source='scans.count', read_only=True)
    
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'date_joined', 'profile', 'scans_count']

class ScanHistorySerializer(serializers.ModelSerializer):
    class Meta:
        model = ScanHistory
        fields = '__all__'

class ThreatReportSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source='user.username', read_only=True)
    class Meta:
        model = ThreatReport
        fields = '__all__'
        read_only_fields = ('user', 'status', 'created_at')

class LearningModuleSerializer(serializers.ModelSerializer):
    completed = serializers.SerializerMethodField()
    completion_count = serializers.SerializerMethodField()
    
    class Meta:
        model = LearningModule
        fields = ['id', 'title', 'description', 'type', 'difficulty', 'duration', 'points', 'icon', 'content_data', 'completed', 'completion_count']

    def get_completed(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return LearningProgress.objects.filter(user=request.user, module=obj, completed=True).exists()
        return False

    def get_completion_count(self, obj):
        return LearningProgress.objects.filter(module=obj, completed=True).count()

class LearningProgressSerializer(serializers.ModelSerializer):
    module_title = serializers.CharField(source='module.title', read_only=True)
    class Meta:
        model = LearningProgress
        fields = '__all__'

class SystemLogSerializer(serializers.ModelSerializer):
    class Meta:
        model = SystemLog
        fields = '__all__'


class BookmarkSerializer(serializers.ModelSerializer):
    class Meta:
        model = Bookmark
        fields = ['id', 'threat_id', 'threat_title', 'threat_type', 'threat_severity', 'created_at']
        read_only_fields = ['id', 'created_at']


class CustomAlertSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomAlert
        fields = ['id', 'title', 'keyword', 'threat_type', 'min_severity', 'active', 'created_at']
        read_only_fields = ['id', 'created_at']

class MitigatedThreatSerializer(serializers.ModelSerializer):
    class Meta:
        model = MitigatedThreat
        fields = ['id', 'threat_id', 'threat_title', 'threat_type', 'threat_severity', 'notes', 'created_at']
        read_only_fields = ['id', 'created_at']
