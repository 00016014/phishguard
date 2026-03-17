# Frontend Function Reference

Primary integration layer:

- `frontend/src/lib/apiFetch.ts`
- `frontend/src/services/*.ts`
- `frontend/src/contexts/*.tsx`

## 1) Shared Network Layer (`frontend/src/lib/apiFetch.ts`)

### Exported values and functions

- `API_BASE_URL`
  - Uses `NEXT_PUBLIC_API_BASE_URL` with localhost fallback.
- `invalidateCache(urlFragment?)`
  - Clears all or partial GET cache entries.
- `ensureCsrfToken()`
  - Returns valid CSRF token from memory, cookie, or `/csrf/` endpoint JSON.
- `apiFetch(url, options)`
  - Adds credentials + JSON content type + safe CSRF header for unsafe methods.
- `cachedGet(url, ttlMs?)`
  - TTL cache wrapper for GET requests.

Code snippet (CSRF-safe header injection):

```ts
if (needsCsrf) {
  const token = await ensureCsrfToken();
  if (isValidCsrfToken(token)) {
    headers['X-CSRFToken'] = token;
  }
}
```

## 2) AuthService (`frontend/src/services/AuthService.ts`)

- `getMe()`
- `login(username, password)`
- `register(username, email, password, fullName)`
- `verifyRegistrationOtp(email, otp)`
- `requestPasswordReset(email)`
- `verifyResetOtp(email, otp, newPassword)`
- `resetPasswordConfirm(uid, token, newPassword)`
- `logout()`
- `dailyCheckIn()`
- `ensureCsrf` (alias of `ensureCsrfToken`)

## 3) ScannerService (`frontend/src/services/ScannerService.ts`)

- `performScan(type, content)`
- `getActions(threatLevel)`
- `getRecentScans(page?, pageSize?)`
- `getScanStats()`
- `getAiCommentary(scanType, content, threatLevel, score, details)`

Type contracts:
- `ScanResult`
  - includes threat level, numeric score, enriched details, and recommended actions.

## 4) ThreatService (`frontend/src/services/ThreatService.ts`)

- `submitReport(report)`
  - serializes rich evidence JSON and posts to threat reports endpoint.
- `aiSuggestReport(scanType, content, threatLevel, details)`
- `aiSuggestCommunityReport(evidence, aiPrompt?)`

Code snippet (rich evidence packing):

```ts
const evidencePayload = JSON.stringify({
  text_evidence: report.evidence || '',
  image_url: report.imageUrl || '',
  origin: report.origin || 'Community Report',
  affected_users: report.affectedUsers ?? 0,
  detailed_analysis: report.detailedAnalysis || '',
  prevention_tips: report.preventionTips || [],
  real_world_examples: report.realWorldExamples || [],
});
```

## 5) LearningLabService (`frontend/src/services/LearningLabService.ts`)

- `getChallenges()`
- `getStats()`
- `getLeaderboard()`
- `completeChallenge(id, score)`

## 6) DashboardService (`frontend/src/services/DashboardService.ts`)

- `getDashboardData()`
- `getActivity()`
- `getRecommendations()`
- `getBookmarks()`
- `addBookmark(bookmark)`
- `removeBookmark(bookmarkId)`
- `getAlerts()`
- `createAlert(alert)`
- `updateAlert(alertId, patch)`
- `deleteAlert(alertId)`
- `getMitigatedThreats()`
- `addMitigatedThreat(payload)`
- `removeMitigatedThreat(id)`

## 7) ContentService (`frontend/src/services/ContentService.ts`)

- `getLiveStats()`
- `getPlatformStats()`
- `getTrustSignals()`
- `getFeatures()`
- `getThreatSummaries()`
- `getTestimonials()`
- `getModuleHighlights()`
- `getThreatIntelligence(params?)`
- `getPricingPlans()`
- `getPricingFeatures()`
- `getThreatStats()`
- `addCommunityInsight(threatId, insight)`

## 8) AdminService (`frontend/src/services/AdminService.ts`)

Helper:
- `adminGet(url)`

Overview and moderation methods:
- `getOverview()`
- `getUsers()`
- `getReports()`
- `getScanHistory()`
- `deleteScan(scanId)`
- `getLogs(level?)`
- `updateUserStatus(userId, status, role)`
- `changeTier(userId, tier)`
- `updateReportStatus(reportId, reportStatus)`
- `deleteUser(userId)`

Learning/content admin methods:
- `getModules()`
- `createModule(data)`
- `updateModule(id, data)`
- `deleteModule(id)`
- `getLearningStats()`

Community/admin operations:
- `getComments()`
- `deleteComment(threatId, commentIndex)`
- `getAllBookmarks()`
- `deleteBookmark(id)`
- `getAllAlerts()`
- `deleteAlert(id)`
- `toggleAlert(id)`

Trust signal and Threat DB curation:
- `getTrustSignals()`
- `createTrustSignal(data)`
- `updateTrustSignal(id, data)`
- `deleteTrustSignal(id)`
- `getThreatDB(search?)`
- `createThreatDB(data)`
- `updateThreatDB(id, data)`
- `deleteThreatDB(id)`

## 9) Context API Functions

### AuthContext (`frontend/src/contexts/AuthContext.tsx`)

- `useAuth()` hook
- provider state orchestration:
  - `signIn(username, password)`
  - `signUp(email, password, metadata)`
  - `verifySignUpOtp(email, otp)`
  - `resetPassword(email)`
  - `signOut()`
  - `refreshUser()`

### SubscriptionContext (`frontend/src/contexts/SubscriptionContext.tsx`)

- `useSubscription()` hook
- utility methods:
  - `isAtLimit(feature)`
  - `isNearLimit(feature)`
  - `getTierBadgeColor()`
  - `getTierLabel()`

State contract:
- `subscription` (tier + usage)
- `tierLimits` (capabilities matrix)

## 10) Recommended Developer Pattern

When adding new API features:

1. Add backend action or endpoint.
2. Add method in one service file only.
3. Reuse `apiFetch` (do not use raw fetch for authenticated mutation routes).
4. Consume service from page/component, not direct endpoint calls.
5. Update docs in this folder.
