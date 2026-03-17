# User Flows

This document describes production user journeys from both developer and product-owner perspectives.

## 1) Authentication & Session Flow

Actors: guest user, registered user.

### Registration (OTP)

1. User submits username/email/password/full name.
2. Frontend calls `AuthService.register()`.
3. Backend creates `OTPCode(purpose=registration)` and sends email.
4. User enters OTP.
5. Frontend calls `AuthService.verifyRegistrationOtp()`.
6. Backend validates OTP, creates account and profile, starts session.

### Login

1. Frontend seeds CSRF (`AuthService.ensureCsrf()`).
2. User submits credentials.
3. Frontend calls `AuthService.login()`.
4. Backend authenticates and creates server-side session.
5. Frontend loads `getMe()` and hydrates `AuthContext`.

### Password Reset (OTP)

1. User submits email.
2. Frontend calls `requestPasswordReset()`.
3. Backend sends OTP for `password_reset` purpose.
4. User submits OTP + new password.
5. Frontend calls `verifyResetOtp()`.
6. Backend updates credential and invalidates OTP.

## 2) Scan & Detect Flow

Actors: authenticated user.

1. User selects scan type (email/url/file/qr).
2. Frontend calls `ScannerService.performScan(type, content)`.
3. Backend `perform_scan`:
   - runs heuristic scoring (`_analyze*`)
   - optional VirusTotal enrichment
   - maps score to threat level
   - persists `ScanHistory`
4. Frontend renders score, details, recommended actions.
5. Optional AI commentary:
   - frontend calls `getAiCommentary(...)`
   - backend returns narrative + recommendations.

Outcome: better user decision-making and scan telemetry for dashboards.

## 3) Report Threat Flow

Actors: authenticated user, admin moderator.

1. User opens report modal/community form.
2. Frontend may call AI prefill (`aiSuggestReport` or `aiSuggestCommunityReport`).
3. User submits report via `ThreatService.submitReport()`.
4. Backend stores `ThreatReport` as pending.
5. Backend attempts to normalize enriched evidence and may publish to `ThreatIntelligence`.
6. Admin later reviews queue in dashboard and updates status.

## 4) Learning Lab Flow

Actors: authenticated user.

1. User opens learning lab page.
2. Frontend fetches challenges, stats, leaderboard.
3. User completes module (quiz/simulation/assessment).
4. Frontend sends score using `completeChallenge(id, score)`.
5. Backend upserts `LearningProgress` and awards points/streak impact.

Outcome: engagement, security training completion, leaderboard progression.

## 5) Profile & Engagement Flow

Actors: authenticated user.

1. User loads profile page.
2. Frontend fetches profile, activity, and check-in history.
3. User can:
   - update profile name
   - upload avatar
   - change password
   - trigger daily check-in rewards
4. Backend validates CSRF/session and persists updates.

## 6) Personal Dashboard Flow

Actors: authenticated user.

1. Dashboard loads summary metrics, activity, recommendations.
2. User manages bookmarks, custom alerts, mitigated threats.
3. Frontend services perform CRUD against `bookmarks`, `alerts`, `mitigated-threats` endpoints.

## 7) Admin Governance Flow

Actors: admin user.

1. Admin opens dashboard and fetches overview/users/scans/logs/reports.
2. Admin can:
   - suspend/activate users and change roles/tiers
   - moderate reports and comments
   - manage learning modules
   - manage trust signals
   - manage curated threat DB entries
   - delete scan rows (new moderation control)
3. Backend writes `SystemLog` entries for major admin actions.

## 8) Owner-Level Operational Flow

Monthly ownership cycle:

1. Monitor high-risk scan volume and trend lines.
2. Track report-to-publication conversion (ThreatReport -> ThreatIntelligence).
3. Review engagement health (daily check-ins, module completions).
4. Review monetization constraints (tier limits usage by cohort).
5. Drive content updates (pricing plans/features, trust signals, threat summaries).
