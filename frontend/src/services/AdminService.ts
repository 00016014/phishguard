import { apiFetch, API_BASE_URL } from '@/lib/apiFetch';

const BASE = API_BASE_URL;

async function adminGet(url: string) {
  const res = await apiFetch(url);
  return res.json();
}

export const AdminService = {
  // ── Overview / Users / Reports / Scans / Logs ─────────────────────────
  async getOverview() { return adminGet(`${BASE}/admin/overview/`); },
  async getUsers() { return (await adminGet(`${BASE}/admin/users/`)) ?? []; },
  async getReports() { return (await adminGet(`${BASE}/threat-reports/`)) ?? []; },
  async getScanHistory() { return (await adminGet(`${BASE}/admin/scan_history/`)) ?? []; },
  async deleteScan(scanId: number) {
    const res = await apiFetch(`${BASE}/admin/${scanId}/delete_scan/`, { method: 'POST' });
    return res.json();
  },
  async getLogs(level?: string) {
    const url = level ? `${BASE}/admin/logs/?level=${level}` : `${BASE}/admin/logs/`;
    return adminGet(url);
  },

  async updateUserStatus(userId: number, status: string, role: string) {
    const res = await apiFetch(`${BASE}/admin/${userId}/update_user_status/`, {
      method: 'POST', body: JSON.stringify({ status, role }),
    });
    return res.json();
  },
  async changeTier(userId: number, tier: string) {
    const res = await apiFetch(`${BASE}/admin/${userId}/update_user_status/`, {
      method: 'POST', body: JSON.stringify({ tier }),
    });
    return res.json();
  },
  async updateReportStatus(reportId: number, reportStatus: string) {
    const res = await apiFetch(`${BASE}/admin/${reportId}/update_report_status/`, {
      method: 'POST', body: JSON.stringify({ status: reportStatus }),
    });
    return res.json();
  },
  async deleteUser(userId: number) {
    const res = await apiFetch(`${BASE}/admin/${userId}/delete_user/`, { method: 'POST' });
    return res.json();
  },

  // ── Learning Modules ───────────────────────────────────────────────────
  async getModules() { return (await adminGet(`${BASE}/admin/modules/`)) ?? []; },
  async createModule(data: Record<string, any>) {
    const res = await apiFetch(`${BASE}/admin/create_module/`, {
      method: 'POST', body: JSON.stringify(data),
    });
    return res.json();
  },
  async updateModule(id: number, data: Record<string, any>) {
    const res = await apiFetch(`${BASE}/admin/${id}/update_module/`, {
      method: 'POST', body: JSON.stringify(data),
    });
    return res.json();
  },
  async deleteModule(id: number) {
    const res = await apiFetch(`${BASE}/admin/${id}/delete_module/`, { method: 'POST' });
    return res.json();
  },
  async getLearningStats() { return adminGet(`${BASE}/admin/learning_stats/`); },

  // ── Community Comments ─────────────────────────────────────────────────
  async getComments() { return (await adminGet(`${BASE}/admin/comments/`)) ?? []; },
  async deleteComment(threatId: string, commentIndex: number) {
    const res = await apiFetch(`${BASE}/admin/delete_comment/`, {
      method: 'POST', body: JSON.stringify({ threat_id: threatId, comment_index: commentIndex }),
    });
    return res.json();
  },

  // ── Bookmarks ──────────────────────────────────────────────────────────
  async getAllBookmarks() { return (await adminGet(`${BASE}/admin/all_bookmarks/`)) ?? []; },
  async deleteBookmark(id: number) {
    const res = await apiFetch(`${BASE}/admin/${id}/delete_bookmark/`, { method: 'POST' });
    return res.json();
  },

  // ── Custom Alerts ──────────────────────────────────────────────────────
  async getAllAlerts() { return (await adminGet(`${BASE}/admin/all_alerts/`)) ?? []; },
  async deleteAlert(id: number) {
    const res = await apiFetch(`${BASE}/admin/${id}/delete_alert/`, { method: 'POST' });
    return res.json();
  },
  async toggleAlert(id: number) {
    const res = await apiFetch(`${BASE}/admin/${id}/toggle_alert/`, { method: 'POST' });
    return res.json();
  },

  // ── Industry Recognition & Partnerships ──────────────────────────────
  async getTrustSignals() { return (await adminGet(`${BASE}/admin/trust_signals/`)) ?? []; },
  async createTrustSignal(data: object) {
    const res = await apiFetch(`${BASE}/admin/create_trust_signal/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return res.json();
  },
  async updateTrustSignal(id: number, data: object) {
    const res = await apiFetch(`${BASE}/admin/${id}/update_trust_signal/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return res.json();
  },
  async deleteTrustSignal(id: number) {
    const res = await apiFetch(`${BASE}/admin/${id}/delete_trust_signal/`, { method: 'POST' });
    return res.json();
  },

  // ── Threat Intelligence Database ──────────────────────────────
  async getThreatDB(search?: string) {
    const q = search ? `?search=${encodeURIComponent(search)}` : '';
    return (await adminGet(`${BASE}/admin/threat_db_list/${q}`)) ?? [];
  },
  async createThreatDB(data: object) {
    const res = await apiFetch(`${BASE}/admin/create_threat_db/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return res.json();
  },
  async updateThreatDB(id: number, data: object) {
    const res = await apiFetch(`${BASE}/admin/${id}/update_threat_db/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return res.json();
  },
  async deleteThreatDB(id: number) {
    const res = await apiFetch(`${BASE}/admin/${id}/delete_threat_db/`, { method: 'POST' });
    return res.json();
  },
};


