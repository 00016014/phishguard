import os
import re
import random
import urllib.parse
import base64 as b64
import requests as req_lib
from openai import OpenAI

from . import phishing_model



# OpenAI email helper

_openai_client = None

def _get_openai():
    global _openai_client
    if _openai_client is None:
        api_key = os.environ.get('OPENAI_API_KEY')
        if api_key:
            _openai_client = OpenAI(api_key=api_key)
    return _openai_client


def _ai_email(prompt: str, fallback: str) -> str:
    """Ask GPT-4o-mini to write an email body. Returns fallback on any error."""
    try:
        client = _get_openai()
        if not client:
            return fallback
        resp = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {
                    "role": "system",
                    "content": (
                        "You are an email copywriter for PhishGuard, a professional "
                        "cybersecurity platform. Write concise, friendly, and professional "
                        "email body text only — no subject line, no HTML tags. "
                        "Sign off with '— The PhishGuard Team'."
                    ),
                },
                {"role": "user", "content": prompt},
            ],
            max_tokens=400,
            temperature=0.7,
        )
        return resp.choices[0].message.content.strip()
    except Exception:
        return fallback

from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from django.conf import settings
from django.middleware.csrf import get_token
from django.contrib.auth import authenticate, login, logout
from django.views.decorators.csrf import ensure_csrf_cookie
from django.http import JsonResponse
from django.contrib.auth.models import User
from django.contrib.auth.tokens import default_token_generator
from django.core.mail import send_mail
from django.utils import timezone
from django.utils.decorators import method_decorator
from django.utils.encoding import force_bytes, force_str
from django.utils.http import urlsafe_base64_encode, urlsafe_base64_decode
from django.views.decorators.csrf import csrf_exempt

from .models import (
    UserProfile, ScanHistory, ThreatReport,
    LearningModule, LearningProgress, SystemLog,
    Bookmark, CustomAlert, MitigatedThreat, DailyCheckIn, OTPCode
)
from .serializers import (
    UserSerializer, UserProfileSerializer, ScanHistorySerializer,
    ThreatReportSerializer, LearningModuleSerializer, LearningProgressSerializer,
    AdminUserSerializer, SystemLogSerializer, BookmarkSerializer, CustomAlertSerializer,
    MitigatedThreatSerializer
)

FRONTEND_APP_URL = os.environ.get('FRONTEND_APP_URL', 'https://phishguard.uz')



# Custom permissions


class IsAdminUser(permissions.BasePermission):
    def has_permission(self, request, view):
        return (
            request.user
            and request.user.is_authenticated
            and hasattr(request.user, 'profile')
            and request.user.profile.role == 'admin'
        )



# Scan analysis helpers


URGENCY_PHRASES = [
    'urgent', 'immediate action', 'act now', 'limited time', 'expires soon',
    'verify immediately', 'account suspended', 'unauthorized access', 'click here',
    'confirm your', 'update your', 'verify your', 'suspended', 'locked', 'blocked',
]
SUSPICIOUS_TLDS = [
    '.tk', '.ml', '.ga', '.cf', '.gq', '.xyz', '.buzz', '.shop',
    '.click', '.download', '.link', '.live', '.online', '.site',
    '.top', '.win', '.bid', '.loan', '.work', '.party',
]
URL_SHORTENERS = [
    'bit.ly', 'tinyurl.com', 't.co', 'goo.gl', 'ow.ly', 'short.link',
    'rb.gy', 'is.gd', 'cutt.ly', 'tiny.cc',
]
SENSITIVE_BRANDS = [
    'paypal', 'amazon', 'apple', 'microsoft', 'google', 'facebook',
    'netflix', 'citibank', 'chase', 'wellsfargo', 'instagram',
    'twitter', 'linkedin', 'dropbox', 'icloud', 'bankofamerica',
]
OFFICIAL_DOMAINS = {
    'paypal': 'paypal.com', 'amazon': 'amazon.com', 'apple': 'apple.com',
    'microsoft': 'microsoft.com', 'google': 'google.com', 'facebook': 'facebook.com',
    'netflix': 'netflix.com', 'instagram': 'instagram.com', 'twitter': 'twitter.com',
    'linkedin': 'linkedin.com', 'dropbox': 'dropbox.com', 'icloud': 'icloud.com',
}


def _analyze_url(url: str):
    url_score = 0
    url_details = []
    try:
        parsed = urllib.parse.urlparse(url if url.startswith('http') else 'http://' + url)
        domain = parsed.netloc.lower()
        path = parsed.path.lower()

        if re.match(r'^(\d{1,3}\.){3}\d{1,3}', domain):
            url_score += 40
            url_details.append({'category': 'Domain Analysis', 'severity': 'danger',
                'finding': 'IP Address Used as Domain',
                'explanation': 'Legitimate sites use domain names, not raw IPs. This is a common phishing tactic.'})

        if any(domain.endswith(tld) for tld in SUSPICIOUS_TLDS):
            url_score += 35
            url_details.append({'category': 'Domain Analysis', 'severity': 'danger',
                'finding': 'Suspicious Top-Level Domain',
                'explanation': 'This domain uses a TLD commonly associated with phishing and spam campaigns.'})

        if any(s in domain for s in URL_SHORTENERS):
            url_score += 20
            url_details.append({'category': 'URL Analysis', 'severity': 'warning',
                'finding': 'URL Shortener Detected',
                'explanation': 'Shortened URLs hide the real destination and are frequently used in phishing.'})

        if '@' in url:
            url_score += 50
            url_details.append({'category': 'URL Analysis', 'severity': 'danger',
                'finding': '@ Symbol in URL',
                'explanation': 'The @ symbol in URLs can trick users into visiting a different domain than expected.'})

        if url.startswith('http://'):
            url_score += 15
            url_details.append({'category': 'Security Protocol', 'severity': 'warning',
                'finding': 'No HTTPS (Unencrypted Connection)',
                'explanation': "The site doesn't use HTTPS. Avoid entering sensitive information."})

        subdomain_count = domain.count('.')
        if subdomain_count >= 3:
            url_score += 25
            url_details.append({'category': 'Domain Analysis', 'severity': 'warning',
                'finding': f'Excessive Subdomains ({subdomain_count} levels)',
                'explanation': 'Attackers use many subdomains to impersonate legitimate sites.'})

        for brand in SENSITIVE_BRANDS:
            if brand in domain:
                official = OFFICIAL_DOMAINS.get(brand, f'{brand}.com')
                if not domain.endswith(official):
                    url_score += 45
                    url_details.append({'category': 'Brand Impersonation', 'severity': 'danger',
                        'finding': f'Fake {brand.capitalize()} Domain',
                        'explanation': f'This URL impersonates {brand.capitalize()} but is not the official domain ({official}).'})
                    break

        path_kws = [kw for kw in ['login', 'signin', 'password', 'verify', 'secure',
                                   'update', 'account', 'confirm', 'banking', 'credential']
                    if kw in path]
        if path_kws:
            url_score += 15
            url_details.append({'category': 'URL Content', 'severity': 'warning',
                'finding': 'Phishing Keywords in URL Path',
                'explanation': f"Suspicious terms: {', '.join(path_kws)}. Common in credential harvesting pages."})

        if re.search(r'[a-z]+[0-9][a-z]+', domain):
            url_score += 30
            url_details.append({'category': 'Domain Analysis', 'severity': 'danger',
                'finding': 'Number Substitution in Domain',
                'explanation': 'Domain uses numbers in place of letters to mimic legitimate sites (e.g., amaz0n).'})

        if len(url) > 100:
            url_score += 10
            url_details.append({'category': 'URL Analysis', 'severity': 'warning',
                'finding': 'Unusually Long URL',
                'explanation': 'Very long URLs are often used to conceal suspicious components.'})

    except Exception:
        pass
    return url_score, url_details


def _virustotal_enrich(url: str, score: int, details: list):
    import logging; vt_log = logging.getLogger('virustotal')
    vt_key = os.environ.get('VIRUSTOTAL_API_KEY')
    if not vt_key:
        vt_log.warning('VIRUSTOTAL_API_KEY not set — skipping VT enrichment')
        return score, details
    try:
        canonical = url if url.startswith(('http://', 'https://')) else 'http://' + url
        url_id = b64.urlsafe_b64encode(canonical.encode()).decode().rstrip('=')
        resp = req_lib.get(f'https://www.virustotal.com/api/v3/urls/{url_id}',
                           headers={'x-apikey': vt_key}, timeout=10)
        if resp.status_code in (401, 403):
            vt_log.error(f'VirusTotal auth error {resp.status_code}: invalid or quota-exceeded API key')
            return score, details
        if resp.status_code == 404:
            # URL not yet in VT — submit it and re-fetch once
            req_lib.post('https://www.virustotal.com/api/v3/urls',
                         headers={'x-apikey': vt_key}, data={'url': canonical}, timeout=8)
            import time; time.sleep(3)
            resp = req_lib.get(f'https://www.virustotal.com/api/v3/urls/{url_id}',
                               headers={'x-apikey': vt_key}, timeout=10)
        if resp.status_code == 200:
            attrs = resp.json().get('data', {}).get('attributes', {})
            stats = attrs.get('last_analysis_stats', {})
            malicious = stats.get('malicious', 0)
            suspicious_count = stats.get('suspicious', 0)
            harmless = stats.get('harmless', 0)
            undetected = stats.get('undetected', 0)
            total = harmless + malicious + suspicious_count + undetected

            # Top flagging vendors (malicious + suspicious, up to 10)
            analysis_results = attrs.get('last_analysis_results', {})
            flagging_vendors = sorted(
                [name for name, r in analysis_results.items()
                 if r.get('category') in ('malicious', 'suspicious')]
            )[:10]

            # Categories assigned by different security vendors
            raw_cats = attrs.get('categories', {})
            categories = list(dict.fromkeys(raw_cats.values()))[:6]

            # Reputation, tags, community votes, final URL
            reputation = attrs.get('reputation', 0)
            tags = attrs.get('tags', [])[:8]
            community_votes = attrs.get('total_votes', {})
            last_url = attrs.get('last_final_url', canonical)

            vt_extra = {
                'vt_stats': {
                    'malicious': malicious, 'suspicious': suspicious_count,
                    'harmless': harmless, 'undetected': undetected, 'total': total,
                },
                'vt_vendors': flagging_vendors,
                'vt_categories': categories,
                'vt_reputation': reputation,
                'vt_votes': community_votes,
                'vt_tags': tags,
                'vt_final_url': last_url,
            }

            if malicious > 0 or suspicious_count > 0:
                score = min(score + min(malicious * 10 + suspicious_count * 5, 60), 100)
                details.append({
                    'category': 'VirusTotal Analysis', 'severity': 'danger',
                    'finding': f'Flagged by {malicious} Security Vendors',
                    'explanation': (
                        f'VirusTotal: {malicious} vendor(s) flagged as malicious, '
                        f'{suspicious_count} as suspicious out of {total} total engines.'
                    ),
                    **vt_extra,
                })
            else:
                details.append({
                    'category': 'VirusTotal Analysis', 'severity': 'safe',
                    'finding': 'Clean on VirusTotal',
                    'explanation': 'No security vendors flagged this URL on VirusTotal.',
                    **vt_extra,
                })
        else:
            vt_log.warning(f'VirusTotal unexpected status {resp.status_code} for {canonical}')
    except Exception as e:
        vt_log.error(f'VirusTotal error: {e}')
    return score, details




