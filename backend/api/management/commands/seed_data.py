from django.core.management.base import BaseCommand
from django.contrib.auth.models import User
from api.models import UserProfile, ScanHistory, ThreatReport, LearningModule, LearningProgress, SystemLog, Bookmark, CustomAlert
from django.utils import timezone
import random

class Command(BaseCommand):
    help = 'Seed the database with comprehensive mock data'

    def handle(self, *args, **options):
        self.stdout.write('Seeding data...')

        # 1. Create Admin
        admin_user, created = User.objects.get_or_create(username='admin', email='admin@phishguard.com')
        if created:
            admin_user.set_password('admin123')
            admin_user.save()
        
        admin_profile, _ = UserProfile.objects.get_or_create(user=admin_user)
        admin_profile.role = 'admin'
        admin_profile.tier = 'enterprise'
        admin_profile.points = 5000
        admin_profile.save()

        # 2. Create Regular Users
        users_data = [
            {'username': 'alice', 'email': 'alice@example.com', 'tier': 'pro', 'points': 2450},
            {'username': 'bob', 'email': 'bob@example.com', 'tier': 'free', 'points': 1200},
            {'username': 'sarah', 'email': 'sarah@example.com', 'tier': 'pro', 'points': 3100},
            {'username': 'marcus', 'email': 'marcus@example.com', 'tier': 'enterprise', 'points': 4200},
        ]

        for u_data in users_data:
            user, created = User.objects.get_or_create(username=u_data['username'], email=u_data['email'])
            if created:
                user.set_password('user123')
                user.save()
            
            profile, _ = UserProfile.objects.get_or_create(user=user)
            profile.tier = u_data['tier']
            profile.points = u_data['points']
            profile.streak = random.randint(1, 10)
            profile.save()

        # 3. Create Scan History
        scan_types = ['url', 'email', 'file', 'qr']
        threat_levels = ['safe', 'low', 'medium', 'high', 'critical']
        
        all_users = User.objects.all()
        for user in all_users:
            for _ in range(random.randint(5, 15)):
                stype = random.choice(scan_types)
                level = random.choice(threat_levels)
                ScanHistory.objects.create(
                    user=user,
                    type=stype,
                    content=f"Sample {stype} content for {user.username}",
                    threat_level=level,
                    score=random.randint(0, 100),
                    details=[{"category": "Heuristic", "severity": "warning", "finding": "Mock finding", "explanation": "This is generated data."}],
                    created_at=timezone.now() - timezone.timedelta(days=random.randint(0, 30))
                )

        # 4. Create Threat Reports
        report_titles = [
            "Fake Netflix Login", "IRS Tax Scam", "Urgent Bank Verification", 
            "Amazon Gift Card Scam", "Crypto Investment Fraud"
        ]
        for i in range(10):
            ThreatReport.objects.create(
                user=random.choice(all_users),
                title=random.choice(report_titles) + f" #{i}",
                description="This is a detailed description of a reported phishing attempt found in the wild.",
                threat_type=random.choice(['Email Phishing', 'SMS Phishing', 'Malware']),
                risk_level=random.choice(['High', 'Critical', 'Medium']),
                status=random.choice(['pending', 'investigating', 'resolved', 'approved']),
                evidence="http://suspicious-link.xyz/login"
            )

        # 5. Create System Logs
        log_levels = ['INFO', 'WARN', 'ERROR']
        messages = [
            "User login successful", "Failed scan attempt", "Database sync completed",
            "High traffic detected", "New threat signature added", "API Rate limit reached"
        ]
        for _ in range(20):
            SystemLog.objects.create(
                level=random.choice(log_levels),
                message=random.choice(messages),
                created_at=timezone.now() - timezone.timedelta(hours=random.randint(1, 100))
            )

        # 6. Create Bookmarks
        bookmark_data = [
            {'threat_id': 'tr-001', 'threat_title': 'Fake Microsoft Office 365 Login Page', 'threat_type': 'Credential Harvesting', 'threat_severity': 'critical'},
            {'threat_id': 'tr-002', 'threat_title': 'Amazon Prime Renewal Scam Email', 'threat_type': 'Payment Fraud', 'threat_severity': 'high'},
            {'threat_id': 'tr-003', 'threat_title': 'IRS Tax Refund Phishing Campaign', 'threat_type': 'Government Impersonation', 'threat_severity': 'medium'},
            {'threat_id': 'tr-004', 'threat_title': 'Fake PayPal Security Alert', 'threat_type': 'Email Phishing', 'threat_severity': 'high'},
            {'threat_id': 'tr-005', 'threat_title': 'Crypto Wallet Drainer QR Code', 'threat_type': 'QR Phishing', 'threat_severity': 'critical'},
        ]
        for user in all_users:
            Bookmark.objects.filter(user=user).delete()
            for bm in random.sample(bookmark_data, k=random.randint(2, 4)):
                Bookmark.objects.get_or_create(user=user, threat_id=bm['threat_id'], defaults={
                    'threat_title': bm['threat_title'],
                    'threat_type': bm['threat_type'],
                    'threat_severity': bm['threat_severity'],
                })

        # 7. Create Custom Alerts
        alert_data = [
            {'title': 'Banking Phishing Threats', 'keyword': 'bank', 'threat_type': 'all', 'min_severity': 'high'},
            {'title': 'Crypto Scams', 'keyword': 'crypto', 'threat_type': 'all', 'min_severity': 'medium'},
            {'title': 'Government Impersonation', 'keyword': 'irs', 'threat_type': 'Email Phishing', 'min_severity': 'high'},
            {'title': 'Social Media Phishing', 'keyword': 'facebook', 'threat_type': 'all', 'min_severity': 'low'},
        ]
        for user in all_users:
            CustomAlert.objects.filter(user=user).delete()
            for al in random.sample(alert_data, k=random.randint(1, 3)):
                CustomAlert.objects.create(
                    user=user,
                    title=al['title'],
                    keyword=al['keyword'],
                    threat_type=al['threat_type'],
                    min_severity=al['min_severity'],
                    active=random.choice([True, True, False]),
                )

        # 8. Create Learning Progress
        modules = list(LearningModule.objects.all())
        if modules:
            for user in all_users:
                for module in random.sample(modules, k=min(len(modules), random.randint(1, 4))):
                    completed = random.choice([True, False])
                    LearningProgress.objects.get_or_create(
                        user=user, module=module,
                        defaults={
                            'completed': completed,
                            'score': random.randint(60, 100) if completed else 0,
                            'completed_at': timezone.now() - timezone.timedelta(days=random.randint(1, 20)) if completed else None,
                        }
                    )

        self.stdout.write(self.style.SUCCESS('Successfully seeded all mock data'))
