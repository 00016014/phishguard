# Backend Function Reference

Primary file: `backend/api/views.py`
Secondary file: `backend/content/views.py`

This reference documents backend functions used by frontend and admin workflows.

## 1) Shared Helpers (`backend/api/views.py`)

- `_get_openai()`
  - Lazy-initializes OpenAI client from `OPENAI_API_KEY`.
- `_ai_email(prompt, fallback)`
  - Generates email body text via OpenAI; falls back safely on error.
- `_analyze_url(url)`
  - URL heuristics (suspicious TLDs, shorteners, impersonation, protocol, etc).
- `_virustotal_enrich(url, score, details)`
  - Optional VirusTotal fetch + signal enrichment.
- `_score_to_level(score)`
  - Converts numeric score into threat level bucket.
- `_analyze(scan_type, content)`
  - Main scanner dispatcher for email/url/file/qr.

Code snippet (scanner pipeline):

```python
analysis = _analyze(scan_type, content)
scan = ScanHistory.objects.create(
    user=user, type=scan_type, content=content,
    threat_level=analysis['threat_level'],
    score=analysis['score'], details=analysis['details'],
)
```

## 2) Permission Class

- `IsAdminUser.has_permission(request, view)`
  - Restricts admin-only routes to authenticated users with profile role `admin`.

## 3) UserViewSet (`/api/users/*`)

Model: `django.contrib.auth.models.User`

### Routing and permission control

- `get_permissions()`
  - Dynamic permission by action (public auth actions vs authenticated profile actions vs admin CRUD).

### Auth and account functions

- `login(request)`
  - Username or email login, suspended-user guard, session creation.
- `logout(request)`
  - Session logout.
- `register(request)`
  - Creates registration OTP and sends email; does not create account yet.
- `verify_registration_otp(request)`
  - Validates OTP and creates account.
- `request_password_reset(request)`
  - Sends password reset OTP.
- `verify_reset_otp(request)`
  - Validates reset OTP and updates password.
- `reset_password(request)`
  - Legacy UID/token reset endpoint.

### AI helper actions

- `ai_fill_threat_report(request)`
  - AI prefill for threat report from scan context.
- `ai_fill_community_report(request)`
  - AI prefill for community report from free text evidence.
- `ai_scan_commentary(request)`
  - AI verdict/headline/summary/recommendations from scan output.

### User self-service actions

- `me(request)`
  - Current user profile payload.
- `upload_avatar(request)`
  - Avatar upload from data URL.
- `daily_checkin(request)`
  - Daily points/streak reward.
- `checkin_history(request)`
  - Check-in timeline and aggregate data.
- `update_profile(request)`
  - First/last name update.
- `change_password(request)`
  - Password change for authenticated user.
- `dashboard(request)`
  - Summary dashboard payload.
- `activity(request)`
  - Recent user activity stream.
- `recommendations(request)`
  - Learning recommendations based on completion state.

Code snippet (OTP registration create):

```python
OTPCode.objects.create(
    email=email,
    code=code,
    purpose=OTPCode.PURPOSE_REGISTRATION,
    pending_data={'username': username, 'password': password, 'full_name': full_name},
    expires_at=timezone.now() + timezone.timedelta(minutes=10),
)
```

## 4) CSRF Utility Endpoint

- `csrf_view(request)`
  - Decorated with `@ensure_csrf_cookie`.
  - Returns JSON with `csrf_token` for frontend fallback.

## 5) ScanViewSet (`/api/scans/*`)

- `get_queryset()`
  - User-scoped scan history.
- `list(request, *args, **kwargs)`
  - Paginated scan listing.
- `stats(request)`
  - Public aggregate stats (today totals and detection rate).
- `perform_scan(request)`
  - Tier-limit enforcement, analysis, persistence, usage counters.

## 6) ThreatReportViewSet (`/api/threat-reports/*`)

- `get_permissions()`
  - update/delete reserved for admin.
- `get_queryset()`
  - Admin sees all; regular user sees own reports.
- `perform_create(serializer)`
  - Persists `ThreatReport` and mirrors into `ThreatIntelligence` with normalized rich fields.

Code snippet (report mirroring):

```python
ThreatIntelligence.objects.create(
    threat_id=threat_id,
    title=report.title,
    type=report.threat_type,
    severity=severity,
    detected_date=detected_date,
    affected_users=affected_users,
    description=report.description,
    origin=origin,
    status='active',
    community_reports=1,
    detailed_analysis=detailed_analysis,
)
```

## 7) LearningLabViewSet (`/api/learning-lab/*`)

- `get_serializer_context()`
- `highlights(request)`
- `complete(request, pk=None)`
- `leaderboard(request)`
- `stats(request)`

Responsibilities:
- Challenge catalog retrieval.
- Completion write path and scoring.
- Leaderboard and aggregate metrics.

## 8) User Resource CRUD ViewSets

### BookmarkViewSet (`/api/bookmarks/*`)
- `get_queryset()`
- `perform_create(serializer)`
- `create(request, *args, **kwargs)` with duplicate safety.

### CustomAlertViewSet (`/api/alerts/*`)
- `get_queryset()`
- `perform_create(serializer)`

### MitigatedThreatViewSet (`/api/mitigated-threats/*`)
- `get_queryset()`
- `perform_create(serializer)`
- `create(request, *args, **kwargs)` with duplicate safety.

## 9) AdminViewSet (`/api/admin/*`)

Overview and governance:

- `overview(request)`
- `users(request)`
- `scan_history(request)`
- `delete_scan(request, pk=None)`
- `update_user_status(request, pk=None)`
- `delete_user(request, pk=None)`
- `update_report_status(request, pk=None)`
- `logs(request)`

Learning content moderation:

- `modules(request)`
- `create_module(request)`
- `update_module(request, pk=None)`
- `delete_module(request, pk=None)`
- `learning_stats(request)`

Community/engagement moderation:

- `comments(request)`
- `delete_comment(request)`
- `all_bookmarks(request)`
- `delete_bookmark(request, pk=None)`
- `all_alerts(request)`
- `delete_alert(request, pk=None)`
- `toggle_alert(request, pk=None)`

Homepage + threat catalog curation:

- `trust_signals(request)`
- `create_trust_signal(request)`
- `update_trust_signal(request, pk=None)`
- `delete_trust_signal(request, pk=None)`
- `threat_db_list(request)`
- `create_threat_db(request)`
- `update_threat_db(request, pk=None)`
- `delete_threat_db(request, pk=None)`

## 10) Content API Functions (`backend/content/views.py`)

Helper:
- `_fmt(n)` number formatting.

Read-only viewsets:
- `LiveStatViewSet` with `platform_stats(request)` action.
- `TrustSignalViewSet`
- `FeatureViewSet`
- `ThreatReportSummaryViewSet`
- `TestimonialViewSet`
- `LearningModuleHighlightViewSet`
- `ThreatIntelligenceViewSet`
  - `get_queryset()` filter/search logic.
  - `stats(request)` monthly trend aggregations.
  - `add_insight(request, threat_id=None)` user comments.
- `PricingPlanViewSet`
- `PricingFeatureViewSet`

## 11) Model-Level Methods (`backend/api/models.py`)

- `UserProfile.get_renewal_date_str()`
- `UserProfile.apply_tier_limits()`
- signal handlers:
  - `create_user_profile(...)`
  - `save_user_profile(...)`

These methods are critical to account lifecycle and limits consistency.
