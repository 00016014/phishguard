# API Endpoint Map

Base API prefix: `/api/`
Content API prefix: `/api/content/`

Routers:
- `backend/api/urls.py`
- `backend/content/urls.py`

## 1) Authentication and User Endpoints

Resource: `/api/users/`

- `POST /api/users/login/` (public)
- `POST /api/users/logout/` (session)
- `POST /api/users/register/` (public)
- `POST /api/users/verify_registration_otp/` (public)
- `POST /api/users/request_password_reset/` (public)
- `POST /api/users/verify_reset_otp/` (public)
- `POST /api/users/reset_password/` (public legacy)
- `POST /api/users/ai_fill_threat_report/` (auth)
- `POST /api/users/ai_fill_community_report/` (auth)
- `POST /api/users/ai_scan_commentary/` (auth)
- `GET /api/users/me/` (auth)
- `PATCH /api/users/upload_avatar/` (auth)
- `POST /api/users/daily_checkin/` (auth)
- `GET /api/users/checkin_history/` (auth)
- `PATCH /api/users/update_profile/` (auth)
- `POST /api/users/change_password/` (auth)
- `GET /api/users/dashboard/` (auth)
- `GET /api/users/activity/` (auth)
- `GET /api/users/recommendations/` (auth)

CSRF utility:
- `GET /api/csrf/` (public, sets cookie and returns token)

## 2) Scanner Endpoints

Resource: `/api/scans/`

- `GET /api/scans/` (auth)
- `GET /api/scans/stats/` (public)
- `POST /api/scans/perform_scan/` (auth)

## 3) Threat Report Endpoints

Resource: `/api/threat-reports/`

- `GET /api/threat-reports/` (auth, user scoped unless admin)
- `POST /api/threat-reports/` (auth)
- admin-only update/delete operations via same resource actions.

## 4) Learning Lab Endpoints

Resource: `/api/learning-lab/`

- `GET /api/learning-lab/` (auth)
- `GET /api/learning-lab/highlights/` (public)
- `POST /api/learning-lab/{id}/complete/` (auth)
- `GET /api/learning-lab/leaderboard/` (auth)
- `GET /api/learning-lab/stats/` (auth)

## 5) User Collections

### Bookmarks (`/api/bookmarks/`)
- `GET`, `POST`, `DELETE /{id}/` (auth)

### Alerts (`/api/alerts/`)
- `GET`, `POST`, `PATCH /{id}/`, `DELETE /{id}/` (auth)

### Mitigated threats (`/api/mitigated-threats/`)
- `GET`, `POST`, `DELETE /{id}/` (auth)

## 6) Admin Endpoints

Resource: `/api/admin/`

- `GET /api/admin/overview/`
- `GET /api/admin/users/`
- `GET /api/admin/scan_history/`
- `POST /api/admin/{id}/delete_scan/`
- `POST /api/admin/{id}/update_user_status/`
- `POST /api/admin/{id}/delete_user/`
- `POST /api/admin/{id}/update_report_status/`
- `GET /api/admin/logs/?level=INFO|WARN|ERROR`
- `GET /api/admin/modules/`
- `POST /api/admin/create_module/`
- `POST /api/admin/{id}/update_module/`
- `POST /api/admin/{id}/delete_module/`
- `GET /api/admin/comments/`
- `POST /api/admin/delete_comment/`
- `GET /api/admin/all_bookmarks/`
- `POST /api/admin/{id}/delete_bookmark/`
- `GET /api/admin/all_alerts/`
- `POST /api/admin/{id}/delete_alert/`
- `POST /api/admin/{id}/toggle_alert/`
- `GET /api/admin/learning_stats/`
- `GET /api/admin/trust_signals/`
- `POST /api/admin/create_trust_signal/`
- `POST /api/admin/{id}/update_trust_signal/`
- `POST /api/admin/{id}/delete_trust_signal/`
- `GET /api/admin/threat_db_list/?search=...`
- `POST /api/admin/create_threat_db/`
- `POST /api/admin/{id}/update_threat_db/`
- `POST /api/admin/{id}/delete_threat_db/`

All `/api/admin/*` endpoints require admin role.

## 7) Content Endpoints

### Resource families under `/api/content/`

- `live-stats/`
  - `GET /api/content/live-stats/`
  - `GET /api/content/live-stats/platform-stats/`
- `trust-signals/`
- `features/`
- `threat-summaries/`
- `testimonials/`
- `module-highlights/`
- `threat-intelligence/`
  - supports query filters: `search`, `type`, `severity`, `status`, `origin`
  - `GET /api/content/threat-intelligence/stats/`
  - `POST /api/content/threat-intelligence/{threat_id}/add_insight/` (auth)
- `pricing-plans/`
- `pricing-features/`

## 8) Frontend Consumption Map

- Auth flows: `AuthService` + `AuthContext`
- Scan flows: `ScannerService`
- Threat reporting: `ThreatService`
- Learning: `LearningLabService`
- Dashboard widgets: `DashboardService`
- Marketing/content pages: `ContentService`
- Admin panel: `AdminService`

## 9) Integration Contract Notes

- Unsafe methods (`POST`, `PATCH`, `DELETE`) require valid session and CSRF token.
- Frontend should use `apiFetch` for authenticated mutation requests.
- Content read endpoints mostly use `fetch` directly because they are public.