def _score_to_level(score: int) -> str:
    if score >= 70: return 'critical'
    if score >= 50: return 'high'
    if score >= 30: return 'medium'
    if score >= 10: return 'low'
    return 'safe'


def _analyze(scan_type: str, content: str) -> dict:
    score = 0
    details = []
    content_lower = content.lower()

    if scan_type == 'url':
        # Normalize for API calls; keep original for local heuristics (http:// explicit check)
        canonical_url = content if content.startswith(('http://', 'https://')) else 'http://' + content
        score, details = _analyze_url(content)
        score, details = _virustotal_enrich(canonical_url, score, details)

    elif scan_type == 'email':
        # ── Step 1: Extract URLs ────────────────────────────────────────────
        urls = re.findall(r'https?://[^\s<>"]+|www\.[^\s<>"]+', content)
        unique_urls = list(dict.fromkeys(urls))[:5]  # deduplicate, cap at 5

        # ── Step 2: URL heuristic + VirusTotal scan ──────────────────────────
        for url in unique_urls:
            u_score, u_details = _analyze_url(url)
            score += u_score
            details.extend(u_details)
            canonical = url if url.startswith(('http://', 'https://')) else 'http://' + url
            score, details = _virustotal_enrich(canonical, score, details)

        # ── Step 3: Heuristic text checks ────────────────────────────────────
        found_urgency = [p for p in URGENCY_PHRASES if p in content_lower]
        if found_urgency:
            score += 20
            details.append({'category': 'Content Analysis', 'severity': 'warning',
                'finding': 'Urgency & Pressure Tactics',
                'explanation': f"Email contains pressure language: {', '.join(found_urgency[:3])}. Phishers create urgency to bypass rational thinking."})

        found_brands = [b for b in SENSITIVE_BRANDS if b in content_lower]
        if found_brands:
            score += 15
            details.append({'category': 'Brand Analysis', 'severity': 'warning',
                'finding': f"Sensitive Brand Mentioned: {found_brands[0].capitalize()}",
                'explanation': 'Phishing emails frequently impersonate trusted brands to steal credentials.'})

        sensitive = ['social security', 'credit card', 'bank account', 'password',
                     'pin number', "mother's maiden", 'date of birth', 'ssn']
        found_sensitive = [r for r in sensitive if r in content_lower]
        if found_sensitive:
            score += 35
            details.append({'category': 'Content Analysis', 'severity': 'danger',
                'finding': 'Request for Sensitive Information',
                'explanation': f"Email requests sensitive data: {', '.join(found_sensitive[:2])}. Legitimate organizations never ask for this via email."})

        from_match = re.search(r'from:.*?<(.+?)>', content_lower)
        reply_match = re.search(r'reply-to:.*?<(.+?)>', content_lower)
        if from_match and reply_match:
            try:
                if from_match.group(1).split('@')[1] != reply_match.group(1).split('@')[1]:
                    score += 40
                    details.append({'category': 'Header Analysis', 'severity': 'danger',
                        'finding': 'Mismatched From and Reply-To Domains',
                        'explanation': "Sender domain doesn't match reply-to domain — a classic phishing indicator."})
            except IndexError:
                pass

        found_ext = [e for e in ['.exe', '.zip', '.rar', '.bat', '.cmd', '.vbs', '.js', '.ps1']
                     if e in content_lower]
        if found_ext:
            score += 25
            details.append({'category': 'Attachment Analysis', 'severity': 'danger',
                'finding': 'Suspicious Attachment Mentioned',
                'explanation': f"Email references dangerous file types: {', '.join(found_ext)}."})

        # ── Step 4: AI phishing model ─────────────────────────────────────────
        ai = phishing_model.predict(content)
        ai_prob = ai['phishing_probability']
        ai_label = ai['label']
        ai_conf = ai['confidence']
        ai_signals = ai['top_signals']

        if ai_label == 'phishing':
            # Scale AI contribution: max +40 pts (avoids double-counting with heuristics)
            ai_contribution = int(ai_prob * 40)
            score += ai_contribution
            severity = 'danger' if ai_conf == 'high' else 'warning'
            signal_text = (f" Key signals: {', '.join(ai_signals[:3])}." if ai_signals else '')
            details.append({
                'category': 'AI Phishing Model',
                'severity': severity,
                'finding': f'AI classified as Phishing ({int(ai_prob * 100)}% probability)',
                'explanation': (
                    f'The machine learning model analysed the email text and determined a '
                    f'{int(ai_prob * 100)}% phishing probability with {ai_conf} confidence.'
                    f'{signal_text}'
                ),
            })
        elif ai_label == 'legitimate' and ai_conf in ('high', 'medium'):
            details.append({
                'category': 'AI Phishing Model',
                'severity': 'safe',
                'finding': f'AI classified as Legitimate ({int((1 - ai_prob) * 100)}% probability)',
                'explanation': (
                    f'The machine learning model found no strong phishing indicators in the '
                    f'email text ({ai_conf} confidence, {int(ai_prob * 100)}% phishing probability).'
                ),
            })

        # ── Step 5: Fallback if nothing caught anything ───────────────────────
        if not details:
            details.append({'category': 'Content Analysis', 'severity': 'safe',
                'finding': 'No Obvious Phishing Indicators',
                'explanation': 'This email does not contain typical phishing patterns, but always remain vigilant.'})

    elif scan_type == 'sms':
        # ── Step 1: Extract & scan URLs ──────────────────────────────────────
        urls = re.findall(r'https?://[^\s<>"]+|www\.[^\s<>"]+', content)
        unique_urls = list(dict.fromkeys(urls))[:3]
        for url in unique_urls:
            u_score, u_details = _analyze_url(url)
            score += u_score
            details.extend(u_details)
            canonical = url if url.startswith(('http://', 'https://')) else 'http://' + url
            score, details = _virustotal_enrich(canonical, score, details)

        # ── Step 2: SMS-specific heuristics ──────────────────────────────────
        found_urgency = [p for p in URGENCY_PHRASES if p in content_lower]
        if found_urgency:
            score += 20
            details.append({'category': 'Content Analysis', 'severity': 'warning',
                'finding': 'Urgency & Pressure Tactics',
                'explanation': f"SMS contains pressure language: {', '.join(found_urgency[:3])}. Smishing messages create false urgency to provoke immediate action."})

        found_brands = [b for b in SENSITIVE_BRANDS if b in content_lower]
        if found_brands:
            score += 15
            details.append({'category': 'Brand Impersonation', 'severity': 'warning',
                'finding': f"Brand Name Detected: {found_brands[0].capitalize()}",
                'explanation': 'Smishing messages frequently impersonate trusted brands (banks, carriers, couriers) to steal credentials.'})

        if re.search(r'(your .{0,20} (otp|code|pin) is|one.time.pass|verification code)', content_lower):
            score += 30
            details.append({'category': 'OTP / Code Request', 'severity': 'danger',
                'finding': 'One-Time Password or Verification Code Mentioned',
                'explanation': 'Legitimate services never ask you to share an OTP received via SMS. This is a classic credential-theft attack.'})

        if re.search(r'(reply stop|txt stop|text stop|unsubscribe)', content_lower) and unique_urls:
            score += 15
            details.append({'category': 'Unsubscribe Lure', 'severity': 'warning',
                'finding': 'Unsubscribe Link in Unsolicited SMS',
                'explanation': 'Replying STOP or clicking unsubscribe links in unsolicited SMS can confirm your number is active to spammers.'})

        prize_keywords = ['won', 'winner', 'prize', 'claim', 'reward', 'gift card', 'free iphone', 'selected']
        if any(k in content_lower for k in prize_keywords):
            score += 25
            details.append({'category': 'Prize / Reward Scam', 'severity': 'danger',
                'finding': 'Prize or Reward Language Detected',
                'explanation': 'Unsolicited prize notifications via SMS are almost always scams designed to harvest personal information.'})

        # ── Step 3: AI phishing model ─────────────────────────────────────────
        ai = phishing_model.predict(content)
        ai_prob = ai['phishing_probability']
        ai_label = ai['label']
        ai_conf = ai['confidence']
        ai_signals = ai['top_signals']
        if ai_label == 'phishing':
            score += int(ai_prob * 35)
            severity = 'danger' if ai_conf == 'high' else 'warning'
            signal_text = (f" Key signals: {', '.join(ai_signals[:3])}." if ai_signals else '')
            details.append({'category': 'AI Phishing Model', 'severity': severity,
                'finding': f'AI classified as Smishing ({int(ai_prob * 100)}% probability)',
                'explanation': f'The ML model detected phishing patterns in this SMS with {int(ai_prob * 100)}% probability ({ai_conf} confidence).{signal_text}'})
        elif ai_label == 'legitimate' and ai_conf in ('high', 'medium'):
            details.append({'category': 'AI Phishing Model', 'severity': 'safe',
                'finding': f'AI classified as Legitimate ({int((1 - ai_prob) * 100)}% probability)',
                'explanation': f'ML model found no strong smishing indicators ({ai_conf} confidence).'})

        if not details:
            details.append({'category': 'SMS Analysis', 'severity': 'safe',
                'finding': 'No Smishing Indicators Found',
                'explanation': 'This SMS does not contain typical smishing patterns.'})

    elif scan_type in ('file', 'attachment'):
        urls = re.findall(r'https?://\S+|www\.\S+', content)
        for url in urls[:5]:
            u_score, u_details = _analyze_url(url)
            score += u_score
            details.extend(u_details)
            canonical = url if url.startswith(('http://', 'https://')) else 'http://' + url
            score, details = _virustotal_enrich(canonical, score, details)

        if re.search(r'<script|javascript:|eval\(|exec\(|system\(|cmd\.exe', content_lower):
            score += 60
            details.append({'category': 'Malware Detection', 'severity': 'danger',
                'finding': 'Potential Script / Malware Pattern',
                'explanation': 'File contains scripting patterns commonly found in malicious documents.'})

        if re.search(r'auto_?open|auto_?run|shellexecute|createobject|wscript', content_lower):
            score += 50
            details.append({'category': 'Malware Detection', 'severity': 'danger',
                'finding': 'Macro or Auto-Execution Pattern',
                'explanation': 'File appears to contain macros or auto-execution code used in malware delivery.'})

        found_urgency = [p for p in URGENCY_PHRASES if p in content_lower]
        if found_urgency:
            score += 15
            details.append({'category': 'Content Analysis', 'severity': 'warning',
                'finding': 'Urgency Language in File',
                'explanation': 'File content includes high-pressure language common in phishing documents.'})

        # AI model on file text content
        ai = phishing_model.predict(content)
        if ai['label'] == 'phishing':
            score += int(ai['phishing_probability'] * 30)
            details.append({'category': 'AI Phishing Model', 'severity': 'danger' if ai['confidence'] == 'high' else 'warning',
                'finding': f"AI detected phishing content ({int(ai['phishing_probability'] * 100)}% probability)",
                'explanation': f"ML model flagged the file text as likely phishing with {ai['confidence']} confidence."})

        if not details:
            details.append({'category': 'File Analysis', 'severity': 'safe',
                'finding': 'No Malicious Patterns Detected',
                'explanation': 'File content does not match known malicious patterns.'})

    elif scan_type == 'qr':
        if re.match(r'https?://', content):
            score, details = _analyze_url(content)
            score, details = _virustotal_enrich(content, score, details)
        else:
            found_urgency = [p for p in URGENCY_PHRASES if p in content_lower]
            if found_urgency:
                score += 20
                details.append({'category': 'Content Analysis', 'severity': 'warning',
                    'finding': 'Suspicious Text in QR Code',
                    'explanation': f"QR contains pressure language: {', '.join(found_urgency[:2])}."})
            found_brands = [b for b in SENSITIVE_BRANDS if b in content_lower]
            if found_brands:
                score += 15
                details.append({'category': 'Brand Analysis', 'severity': 'warning',
                    'finding': 'Brand Name in QR Content',
                    'explanation': f"QR references sensitive brands: {', '.join(found_brands[:2])}."})
            if not details:
                details.append({'category': 'QR Analysis', 'severity': 'safe',
                    'finding': 'QR Code Appears Safe',
                    'explanation': 'The QR code does not contain obvious malicious content.'})

    score = min(score, 100)
    return {'threat_level': _score_to_level(score), 'score': score, 'details': details}


