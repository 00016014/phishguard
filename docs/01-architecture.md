# Architecture Overview

## 1) Product Modules

PhishGuard is split into two deployable systems:

- `frontend` (Next.js 15, TypeScript, Tailwind)
  - User-facing web application.
  - Handles UX flows, form validation, and API orchestration.
- `backend` (Django 6 + Django REST Framework)
  - Session auth, CSRF enforcement, scan analysis, persistence, admin workflows, and AI enrichments.

## 2) Runtime Topology

- Browser -> Frontend app (`phishguard.uz`)
- Frontend -> Backend API (`api.phishguard.uz/api/*`) with cookies (`credentials: include`)
- Backend -> SQLite database (`backend/db.sqlite3`)
- Backend -> optional third-party providers:
  - OpenAI for AI narrative/report enrichment.
  - VirusTotal for URL enrichment.
  - SMTP server for auth/reset emails.

## 3) Key Technical Decisions

- Monorepo with isolated dependency trees (`frontend/package.json`, `backend/requirements.txt`).
- DRF `ModelViewSet` and `ReadOnlyModelViewSet` for fast CRUD + custom action routes.
- Session-based auth (not JWT):
  - CSRF is mandatory for unsafe methods.
  - Frontend uses a shared `apiFetch` wrapper for CSRF/cookies.
- Structured threat intelligence content in `content` app to power homepage, pricing, and threat DB.
- Operational moderation workflow:
  - `ThreatReport` is submission/queue data.
  - `ThreatIntelligence` is curated publishable intelligence.

## 4) Ownership View (Business Layer)

Core business capabilities:

1. Detect phishing and suspicious artifacts (URL/email/file/QR).
2. Educate users via learning modules, quizzes, simulations, and assessments.
3. Collect and moderate community threat reporting.
4. Provide premium usage tiers and admin governance.
5. Build reusable threat intelligence assets and trend statistics.

Primary KPI-aligned entities:

- Detection throughput: `ScanHistory`
- Community activity: `ThreatReport`, `ThreatIntelligence.community_insights`
- User engagement: `LearningProgress`, `DailyCheckIn`, profile points/streak
- Monetization controls: `UserProfile.tier` and usage limits

## 5) Source Landmarks

- Backend settings/security: `backend/phishguard_backend/settings.py`
- Backend root routes: `backend/phishguard_backend/urls.py`
- API router: `backend/api/urls.py`
- API implementation: `backend/api/views.py`
- Content router: `backend/content/urls.py`
- Content implementation: `backend/content/views.py`
- Frontend API wrapper: `frontend/src/lib/apiFetch.ts`
- Frontend domain services: `frontend/src/services/*.ts`