# ViewSets


@method_decorator(csrf_exempt, name='dispatch')
class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_permissions(self):
        if self.action in ('login', 'register', 'verify_registration_otp',
                           'request_password_reset', 'verify_reset_otp', 'reset_password'):
            return [permissions.AllowAny()]
        if self.action in ('list', 'retrieve', 'update', 'partial_update', 'destroy'):
            return [IsAdminUser()]
        if self.action in ('me', 'dashboard', 'activity', 'update_profile', 'change_password',
                           'upload_avatar', 'daily_checkin', 'checkin_history'):
            return [permissions.IsAuthenticated()]
        return super().get_permissions()

    @action(detail=False, methods=['post'])
    def login(self, request):
        username_or_email = request.data.get('username', '').strip()
        password = request.data.get('password', '')

        user = authenticate(request, username=username_or_email, password=password)
        if not user:
            try:
                user_obj = User.objects.get(email__iexact=username_or_email)
                user = authenticate(request, username=user_obj.username, password=password)
            except User.DoesNotExist:
                pass

        if user:
            if hasattr(user, 'profile') and user.profile.status == 'suspended':
                return Response({"error": "Account is suspended."}, status=status.HTTP_403_FORBIDDEN)
            login(request, user)
            return Response(UserSerializer(user).data)
        return Response({"error": "Invalid credentials"}, status=status.HTTP_401_UNAUTHORIZED)

    @action(detail=False, methods=['post'])
    def logout(self, request):
        logout(request)
        return Response({"status": "logged out"})

    @action(detail=False, methods=['post'])
    def register(self, request):
        username = request.data.get('username', '').strip()
        email = request.data.get('email', '').strip()
        password = request.data.get('password', '')
        full_name = request.data.get('full_name', '').strip()

        if not username or not email or not password:
            return Response({"error": "Username, email, and password are required."}, status=status.HTTP_400_BAD_REQUEST)
        if len(password) < 6:
            return Response({"error": "Password must be at least 6 characters."}, status=status.HTTP_400_BAD_REQUEST)
        if User.objects.filter(username__iexact=username).exists():
            return Response({"error": "Username already taken."}, status=status.HTTP_400_BAD_REQUEST)
        if User.objects.filter(email__iexact=email).exists():
            return Response({"error": "Email already registered."}, status=status.HTTP_400_BAD_REQUEST)

        # Invalidate any existing registration OTPs for this email
        OTPCode.objects.filter(email__iexact=email, purpose=OTPCode.PURPOSE_REGISTRATION, is_used=False).update(is_used=True)

        code = f"{random.randint(0, 999999):06d}"
        OTPCode.objects.create(
            email=email,
            code=code,
            purpose=OTPCode.PURPOSE_REGISTRATION,
            pending_data={'username': username, 'password': password, 'full_name': full_name},
            expires_at=timezone.now() + timezone.timedelta(minutes=10),
        )

        fallback_reg_otp = (
            f"Hi {full_name or username},\n\n"
            f"Your PhishGuard registration OTP is:\n\n"
            f"    {code}\n\n"
            f"This code expires in 10 minutes. Do not share it with anyone.\n\n"
            f"If you did not request this, please ignore this email.\n\n"
            f"— The PhishGuard Team"
        )
        reg_otp_body = _ai_email(
            f"Write a warm, professional email to {full_name or username} who is registering on "
            f"PhishGuard. Include their one-time verification code: {code}. "
            f"Mention the code expires in 10 minutes and they should not share it. "
            f"Keep it short and friendly.",
            fallback_reg_otp,
        )
        try:
            send_mail(
                subject="PhishGuard — Your registration OTP",
                message=reg_otp_body,
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=[email],
                fail_silently=False,
            )
        except Exception as e:
            return Response({"error": "Failed to send OTP email. Please try again."}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        return Response({"detail": "OTP sent to your email address.", "email": email}, status=status.HTTP_200_OK)

    @action(detail=False, methods=['post'])
    def verify_registration_otp(self, request):
        email = request.data.get('email', '').strip()
        code = request.data.get('otp', '').strip()

        if not email or not code:
            return Response({"error": "Email and OTP are required."}, status=status.HTTP_400_BAD_REQUEST)

        otp = (
            OTPCode.objects
            .filter(email__iexact=email, purpose=OTPCode.PURPOSE_REGISTRATION, is_used=False)
            .order_by('-created_at')
            .first()
        )

        if not otp:
            return Response({"error": "OTP not found. Please request a new one."}, status=status.HTTP_400_BAD_REQUEST)
        if timezone.now() > otp.expires_at:
            otp.is_used = True
            otp.save(update_fields=['is_used'])
            return Response({"error": "OTP has expired. Please request a new one."}, status=status.HTTP_400_BAD_REQUEST)
        if otp.code != code:
            return Response({"error": "Invalid OTP. Please check and try again."}, status=status.HTTP_400_BAD_REQUEST)

        # Mark OTP used
        otp.is_used = True
        otp.save(update_fields=['is_used'])

        data = otp.pending_data or {}
        username = data.get('username', '')
        password = data.get('password', '')
        full_name = data.get('full_name', '')

        # Guard against duplicate (race condition)
        if User.objects.filter(username__iexact=username).exists():
            return Response({"error": "Username already taken."}, status=status.HTTP_400_BAD_REQUEST)
        if User.objects.filter(email__iexact=email).exists():
            return Response({"error": "Email already registered."}, status=status.HTTP_400_BAD_REQUEST)

        first_name, _, last_name = full_name.partition(' ')
        user = User.objects.create_user(
            username=username, email=email, password=password,
            first_name=first_name, last_name=last_name,
        )
        login(request, user)
        SystemLog.objects.create(level='INFO', message=f"New user registered: {user.username}")

        # Send welcome email
        fallback_welcome = (
            f"Hi {user.first_name or user.username},\n\n"
            f"Welcome to PhishGuard! Your account has been successfully created.\n\n"
            f"You can now scan URLs and emails for phishing threats, track your security "
            f"score, learn to spot phishing attacks, and report threats to help the community.\n\n"
            f"Account Details:\n"
            f"  Username : {user.username}\n"
            f"  Email    : {user.email}\n\n"
            f"Get started: {FRONTEND_APP_URL}/personal-dashboard\n\n"
            f"Stay safe online,\n"
            f"— The PhishGuard Team"
        )
        welcome_body = _ai_email(
            f"Write an enthusiastic welcome email to {user.first_name or user.username} who just "
            f"created a PhishGuard account (username: {user.username}). "
            f"Highlight what they can do: scan URLs/emails for phishing, track their security score "
            f"on the personal dashboard, use the interactive learning lab, and report threats. "
            f"Include a call-to-action link: {FRONTEND_APP_URL}/personal-dashboard. "
            f"Keep it warm and motivating.",
            fallback_welcome,
        )
        try:
            send_mail(
                subject="Welcome to PhishGuard — Your account is ready!",
                message=welcome_body,
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=[user.email],
                fail_silently=True,
            )
        except Exception:
            pass

        return Response(UserSerializer(user).data, status=status.HTTP_201_CREATED)

    @action(detail=False, methods=['post'])
    def request_password_reset(self, request):
        email = request.data.get('email', '').strip()
        try:
            user = User.objects.get(email__iexact=email)
        except User.DoesNotExist:
            # Silently succeed to prevent user enumeration
            return Response({"detail": "If that email is registered, an OTP has been sent."})

        # Invalidate any existing reset OTPs for this email
        OTPCode.objects.filter(email__iexact=email, purpose=OTPCode.PURPOSE_PASSWORD_RESET, is_used=False).update(is_used=True)

        code = f"{random.randint(0, 999999):06d}"
        OTPCode.objects.create(
            email=email,
            code=code,
            purpose=OTPCode.PURPOSE_PASSWORD_RESET,
            expires_at=timezone.now() + timezone.timedelta(minutes=10),
        )

        fallback_reset_otp = (
            f"Hi {user.username},\n\n"
            f"Your PhishGuard password reset OTP is:\n\n"
            f"    {code}\n\n"
            f"This code expires in 10 minutes. Do not share it with anyone.\n\n"
            f"If you did not request this, please ignore this email.\n\n"
            f"— The PhishGuard Team"
        )
        reset_otp_body = _ai_email(
            f"Write a clear, professional password-reset email to {user.username} for PhishGuard. "
            f"Include their one-time reset code: {code}. "
            f"Mention it expires in 10 minutes and they should not share it. "
            f"Add a security note that if they didn't request this they should ignore the email.",
            fallback_reset_otp,
        )
        try:
            send_mail(
                subject="PhishGuard — Password Reset OTP",
                message=reset_otp_body,
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=[email],
                fail_silently=False,
            )
        except Exception:
            return Response({"error": "Failed to send OTP email. Please try again."}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        return Response({"detail": "If that email is registered, an OTP has been sent.", "email": email})

    @action(detail=False, methods=['post'])
    def verify_reset_otp(self, request):
        email = request.data.get('email', '').strip()
        code = request.data.get('otp', '').strip()
        new_password = request.data.get('new_password', '')

        if not email or not code or not new_password:
            return Response({"error": "Email, OTP, and new password are required."}, status=status.HTTP_400_BAD_REQUEST)
        if len(new_password) < 6:
            return Response({"error": "Password must be at least 6 characters."}, status=status.HTTP_400_BAD_REQUEST)

        otp = (
            OTPCode.objects
            .filter(email__iexact=email, purpose=OTPCode.PURPOSE_PASSWORD_RESET, is_used=False)
            .order_by('-created_at')
            .first()
        )

        if not otp:
            return Response({"error": "OTP not found. Please request a new one."}, status=status.HTTP_400_BAD_REQUEST)
        if timezone.now() > otp.expires_at:
            otp.is_used = True
            otp.save(update_fields=['is_used'])
            return Response({"error": "OTP has expired. Please request a new one."}, status=status.HTTP_400_BAD_REQUEST)
        if otp.code != code:
            return Response({"error": "Invalid OTP. Please check and try again."}, status=status.HTTP_400_BAD_REQUEST)

        otp.is_used = True
        otp.save(update_fields=['is_used'])

        try:
            user = User.objects.get(email__iexact=email)
        except User.DoesNotExist:
            return Response({"error": "User not found."}, status=status.HTTP_400_BAD_REQUEST)

        user.set_password(new_password)
        user.save()
        SystemLog.objects.create(level='INFO', message=f"Password reset via OTP for {user.username}")
        return Response({"detail": "Password updated successfully."})

    @action(detail=False, methods=['post'])
    def reset_password(self, request):
        uid_enc = request.data.get('uid', '')
        token = request.data.get('token', '')
        new_password = request.data.get('new_password', '')

        if not uid_enc or not token or not new_password:
            return Response({"error": "uid, token, and new_password are required."}, status=status.HTTP_400_BAD_REQUEST)
        if len(new_password) < 6:
            return Response({"error": "Password must be at least 6 characters."}, status=status.HTTP_400_BAD_REQUEST)

        try:
            uid = force_str(urlsafe_base64_decode(uid_enc))
            user = User.objects.get(pk=uid)
        except (User.DoesNotExist, ValueError, TypeError, OverflowError):
            return Response({"error": "Invalid reset link."}, status=status.HTTP_400_BAD_REQUEST)

        if not default_token_generator.check_token(user, token):
            return Response({"error": "Reset link has expired or was already used."}, status=status.HTTP_400_BAD_REQUEST)

        user.set_password(new_password)
        user.save()
        SystemLog.objects.create(level='INFO', message=f"Password reset completed for {user.username}")
        return Response({"detail": "Password updated successfully."})

    @action(detail=False, methods=['post'], permission_classes=[permissions.IsAuthenticated])
    def ai_fill_threat_report(self, request):
        """Use OpenAI to suggest threat-report form fields from scan data."""
        import json as _json
        scan_type = str(request.data.get('scan_type', 'unknown'))
        content = str(request.data.get('content', ''))[:600]
        threat_level = str(request.data.get('threat_level', 'medium'))
        details = request.data.get('details', [])

        severity_map = {
            'safe': 'Low', 'low': 'Low', 'medium': 'Medium',
            'high': 'High', 'critical': 'Critical',
        }
        type_map = {
            'email': 'Email Phishing',
            'url': 'Malicious URL',
            'sms': 'SMS Phishing',
            'qr': 'QR Code Phishing',
            'file': 'Malware',
        }

        details_text = '\n'.join(
            f"- [{d.get('category', '')} / {d.get('severity', '')}] {d.get('finding', '')}: {d.get('explanation', '')}"
            for d in (details or [])
        ) or 'No additional details.'

        scan_label = {
            'email': 'phishing email', 'url': 'malicious URL',
            'sms': 'SMS/smishing message', 'qr': 'QR code',
            'file': 'malicious file',
        }.get(scan_type, scan_type)

        finding_names = [str(d.get('finding', '')).strip() for d in (details or []) if str(d.get('finding', '')).strip()]
        top_findings = finding_names[:3]
        top_finding_text = ', '.join(top_findings) if top_findings else 'multiple suspicious indicators'
        scan_excerpt = content[:250]

        fallback = {
            'title': f'{threat_level.capitalize()} {scan_label} threat: {top_findings[0] if top_findings else "Detected indicators"}',
            'type': type_map.get(scan_type, 'Email Phishing'),
            'severity': severity_map.get(threat_level, 'Medium'),
            'origin': f'Scan Detect Hub ({scan_type.upper()} scan)',
            'affected_users': {'critical': 1000, 'high': 500, 'medium': 150, 'low': 50, 'safe': 10}.get(threat_level, 100),
            'description': (
                f'A {threat_level}-level threat was detected during a {scan_label} scan. '
                f'The strongest indicators include {top_finding_text}. '
                f'This pattern suggests likely credential theft or user redirection risk if interacted with.\n\n'
                f'Scanned content excerpt:\n{scan_excerpt}\n\nTechnical findings:\n{details_text[:500]}'
            ),
            'detailed_analysis': (
                f'The analyzed {scan_label} contains multiple indicators that align with known phishing/malware distribution patterns. '
                f'Primary findings include {top_finding_text}. '
                f'The threat is likely designed to redirect users to attacker-controlled infrastructure or steal credentials. '
                f'Given the {threat_level} risk score, this should be treated as an active threat and triaged quickly. '
                f'Analysts should correlate these indicators with recent events in email gateway, DNS, proxy, and endpoint telemetry. '
                f'If user interaction occurred, perform credential reset and endpoint containment procedures.'
            ),
            'prevention_tips': [
                'Block the indicator set (domain/URL/hash/sender) at gateway and endpoint controls',
                'Notify users not to interact with similar content and verify links through trusted channels',
                'Review DNS/proxy/email logs for matching indicators and investigate affected endpoints',
                'Reset credentials and revoke active sessions for potentially exposed accounts',
            ],
            'real_world_examples': [
                'Lookalike-domain phishing campaigns regularly use short-lived domains to harvest credentials within 24-72 hours.',
                'Vendor-flagged malicious URLs are commonly used in credential theft and malware dropper chains.',
            ],
            'evidence': (
                ('Indicators of compromise:\n' + '\n'.join(f'- {f}' for f in top_findings)
                   if top_findings else 'Indicators of compromise:\n- See scan findings below')
                + '\n\nTechnical evidence:\n'
                + '\n'.join(f"- {d.get('category', 'General')}: {d.get('finding', 'Finding')} ({d.get('severity', 'unknown')})"
                            for d in (details or [])[:6])
            ),
        }

        try:
            client = _get_openai()
            if not client:
                return Response(fallback)

            prompt = (
                f"A {scan_label} scan returned a {threat_level}-level threat (risk score indicates {threat_level} risk).\n"
                f"Scanned content: {content}\n"
                f"Detection findings:\n{details_text}\n\n"
                "Fill a community threat-report form with these fields:\n"
                "- title: a specific, descriptive threat title (max 80 chars) — mention the scan type and key indicator\n"
                "- type: choose the MOST accurate from: Email Phishing, SMS Phishing, Voice Phishing, "
                "Social Media, Malware, Ransomware, QR Code Phishing, Malicious URL, Spear Phishing, Business Email Compromise\n"
                "- severity: one of: Low, Medium, High, Critical\n"
                "- origin: source context string like 'Scan Detect Hub (URL scan)'\n"
                "- affected_users: integer estimate based on likely blast radius\n"
                "- description: 4-6 sentences covering: (1) what the threat is, (2) the specific attack vector/technique, "
                "(3) what indicators were found and why they are suspicious, (4) the likely target audience or goal, "
                "(5) potential impact if the user had interacted with it\n"
                "- detailed_analysis: 6-8 sentences with deeper technical context and response considerations\n"
                "- prevention_tips: JSON array of 4-6 actionable prevention and containment recommendations\n"
                "- real_world_examples: JSON array of 1-3 concise examples of similar incidents/patterns\n"
                "- evidence: IOC-focused bullet list only (no narrative paragraph) including domain/url/email/hash, vendor flags, and technical risk markers\n\n"
                "Hard requirements:\n"
                "1) Mention at least two concrete findings by name from the provided detection findings.\n"
                "2) Include scan-type-specific language (email/url/sms/qr/file) in the title or description.\n"
                "3) Avoid generic wording like 'suspicious threat detected' unless no findings exist.\n\n"
                "4) Do NOT duplicate content between description and evidence.\n"
                "5) Put scanned content excerpt in description only; keep evidence strictly IOC list.\n\n"
                "Respond with ONLY valid JSON containing exactly these 10 keys: title, type, severity, origin, affected_users, description, detailed_analysis, prevention_tips, real_world_examples, evidence. Be specific and detailed — "
                "reference the actual scanned content and specific findings in your response."
            )

            resp = client.chat.completions.create(
                model="gpt-4o-mini",
                messages=[
                    {"role": "system", "content": "You are a senior cybersecurity threat analyst writing a detailed incident report. "
                     "Be specific and reference the actual evidence provided. Respond only with valid JSON, no markdown."},
                    {"role": "user", "content": prompt},
                ],
                max_tokens=900,
                temperature=0.15,
            )
            raw = resp.choices[0].message.content.strip()
            # Strip markdown fences if present
            if raw.startswith('```'):
                raw = raw.split('\n', 1)[-1].rsplit('```', 1)[0].strip()
            suggested = _json.loads(raw)
            # Ensure all required keys exist
            for k in ('title', 'type', 'severity', 'origin', 'affected_users', 'description', 'detailed_analysis', 'prevention_tips', 'real_world_examples', 'evidence'):
                if k not in suggested:
                    suggested[k] = fallback[k]

            if not isinstance(suggested.get('prevention_tips'), list):
                suggested['prevention_tips'] = fallback['prevention_tips']
            if not isinstance(suggested.get('real_world_examples'), list):
                suggested['real_world_examples'] = fallback['real_world_examples']
            try:
                suggested['affected_users'] = int(suggested.get('affected_users', fallback['affected_users']))
            except (TypeError, ValueError):
                suggested['affected_users'] = fallback['affected_users']

            # De-duplicate repeated lines between description and evidence for cleaner UX
            desc_text = str(suggested.get('description', '')).strip()
            evidence_text = str(suggested.get('evidence', '')).strip()
            if desc_text and evidence_text:
                desc_lines = {ln.strip().lower() for ln in desc_text.splitlines() if ln.strip()}
                cleaned_evidence_lines = []
                for ln in evidence_text.splitlines():
                    normalized = ln.strip().lower().lstrip('-').strip()
                    if normalized and normalized not in desc_lines:
                        cleaned_evidence_lines.append(ln)
                suggested['evidence'] = '\n'.join(cleaned_evidence_lines).strip() or fallback['evidence']

            return Response(suggested)
        except Exception:
            return Response(fallback)

    @action(detail=False, methods=['post'], permission_classes=[permissions.IsAuthenticated])
    def ai_fill_community_report(self, request):
        """Use OpenAI to suggest rich community threat-report form fields from user-provided evidence."""
        import json as _json
        evidence_text = str(request.data.get('evidence', ''))[:1000]
        ai_prompt = str(request.data.get('ai_prompt', ''))[:500]

        fallback = {
            'title': 'Suspicious Threat Detected',
            'type': 'Email Phishing',
            'severity': 'Medium',
            'origin': 'Community Report',
            'affected_users': 100,
            'description': f'A suspicious threat was identified. Evidence: {evidence_text[:200]}',
            'detailed_analysis': (
                'Based on the provided evidence, this threat exhibits characteristics '
                'commonly associated with phishing campaigns targeting end users. '
                'Further investigation is recommended.'
            ),
            'prevention_tips': [
                'Do not click suspicious links',
                'Verify sender identity before responding',
                'Enable multi-factor authentication',
            ],
            'real_world_examples': [
                'Similar campaigns have targeted banking customers worldwide',
            ],
        }

        try:
            client = _get_openai()
            if not client:
                return Response(fallback)

            allowed_types = {
                'Email Phishing', 'SMS Phishing', 'Voice Phishing', 'Social Media',
                'Malware', 'Ransomware', 'Spear Phishing', 'Business Email Compromise',
            }
            allowed_severity = {'Low', 'Medium', 'High', 'Critical'}

            prompt = (
                f"A community member is reporting a cybersecurity threat to PhishGuard. "
                f"Here is their evidence / description:\n\n{evidence_text}\n\n"
            )
            if ai_prompt:
                prompt += (
                    "Additional context provided by the reporter (high-priority signal, use this to enrich output):\n"
                    f"{ai_prompt}\n\n"
                )
            prompt += (
                "Based on this, generate a complete threat intelligence report with these fields:\n"
                "- title: concise threat title (max 80 chars)\n"
                "- type: one of: Email Phishing, SMS Phishing, Voice Phishing, Social Media, Malware, Ransomware, Spear Phishing, Business Email Compromise\n"
                "- severity: one of: Low, Medium, High, Critical\n"
                "- origin: where this threat originates (e.g. Russia, Unknown, Dark Web, Social Media)\n"
                "- affected_users: estimated number of users potentially affected (integer)\n"
                "- description: 4-6 sentences describing the threat with concrete details\n"
                "- detailed_analysis: 6-8 sentences with in-depth technical analysis (attack vector, IOCs, likely objective, impact, and defensive recommendations)\n"
                "- prevention_tips: JSON array of 3-5 actionable prevention tips (strings)\n"
                "- real_world_examples: JSON array of 1-3 real-world examples or similar past incidents (strings)\n\n"
                "Hard requirements:\n"
                "1) Do not output generic filler. Reference specific clues from evidence/context.\n"
                "2) If context includes a target, region, or channel, reflect it in title/description/analysis.\n"
                "3) Keep fields concise but information-dense.\n"
                "Respond with ONLY valid JSON containing exactly those keys."
            )

            resp = client.chat.completions.create(
                model="gpt-4o-mini",
                messages=[
                    {"role": "system", "content": "You are a senior cybersecurity analyst. Respond only with valid JSON, no markdown fences."},
                    {"role": "user", "content": prompt},
                ],
                max_tokens=1000,
                temperature=0.2,
            )
            raw = resp.choices[0].message.content.strip()
            if raw.startswith('```'):
                raw = raw.split('\n', 1)[-1].rsplit('```', 1)[0].strip()
            suggested = _json.loads(raw)
            for k, v in fallback.items():
                if k not in suggested:
                    suggested[k] = v
            if suggested.get('type') not in allowed_types:
                suggested['type'] = fallback['type']
            if suggested.get('severity') not in allowed_severity:
                suggested['severity'] = fallback['severity']
            # Ensure list fields are lists
            for list_field in ('prevention_tips', 'real_world_examples'):
                if not isinstance(suggested.get(list_field), list):
                    suggested[list_field] = fallback[list_field]
            # Ensure affected_users is int
            try:
                suggested['affected_users'] = int(suggested.get('affected_users', 100))
            except (TypeError, ValueError):
                suggested['affected_users'] = 100
            return Response(suggested)
        except Exception:
            return Response(fallback)

    @action(detail=False, methods=['post'], permission_classes=[permissions.IsAuthenticated])
    def ai_scan_commentary(self, request):
        """Use OpenAI to generate a human-readable AI analysis summary for scan results."""
        import json as _json
        scan_type = str(request.data.get('scan_type', 'unknown'))
        content = str(request.data.get('content', ''))[:500]
        threat_level = str(request.data.get('threat_level', 'safe'))
        score = int(request.data.get('score', 0))
        details = request.data.get('details', [])

        verdict_map = {
            'safe': 'Safe', 'low': 'Low Risk',
            'medium': 'Moderate Risk', 'high': 'High Risk', 'critical': 'Critical Threat',
        }

        details_text = '\n'.join(
            f"- [{d.get('category', '')}] {d.get('finding', '')}: {d.get('explanation', '')}"
            for d in (details or [])
        ) or 'No specific findings.'

        scan_label = {
            'email': 'email',
            'url': 'URL',
            'sms': 'SMS',
            'qr': 'QR code',
            'file': 'file',
        }.get(scan_type, scan_type)

        finding_names = [str(d.get('finding', '')).strip() for d in (details or []) if str(d.get('finding', '')).strip()]
        top_findings = finding_names[:3]
        danger_count = sum(1 for d in (details or []) if str(d.get('severity', '')).lower() == 'danger')
        warning_count = sum(1 for d in (details or []) if str(d.get('severity', '')).lower() == 'warning')

        if threat_level in ('safe', 'low'):
            fallback_recommendations = [
                f'No immediate action needed for this {scan_label} scan',
                'Keep monitoring similar content for changes in behavior',
            ]
        elif scan_type in ('url', 'qr'):
            fallback_recommendations = [
                'Do not open or share this URL/QR destination',
                'Block the domain and related indicators in your browser/security tools',
                'Report this IOC to your IT/SOC team with the scan findings',
            ]
        elif scan_type == 'email':
            fallback_recommendations = [
                'Do not reply, click links, or open attachments from this message',
                'Report the email with full headers to your security team',
                'Search for similar sender/domain patterns across inboxes',
            ]
        elif scan_type == 'file':
            fallback_recommendations = [
                'Do not execute or share the file',
                'Quarantine the file and run endpoint malware scanning',
                'Collect hash and distribution source for incident response',
            ]
        else:
            fallback_recommendations = [
                'Do not interact with this content',
                'Report this threat to your IT team',
                'Delete or quarantine this content',
            ]

        fallback_confidence = 'High' if (danger_count >= 2 or threat_level in ('high', 'critical')) else ('Medium' if warning_count >= 1 else 'Low')
        fallback_headline = (
            f"{scan_label.upper()} scan: {verdict_map.get(threat_level, threat_level)} — {top_findings[0]}"
            if top_findings else
            f"Scan complete — {verdict_map.get(threat_level, threat_level)} detected"
        )

        fallback = {
            'verdict': verdict_map.get(threat_level, 'Unknown'),
            'headline': fallback_headline,
            'summary': (
                f'This {scan_label} scan returned a threat score of {score}/100 with '
                f'{danger_count} high-risk and {warning_count} warning indicators. '
                + ('No significant threats were found.' if threat_level in ('safe', 'low')
                   else (
                       f'Key findings include {", ".join(top_findings) if top_findings else "detected suspicious patterns"}, '
                       f'suggesting {threat_level}-level risk.'
                   ))
            ),
            'recommendations': fallback_recommendations,
            'confidence': fallback_confidence,
        }

        try:
            client = _get_openai()
            if not client:
                return Response(fallback)

            prompt = (
                f"A PhishGuard {scan_label} scan returned a threat score of {score}/100 ({threat_level} level).\n"
                f"Content analyzed (truncated): {content}\n"
                f"Detection findings:\n{details_text}\n\n"
                "Write a concise AI threat analysis with these JSON fields:\n"
                "- verdict: short risk label (e.g. 'Safe', 'Low Risk', 'High Risk', 'Critical Threat')\n"
                "- headline: one punchy sentence summarizing the risk (max 100 chars)\n"
                "- summary: 2-3 sentences explaining what was found and why it matters to the user\n"
                "- recommendations: JSON array of 2-4 concrete action items the user should take\n"
                "- confidence: one of: Low, Medium, High\n\n"
                "Hard requirements:\n"
                "1) Mention at least one concrete finding name in the headline or summary.\n"
                "2) Recommendations must be scan-type specific (email/url/sms/qr/file), not generic boilerplate.\n"
                "3) Keep language direct and user-friendly.\n\n"
                "Respond with ONLY valid JSON."
            )

            resp = client.chat.completions.create(
                model="gpt-4o-mini",
                messages=[
                    {"role": "system", "content": "You are a cybersecurity advisor explaining scan results to a non-technical user. Be clear, direct, and helpful. Respond only with valid JSON."},
                    {"role": "user", "content": prompt},
                ],
                max_tokens=500,
                temperature=0.25,
            )
            raw = resp.choices[0].message.content.strip()
            if raw.startswith('```'):
                raw = raw.split('\n', 1)[-1].rsplit('```', 1)[0].strip()
            result = _json.loads(raw)
            for k, v in fallback.items():
                if k not in result:
                    result[k] = v
            if not isinstance(result.get('recommendations'), list):
                result['recommendations'] = fallback['recommendations']
            return Response(result)
        except Exception:
            return Response(fallback)

    @action(detail=False, methods=['get'], permission_classes=[permissions.IsAuthenticated])
    def me(self, request):
        return Response(UserSerializer(request.user).data)

    @action(detail=False, methods=['patch'], permission_classes=[permissions.IsAuthenticated])
    def upload_avatar(self, request):
        avatar = request.data.get('avatar', '')
        if not avatar:
            return Response({'error': 'No avatar provided.'}, status=status.HTTP_400_BAD_REQUEST)
        # Basic validation: must be a data URL
        if not avatar.startswith('data:image/'):
            return Response({'error': 'Invalid image format.'}, status=status.HTTP_400_BAD_REQUEST)
        profile, _ = UserProfile.objects.get_or_create(user=request.user)
        profile.avatar = avatar
        profile.save(update_fields=['avatar'])
        return Response({'avatar': avatar})

    @action(detail=False, methods=['post'], permission_classes=[permissions.IsAuthenticated])
    def daily_checkin(self, request):
        user = request.user
        today = timezone.now().date()
        checkin, created = DailyCheckIn.objects.get_or_create(
            user=user,
            date=today,
            defaults={'points_earned': 5}
        )
        if created:
            yesterday = today - timezone.timedelta(days=1)
            profile, _ = UserProfile.objects.get_or_create(user=user)
            if DailyCheckIn.objects.filter(user=user, date=yesterday).exists():
                profile.streak = profile.streak + 1
            else:
                profile.streak = 1
            profile.points += checkin.points_earned
            profile.save(update_fields=['streak', 'points'])
        thirty_ago = today - timezone.timedelta(days=29)
        checkin_dates = list(
            DailyCheckIn.objects.filter(user=user, date__gte=thirty_ago)
            .values_list('date', flat=True)
            .order_by('date')
        )
        profile = user.profile
        return Response({
            'checked_in_today': True,
            'just_checked_in': created,
            'points_earned_today': checkin.points_earned if created else 0,
            'streak': profile.streak,
            'total_points': profile.points,
            'checkin_dates': [str(d) for d in checkin_dates],
        })

    @action(detail=False, methods=['get'], permission_classes=[permissions.IsAuthenticated])
    def checkin_history(self, request):
        user = request.user
        today = timezone.now().date()
        thirty_ago = today - timezone.timedelta(days=29)
        checkin_dates = list(
            DailyCheckIn.objects.filter(user=user, date__gte=thirty_ago)
            .values_list('date', flat=True)
            .order_by('date')
        )
        checked_today = DailyCheckIn.objects.filter(user=user, date=today).exists()
        profile = user.profile
        return Response({
            'checked_in_today': checked_today,
            'streak': profile.streak,
            'total_points': profile.points,
            'checkin_dates': [str(d) for d in checkin_dates],
        })

    @action(detail=False, methods=['patch'], permission_classes=[permissions.IsAuthenticated])
    def update_profile(self, request):
        user = request.user
        user.first_name = request.data.get('first_name', user.first_name)
        user.last_name = request.data.get('last_name', user.last_name)
        user.save()
        return Response(UserSerializer(user).data)

    @action(detail=False, methods=['post'], permission_classes=[permissions.IsAuthenticated])
    def change_password(self, request):
        user = request.user
        old_password = request.data.get('old_password', '')
        new_password = request.data.get('new_password', '')
        if not old_password or not new_password:
            return Response({'error': 'Old and new passwords are required.'}, status=status.HTTP_400_BAD_REQUEST)
        if len(new_password) < 6:
            return Response({'error': 'New password must be at least 6 characters.'}, status=status.HTTP_400_BAD_REQUEST)
        if not user.check_password(old_password):
            return Response({'error': 'Current password is incorrect.'}, status=status.HTTP_400_BAD_REQUEST)
        user.set_password(new_password)
        user.save()
        login(request, user)  # keep the session alive
        SystemLog.objects.create(level='INFO', message=f"Password changed for {user.username}")
        return Response({'detail': 'Password updated successfully.'})

    @action(detail=False, methods=['get'], permission_classes=[permissions.IsAuthenticated])
    def dashboard(self, request):
        user = request.user
        profile, _ = UserProfile.objects.get_or_create(user=user)
        recent_scans = ScanHistory.objects.filter(user=user).order_by('-created_at')[:5]
        learning_done = LearningProgress.objects.filter(user=user, completed=True).count()
        total_modules = LearningModule.objects.count()

        trend_data = []
        for days_ago in range(6, -1, -1):
            day = timezone.now().date() - timezone.timedelta(days=days_ago)
            day_scans = ScanHistory.objects.filter(user=user, created_at__date=day)
            trend_data.append({
                "date": day.strftime('%a'),
                "threats": day_scans.exclude(threat_level='safe').count(),
                "total": day_scans.count(),
            })

        return Response({
            "securityScore": min(100, max(0, profile.points)),
            "scansUsed": profile.scans_used,
            "scansLimit": profile.scans_limit,
            "apiCallsUsed": profile.api_calls_used,
            "apiCallsLimit": profile.api_calls_limit,
            "alertsUsed": profile.alerts_used,
            "alertsLimit": profile.alerts_limit,
            "renewalDate": profile.get_renewal_date_str(),
            "learningProgress": {"completed": learning_done, "total": total_modules},
            "recentScans": ScanHistorySerializer(recent_scans, many=True).data,
            "streak": profile.streak,
            "tier": profile.tier,
            "trendData": trend_data,
        })

    @action(detail=False, methods=['get'], permission_classes=[permissions.IsAuthenticated])
    def activity(self, request):
        user = request.user
        events = []

        for scan in ScanHistory.objects.filter(user=user).order_by('-created_at')[:5]:
            events.append({
                "type": "scan",
                "description": f"Scanned {scan.type}: {scan.content[:60]}",
                "result": scan.threat_level,
                "timestamp": scan.created_at.isoformat(),
                "ref_id": str(scan.id),
            })
        for prog in LearningProgress.objects.filter(user=user, completed=True).order_by('-completed_at')[:3]:
            if prog.completed_at:
                events.append({
                    "type": "learning",
                    "description": f"Completed: {prog.module.title}",
                    "result": "completed",
                    "timestamp": prog.completed_at.isoformat(),
                    "ref_id": str(prog.module.id),
                })
        for report in ThreatReport.objects.filter(user=user).order_by('-created_at')[:3]:
            events.append({
                "type": "report",
                "description": f"Reported threat: {report.title}",
                "result": report.status,
                "timestamp": report.created_at.isoformat(),
                "ref_id": str(report.id),
            })

        events.sort(key=lambda x: x['timestamp'], reverse=True)
        return Response(events[:10])

    @action(detail=False, methods=['get'], permission_classes=[permissions.IsAuthenticated])
    def recommendations(self, request):
        done_ids = LearningProgress.objects.filter(
            user=request.user, completed=True
        ).values_list('module_id', flat=True)
        modules = LearningModule.objects.exclude(id__in=done_ids)[:3]
        return Response(LearningModuleSerializer(modules, many=True, context={'request': request}).data)



# Scan


@ensure_csrf_cookie
def csrf_view(request):
    """GET this endpoint to receive the csrftoken cookie."""
    return JsonResponse({'detail': 'CSRF cookie set', 'csrf_token': get_token(request)})


class ScanViewSet(viewsets.ModelViewSet):
    queryset = ScanHistory.objects.all()
    serializer_class = ScanHistorySerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return ScanHistory.objects.filter(user=self.request.user).order_by('-created_at')

    def list(self, request, *args, **kwargs):
        try:
            page = int(request.query_params.get('page', 1))
            page_size = int(request.query_params.get('page_size', 20))
        except ValueError:
            page, page_size = 1, 20
        qs = self.get_queryset()
        total = qs.count()
        start = (page - 1) * page_size
        data = ScanHistorySerializer(qs[start:start + page_size], many=True).data
        return Response({"count": total, "page": page, "page_size": page_size, "results": data})

    @action(detail=False, methods=['get'], permission_classes=[permissions.AllowAny])
    def stats(self, request):
        today = timezone.now().date()
        total = ScanHistory.objects.count()
        detected = ScanHistory.objects.exclude(threat_level='safe').count()
        rate = round(detected / total * 100, 1) if total > 0 else 99.7
        return Response({
            "threatsBlockedToday": ScanHistory.objects.filter(created_at__date=today).exclude(threat_level='safe').count(),
            "detectionRate": f"{rate}%",
            "totalScans": total,
            "activeScans": ScanHistory.objects.filter(created_at__date=today).count(),
        })

    @action(detail=False, methods=['post'])
    def perform_scan(self, request):
        user = request.user
        profile, _ = UserProfile.objects.get_or_create(user=user)

        if profile.tier == 'free' and profile.scans_used >= profile.scans_limit:
            return Response(
                {"error": "Scan limit reached. Upgrade to Pro for more scans."},
                status=status.HTTP_403_FORBIDDEN,
            )

        scan_type = request.data.get('type', '').strip()
        content = request.data.get('content', '').strip()
        if scan_type == 'attachment':
            scan_type = 'file'

        if not scan_type or not content:
            return Response({"error": "type and content are required."}, status=status.HTTP_400_BAD_REQUEST)
        if scan_type not in ('email', 'url', 'file', 'qr'):
            return Response({"error": "type must be: email, url, file, or qr."}, status=status.HTTP_400_BAD_REQUEST)

        analysis = _analyze(scan_type, content)
        scan = ScanHistory.objects.create(
            user=user, type=scan_type, content=content,
            threat_level=analysis['threat_level'],
            score=analysis['score'], details=analysis['details'],
        )
        profile.scans_used += 1
        profile.api_calls_used += 1
        profile.save()
        SystemLog.objects.create(
            level='INFO',
            message=f"User {user.username} scanned {scan_type}: {analysis['threat_level']} (score={analysis['score']})",
        )
        return Response(ScanHistorySerializer(scan).data)



# Threat Reports


@method_decorator(csrf_exempt, name='dispatch')
class ThreatReportViewSet(viewsets.ModelViewSet):
    queryset = ThreatReport.objects.all()
    serializer_class = ThreatReportSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_permissions(self):
        if self.action in ('update', 'partial_update', 'destroy'):
            return [IsAdminUser()]
        return super().get_permissions()

    def get_queryset(self):
        if hasattr(self.request.user, 'profile') and self.request.user.profile.role == 'admin':
            return ThreatReport.objects.all().order_by('-created_at')
        return ThreatReport.objects.filter(user=self.request.user).order_by('-created_at')

    def perform_create(self, serializer):
        import uuid as _uuid
        import json as _json
        from content.models import ThreatIntelligence
        report = serializer.save(user=self.request.user)
        SystemLog.objects.create(level='WARN', message=f"New threat report by {self.request.user.username}")

        # Try to parse extra rich fields from the evidence JSON blob
        raw_evidence = report.evidence or ''
        extra = {}
        text_evidence = raw_evidence
        try:
            parsed = _json.loads(raw_evidence)
            if isinstance(parsed, dict):
                extra = parsed
                text_evidence = parsed.get('text_evidence', '')
        except (ValueError, TypeError):
            pass

        # Also create a ThreatIntelligence entry so the report appears in the Threat DB
        severity_map = {'Low': 'low', 'Medium': 'medium', 'High': 'high', 'Critical': 'critical'}
        severity = severity_map.get(report.risk_level, 'medium')
        threat_id = f"community-{_uuid.uuid4().hex[:8]}"
        detected_date = extra.get('detected_date') or timezone.now().strftime('%Y-%m-%d')
        affected_users = int(extra.get('affected_users') or 0)
        origin = str(extra.get('origin') or 'Community Report')
        detailed_analysis = str(extra.get('detailed_analysis') or (
            f"{report.description}\n\nEvidence:\n{text_evidence or 'N/A'}"
        ))
        prevention_tips = extra.get('prevention_tips') if isinstance(extra.get('prevention_tips'), list) else []
        real_world_examples = extra.get('real_world_examples') if isinstance(extra.get('real_world_examples'), list) else []
        ThreatIntelligence.objects.create(
            threat_id=threat_id,
            title=report.title,
            type=report.threat_type,
            severity=severity,
            detected_date=detected_date,
            affected_users=affected_users,
            description=report.description,
            image='',
            alt=report.title,
            origin=origin,
            status='active',
            community_reports=1,
            detailed_analysis=detailed_analysis,
            prevention_tips=prevention_tips,
            real_world_examples=real_world_examples,
            related_threats=[],
            community_insights=[
                {
                    'user': report.user.username,
                    'date': timezone.now().strftime('%m/%d/%Y'),
                    'insight': f"Initial community report submitted: {report.title}",
                }
            ],
        )



# Learning Lab


class LearningLabViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = LearningModule.objects.all()
    serializer_class = LearningModuleSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_serializer_context(self):
        ctx = super().get_serializer_context()
        ctx['request'] = self.request
        return ctx

    @action(detail=False, methods=['get'], permission_classes=[permissions.AllowAny])
    def highlights(self, request):
        """Public endpoint: top 3 modules ordered by difficulty for the homepage."""
        order = {'beginner': 0, 'intermediate': 1, 'advanced': 2}
        modules = list(LearningModule.objects.all())
        modules.sort(key=lambda m: order.get(m.difficulty, 99))
        top = modules[:3]
        return Response(LearningModuleSerializer(top, many=True, context={'request': request}).data)

    @action(detail=True, methods=['post'])
    def complete(self, request, pk=None):
        PASSING_SCORE = 60  # user must score >= 60% to earn points and mark complete
        module = self.get_object()
        score = int(request.data.get('score', 0))
        passed = score >= PASSING_SCORE

        if not passed:
            return Response(
                {"status": "failed", "passed": False, "score": score, "passing_score": PASSING_SCORE,
                 "message": f"Score {score}% is below the passing threshold of {PASSING_SCORE}%. Try again!"},
                status=status.HTTP_200_OK,
            )

        progress, _ = LearningProgress.objects.get_or_create(user=request.user, module=module)
        points_earned = 0
        if not progress.completed:
            profile = request.user.profile
            profile.points += module.points
            profile.save()
            points_earned = module.points
            progress.completed = True
            progress.score = score
            progress.completed_at = timezone.now()
            progress.save()
            SystemLog.objects.create(level='INFO', message=f"User {request.user.username} completed: {module.title}")
        return Response({"status": "completed", "passed": True, "score": score, "points_earned": points_earned})

    @action(detail=False, methods=['get'])
    def leaderboard(self, request):
        profiles = UserProfile.objects.all().order_by('-points')[:10]
        data = [
            {
                "rank": i + 1, "name": p.user.username, "score": p.points,
                "challengesCompleted": LearningProgress.objects.filter(user=p.user, completed=True).count(),
                "badge": p.tier.capitalize(),
            }
            for i, p in enumerate(profiles)
        ]
        return Response(data)

    @action(detail=False, methods=['get'])
    def stats(self, request):
        profile = request.user.profile
        return Response({
            "totalChallenges": LearningModule.objects.count(),
            "completedChallenges": LearningProgress.objects.filter(user=request.user, completed=True).count(),
            "currentStreak": profile.streak,
            "securityScore": min(100, max(0, profile.points)),
        })



# Bookmarks


@method_decorator(csrf_exempt, name='dispatch')
class BookmarkViewSet(viewsets.ModelViewSet):
    serializer_class = BookmarkSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Bookmark.objects.filter(user=self.request.user).order_by('-created_at')

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

    def create(self, request, *args, **kwargs):
        threat_id = request.data.get('threat_id')
        existing = Bookmark.objects.filter(user=request.user, threat_id=threat_id).first()
        if existing:
            return Response(BookmarkSerializer(existing).data)
        return super().create(request, *args, **kwargs)



# Custom Alerts


@method_decorator(csrf_exempt, name='dispatch')
class CustomAlertViewSet(viewsets.ModelViewSet):
    serializer_class = CustomAlertSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return CustomAlert.objects.filter(user=self.request.user).order_by('-created_at')

    def perform_create(self, serializer):
        profile = self.request.user.profile
        if profile.tier == 'free' and profile.alerts_used >= profile.alerts_limit:
            from rest_framework.exceptions import PermissionDenied
            raise PermissionDenied("Alert limit reached. Upgrade to Pro for unlimited alerts.")
        serializer.save(user=self.request.user)
        profile.alerts_used += 1
        profile.save()



# Mitigated Threats


@method_decorator(csrf_exempt, name='dispatch')
class MitigatedThreatViewSet(viewsets.ModelViewSet):
    serializer_class = MitigatedThreatSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return MitigatedThreat.objects.filter(user=self.request.user).order_by('-created_at')

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

    def create(self, request, *args, **kwargs):
        threat_id = request.data.get('threat_id')
        existing = MitigatedThreat.objects.filter(user=request.user, threat_id=threat_id).first()
        if existing:
            return Response(MitigatedThreatSerializer(existing).data)
        return super().create(request, *args, **kwargs)



# Admin


@method_decorator(csrf_exempt, name='dispatch')
class AdminViewSet(viewsets.ViewSet):
    permission_classes = [IsAdminUser]
    queryset = User.objects.all()

    @action(detail=False, methods=['get'])
    def overview(self, request):
        from datetime import timedelta
        today = timezone.now().date()
        yesterday = today - timedelta(days=1)
        week_ago = today - timedelta(days=7)

        users_total = User.objects.count()
        new_users_week = User.objects.filter(date_joined__date__gte=week_ago).count()
        new_users_today = User.objects.filter(date_joined__date=today).count()

        threats_total = ScanHistory.objects.exclude(threat_level='safe').count()
        threats_today = ScanHistory.objects.filter(created_at__date=today).exclude(threat_level='safe').count()

        scans_today = ScanHistory.objects.filter(created_at__date=today).count()
        scans_yesterday = ScanHistory.objects.filter(created_at__date=yesterday).count()
        scans_delta = scans_today - scans_yesterday
        scans_change = (f"+{scans_delta}" if scans_delta >= 0 else str(scans_delta)) + " vs yesterday"

        pending = ThreatReport.objects.filter(status='pending').count()
        new_reports_today = ThreatReport.objects.filter(created_at__date=today).count()

        return Response({
            "stats": [
                {"title": "Total Users", "value": users_total, "change": f"+{new_users_week} this week", "positive": True, "icon": "UsersIcon", "color": "bg-blue-500"},
                {"title": "Threats Detected", "value": threats_total, "change": f"+{threats_today} today", "positive": threats_today == 0, "icon": "ExclamationTriangleIcon", "color": "bg-red-500"},
                {"title": "Scans Today", "value": scans_today, "change": scans_change, "positive": scans_delta >= 0, "icon": "MagnifyingGlassIcon", "color": "bg-green-500"},
                {"title": "Pending Reports", "value": pending, "change": f"+{new_reports_today} today", "positive": new_reports_today == 0, "icon": "FlagIcon", "color": "bg-purple-500"},
            ],
            "todayStats": {
                "newUsers": new_users_today,
                "scansToday": scans_today,
                "threatsToday": threats_today,
                "newReports": new_reports_today,
            },
            "recentActivity": SystemLogSerializer(SystemLog.objects.all().order_by('-created_at')[:10], many=True).data,
        })

    @action(detail=False, methods=['get'])
    def users(self, request):
        return Response(AdminUserSerializer(User.objects.all().order_by('-date_joined'), many=True).data)

    @action(detail=False, methods=['get'])
    def scan_history(self, request):
        scans = ScanHistory.objects.select_related('user').order_by('-created_at')[:100]
        data = []
        for s in scans:
            data.append({
                'id': s.id,
                'username': s.user.username,
                'type': s.type,
                'content': (s.content or '')[:100],
                'threat_level': s.threat_level,
                'score': s.score,
                'created_at': s.created_at.isoformat(),
            })
        return Response(data)

    @action(detail=True, methods=['post'])
    def delete_scan(self, request, pk=None):
        try:
            scan = ScanHistory.objects.select_related('user').get(pk=pk)
        except ScanHistory.DoesNotExist:
            return Response({"error": "Scan not found."}, status=status.HTTP_404_NOT_FOUND)

        username = scan.user.username
        scan_type = scan.type
        scan.delete()
        SystemLog.objects.create(level='WARN', message=f"Admin deleted scan #{pk} ({scan_type}) for user {username}")
        return Response({"status": "deleted"})

    @action(detail=True, methods=['post'])
    def update_user_status(self, request, pk=None):
        try:
            user = User.objects.get(pk=pk)
        except User.DoesNotExist:
            return Response({"error": "User not found."}, status=status.HTTP_404_NOT_FOUND)
        profile, _ = UserProfile.objects.get_or_create(user=user)
        profile.status = request.data.get('status', profile.status)
        profile.role = request.data.get('role', profile.role)
        new_tier = request.data.get('tier')
        if new_tier:
            profile.tier = new_tier
            profile.apply_tier_limits()
        profile.save()
        SystemLog.objects.create(level='INFO', message=f"Admin updated {user.username}: status={profile.status}, role={profile.role}, tier={profile.tier}")
        return Response({"status": "updated"})

    @action(detail=True, methods=['post'])
    def delete_user(self, request, pk=None):
        try:
            user = User.objects.get(pk=pk)
        except User.DoesNotExist:
            return Response({"error": "User not found."}, status=status.HTTP_404_NOT_FOUND)
        username = user.username
        user.delete()
        SystemLog.objects.create(level='WARN', message=f"Admin deleted user: {username}")
        return Response({"status": "deleted"})

    @action(detail=True, methods=['post'])
    def update_report_status(self, request, pk=None):
        try:
            report = ThreatReport.objects.get(pk=pk)
        except ThreatReport.DoesNotExist:
            return Response({"error": "Report not found."}, status=status.HTTP_404_NOT_FOUND)
        old_status = report.status
        report.status = request.data.get('status', report.status)
        report.save()
        SystemLog.objects.create(level='INFO', message=f"Admin changed report #{report.id}: '{old_status}' → '{report.status}'")
        return Response({"status": "updated"})

    @action(detail=False, methods=['get'])
    def logs(self, request):
        level = request.query_params.get('level', '').upper()
        qs = SystemLog.objects.all().order_by('-created_at')
        if level in ('INFO', 'WARN', 'ERROR'):
            qs = qs.filter(level=level)
        logs = qs[:100]
        return Response({
            'logs': SystemLogSerializer(logs, many=True).data,
            'counts': {
                'INFO': SystemLog.objects.filter(level='INFO').count(),
                'WARN': SystemLog.objects.filter(level='WARN').count(),
                'ERROR': SystemLog.objects.filter(level='ERROR').count(),
            },
        })

    # ── Learning Modules ────────────────────────────────────────────────────

    @action(detail=False, methods=['get'])
    def modules(self, request):
        mods = LearningModule.objects.all().order_by('id')
        data = []
        for m in mods:
            completion_count = LearningProgress.objects.filter(module=m, completed=True).count()
            data.append({
                'id': m.id,
                'title': m.title,
                'description': m.description,
                'type': m.type,
                'difficulty': m.difficulty,
                'duration': m.duration,
                'points': m.points,
                'icon': m.icon,
                'completions': completion_count,
                'has_content': bool(m.content_data),
                'content_data': m.content_data or {},
            })
        return Response(data)

    @action(detail=False, methods=['post'])
    def create_module(self, request):
        d = request.data
        required = ['title', 'description', 'type', 'difficulty']
        for f in required:
            if not d.get(f):
                return Response({'error': f'{f} is required.'}, status=status.HTTP_400_BAD_REQUEST)
        m = LearningModule.objects.create(
            title=d['title'],
            description=d['description'],
            type=d['type'],
            difficulty=d['difficulty'],
            duration=d.get('duration', '15 min'),
            points=int(d.get('points', 100)),
            icon=d.get('icon', 'AcademicCapIcon'),
            content_data=d.get('content_data', {}),
        )
        SystemLog.objects.create(level='INFO', message=f"Admin created module: {m.title}")
        return Response({'status': 'created', 'id': m.id})

    @action(detail=True, methods=['post'])
    def update_module(self, request, pk=None):
        try:
            m = LearningModule.objects.get(pk=pk)
        except LearningModule.DoesNotExist:
            return Response({'error': 'Not found.'}, status=status.HTTP_404_NOT_FOUND)
        d = request.data
        m.title = d.get('title', m.title)
        m.description = d.get('description', m.description)
        m.type = d.get('type', m.type)
        m.difficulty = d.get('difficulty', m.difficulty)
        m.duration = d.get('duration', m.duration)
        m.points = int(d.get('points', m.points))
        m.icon = d.get('icon', m.icon)
        if 'content_data' in d:
            m.content_data = d['content_data']
        m.save()
        SystemLog.objects.create(level='INFO', message=f"Admin updated module: {m.title}")
        return Response({'status': 'updated'})

    @action(detail=True, methods=['post'])
    def delete_module(self, request, pk=None):
        try:
            m = LearningModule.objects.get(pk=pk)
        except LearningModule.DoesNotExist:
            return Response({'error': 'Not found.'}, status=status.HTTP_404_NOT_FOUND)
        title = m.title
        m.delete()
        SystemLog.objects.create(level='WARN', message=f"Admin deleted module: {title}")
        return Response({'status': 'deleted'})

    # ── Community Comments ──────────────────────────────────────────────────

    @action(detail=False, methods=['get'])
    def comments(self, request):
        from content.models import ThreatIntelligence
        result = []
        for threat in ThreatIntelligence.objects.exclude(community_insights=[]).order_by('title'):
            insights = threat.community_insights or []
            for idx, c in enumerate(insights):
                if isinstance(c, dict):
                    user = c.get('user', 'Unknown')
                    date = c.get('date', '')
                    insight = c.get('insight', '')
                else:
                    # Backward compatibility: older records stored plain strings.
                    user = 'Community'
                    date = ''
                    insight = str(c)
                result.append({
                    'threat_id': threat.threat_id,
                    'threat_title': threat.title,
                    'comment_index': idx,
                    'user': user,
                    'date': date,
                    'insight': insight,
                })
        return Response(result)

    @action(detail=False, methods=['post'])
    def delete_comment(self, request):
        from content.models import ThreatIntelligence
        threat_id = request.data.get('threat_id')
        comment_index = request.data.get('comment_index')
        if threat_id is None or comment_index is None:
            return Response({'error': 'threat_id and comment_index required.'}, status=status.HTTP_400_BAD_REQUEST)
        try:
            threat = ThreatIntelligence.objects.get(threat_id=threat_id)
        except ThreatIntelligence.DoesNotExist:
            return Response({'error': 'Threat not found.'}, status=status.HTTP_404_NOT_FOUND)
        insights = list(threat.community_insights or [])
        idx = int(comment_index)
        if idx < 0 or idx >= len(insights):
            return Response({'error': 'Comment index out of range.'}, status=status.HTTP_400_BAD_REQUEST)
        removed = insights.pop(idx)
        threat.community_insights = insights
        threat.save()
        removed_user = removed.get('user', 'Community') if isinstance(removed, dict) else 'Community'
        SystemLog.objects.create(level='WARN', message=f"Admin deleted comment by '{removed_user}' on threat '{threat.title}'")
        return Response({'status': 'deleted'})

    # ── Bookmarks ───────────────────────────────────────────────────────────

    @action(detail=False, methods=['get'])
    def all_bookmarks(self, request):
        bookmarks = Bookmark.objects.select_related('user').order_by('-created_at')
        data = []
        for b in bookmarks:
            data.append({
                'id': b.id,
                'username': b.user.username,
                'threat_id': b.threat_id,
                'threat_title': b.threat_title,
                'threat_type': b.threat_type,
                'threat_severity': b.threat_severity,
                'created_at': b.created_at.isoformat(),
            })
        return Response(data)

    @action(detail=True, methods=['post'])
    def delete_bookmark(self, request, pk=None):
        try:
            b = Bookmark.objects.get(pk=pk)
        except Bookmark.DoesNotExist:
            return Response({'error': 'Not found.'}, status=status.HTTP_404_NOT_FOUND)
        username = b.user.username
        title = b.threat_title
        b.delete()
        SystemLog.objects.create(level='WARN', message=f"Admin deleted bookmark: '{title}' for user {username}")
        return Response({'status': 'deleted'})

    # ── Custom Alerts ───────────────────────────────────────────────────────

    @action(detail=False, methods=['get'])
    def all_alerts(self, request):
        alerts = CustomAlert.objects.select_related('user').order_by('-created_at')
        data = []
        for a in alerts:
            data.append({
                'id': a.id,
                'username': a.user.username,
                'title': a.title,
                'keyword': a.keyword,
                'threat_type': a.threat_type,
                'min_severity': a.min_severity,
                'active': a.active,
                'created_at': a.created_at.isoformat(),
            })
        return Response(data)

    @action(detail=True, methods=['post'])
    def delete_alert(self, request, pk=None):
        try:
            a = CustomAlert.objects.get(pk=pk)
        except CustomAlert.DoesNotExist:
            return Response({'error': 'Not found.'}, status=status.HTTP_404_NOT_FOUND)
        username = a.user.username
        title = a.title
        a.delete()
        SystemLog.objects.create(level='WARN', message=f"Admin deleted alert: '{title}' for user {username}")
        return Response({'status': 'deleted'})

    @action(detail=True, methods=['post'])
    def toggle_alert(self, request, pk=None):
        try:
            a = CustomAlert.objects.get(pk=pk)
        except CustomAlert.DoesNotExist:
            return Response({'error': 'Not found.'}, status=status.HTTP_404_NOT_FOUND)
        a.active = not a.active
        a.save()
        return Response({'status': 'updated', 'active': a.active})

    # ── Learning Progress (global) ──────────────────────────────────────────

    @action(detail=False, methods=['get'])
    def learning_stats(self, request):
        total_completions = LearningProgress.objects.filter(completed=True).count()
        top_modules = []
        for m in LearningModule.objects.all():
            cnt = LearningProgress.objects.filter(module=m, completed=True).count()
            avg_score_data = LearningProgress.objects.filter(module=m, completed=True)
            avg = round(sum(p.score for p in avg_score_data) / cnt, 1) if cnt else 0
            top_modules.append({'title': m.title, 'type': m.type, 'completions': cnt, 'avg_score': avg})
        top_modules.sort(key=lambda x: x['completions'], reverse=True)
        active_learners = LearningProgress.objects.filter(completed=True).values('user').distinct().count()
        return Response({
            'total_completions': total_completions,
            'active_learners': active_learners,
            'top_modules': top_modules[:10],
        })

    # ── Industry Recognition & Partnerships ────────────────────────────────

    @action(detail=False, methods=['get'])
    def trust_signals(self, request):
        from content.models import TrustSignal
        data = []
        for ts in TrustSignal.objects.all().order_by('type', 'name'):
            data.append({
                'id': ts.id,
                'type': ts.type,
                'name': ts.name,
                'description': ts.description,
                'logo': ts.logo,
                'alt': ts.alt,
            })
        return Response(data)

    @action(detail=False, methods=['post'])
    def create_trust_signal(self, request):
        from content.models import TrustSignal
        d = request.data
        for f in ['type', 'name', 'description']:
            if not d.get(f):
                return Response({'error': f'{f} is required.'}, status=status.HTTP_400_BAD_REQUEST)
        ts = TrustSignal.objects.create(
            type=d['type'],
            name=d['name'],
            description=d['description'],
            logo=d.get('logo', ''),
            alt=d.get('alt', d['name']),
        )
        SystemLog.objects.create(level='INFO', message=f"Admin added trust signal: {ts.name}")
        return Response({'status': 'created', 'id': ts.id})

    @action(detail=True, methods=['post'])
    def update_trust_signal(self, request, pk=None):
        from content.models import TrustSignal
        try:
            ts = TrustSignal.objects.get(pk=pk)
        except TrustSignal.DoesNotExist:
            return Response({'error': 'Not found.'}, status=status.HTTP_404_NOT_FOUND)
        d = request.data
        ts.type = d.get('type', ts.type)
        ts.name = d.get('name', ts.name)
        ts.description = d.get('description', ts.description)
        ts.logo = d.get('logo', ts.logo)
        ts.alt = d.get('alt', ts.alt)
        ts.save()
        SystemLog.objects.create(level='INFO', message=f"Admin updated trust signal: {ts.name}")
        return Response({'status': 'updated'})

    @action(detail=True, methods=['post'])
    def delete_trust_signal(self, request, pk=None):
        from content.models import TrustSignal
        try:
            ts = TrustSignal.objects.get(pk=pk)
        except TrustSignal.DoesNotExist:
            return Response({'error': 'Not found.'}, status=status.HTTP_404_NOT_FOUND)
        name = ts.name
        ts.delete()
        SystemLog.objects.create(level='WARN', message=f"Admin deleted trust signal: {name}")
        return Response({'status': 'deleted'})

    # ── Threat Intelligence Database ────────────────────────────────

    @action(detail=False, methods=['get'])
    def threat_db_list(self, request):
        from content.models import ThreatIntelligence
        qs = ThreatIntelligence.objects.all().order_by('-detected_date')
        search = request.query_params.get('search', '')
        if search:
            qs = qs.filter(title__icontains=search) | qs.filter(type__icontains=search)
        data = []
        for t in qs:
            data.append({
                'id': t.pk,
                'threat_id': t.threat_id,
                'title': t.title,
                'type': t.type,
                'severity': t.severity,
                'detected_date': t.detected_date,
                'affected_users': t.affected_users,
                'description': t.description,
                'image': t.image,
                'alt': t.alt,
                'origin': t.origin,
                'status': t.status,
                'community_reports': t.community_reports,
                'detailed_analysis': t.detailed_analysis,
                'prevention_tips': t.prevention_tips or [],
                'real_world_examples': t.real_world_examples or [],
                'related_threats': t.related_threats or [],
                'community_insights': t.community_insights or [],
            })
        return Response(data)

    @action(detail=False, methods=['post'])
    def create_threat_db(self, request):
        from content.models import ThreatIntelligence
        d = request.data
        for f in ['threat_id', 'title', 'type', 'severity', 'description']:
            if not d.get(f):
                return Response({'error': f'{f} is required.'}, status=status.HTTP_400_BAD_REQUEST)
        if ThreatIntelligence.objects.filter(threat_id=d['threat_id']).exists():
            return Response({'error': 'threat_id already exists.'}, status=status.HTTP_400_BAD_REQUEST)
        t = ThreatIntelligence.objects.create(
            threat_id=d['threat_id'],
            title=d['title'],
            type=d['type'],
            severity=d['severity'],
            detected_date=d.get('detected_date', ''),
            affected_users=int(d.get('affected_users', 0)),
            description=d['description'],
            image=d.get('image', ''),
            alt=d.get('alt', ''),
            origin=d.get('origin', ''),
            status=d.get('status', 'active'),
            community_reports=int(d.get('community_reports', 0)),
            detailed_analysis=d.get('detailed_analysis', ''),
            prevention_tips=d.get('prevention_tips', []),
            real_world_examples=d.get('real_world_examples', []),
            related_threats=d.get('related_threats', []),
        )
        SystemLog.objects.create(level='INFO', message=f"Admin created threat: {t.title}")
        return Response({'status': 'created', 'id': t.pk})

    @action(detail=True, methods=['post'])
    def update_threat_db(self, request, pk=None):
        from content.models import ThreatIntelligence
        try:
            t = ThreatIntelligence.objects.get(pk=pk)
        except ThreatIntelligence.DoesNotExist:
            return Response({'error': 'Not found.'}, status=status.HTTP_404_NOT_FOUND)
        d = request.data
        t.title = d.get('title', t.title)
        t.type = d.get('type', t.type)
        t.severity = d.get('severity', t.severity)
        t.detected_date = d.get('detected_date', t.detected_date)
        t.affected_users = int(d.get('affected_users', t.affected_users))
        t.description = d.get('description', t.description)
        t.image = d.get('image', t.image)
        t.alt = d.get('alt', t.alt)
        t.origin = d.get('origin', t.origin)
        t.status = d.get('status', t.status)
        t.community_reports = int(d.get('community_reports', t.community_reports))
        t.detailed_analysis = d.get('detailed_analysis', t.detailed_analysis)
        if 'prevention_tips' in d:
            t.prevention_tips = d['prevention_tips']
        if 'real_world_examples' in d:
            t.real_world_examples = d['real_world_examples']
        if 'related_threats' in d:
            t.related_threats = d['related_threats']
        t.save()
        SystemLog.objects.create(level='INFO', message=f"Admin updated threat: {t.title}")
        return Response({'status': 'updated'})

    @action(detail=True, methods=['post'])
    def delete_threat_db(self, request, pk=None):
        from content.models import ThreatIntelligence
        try:
            t = ThreatIntelligence.objects.get(pk=pk)
        except ThreatIntelligence.DoesNotExist:
            return Response({'error': 'Not found.'}, status=status.HTTP_404_NOT_FOUND)
        title = t.title
        t.delete()
        SystemLog.objects.create(level='WARN', message=f"Admin deleted threat: {title}")
        return Response({'status': 'deleted'})
