import { apiFetch, cachedGet, API_BASE_URL } from '@/lib/apiFetch';

const _API_BASE_URL = API_BASE_URL;

export const DashboardService = {
  async getDashboardData() {
    return cachedGet(`${_API_BASE_URL}/users/dashboard/`);
  },

  async getActivity() {
    const data = await cachedGet(`${_API_BASE_URL}/users/activity/`);
    return data ?? [];
  },

  async getRecommendations() {
    const data = await cachedGet(`${_API_BASE_URL}/users/recommendations/`);
    return data ?? [];
  },

  async getBookmarks() {
    const data = await cachedGet(`${_API_BASE_URL}/bookmarks/`);
    if (!data) return [];
    return Array.isArray(data) ? data : (data.results || []);
  },

  async addBookmark(bookmark: { threat_id: string; threat_title: string; threat_type?: string; threat_severity?: string }) {
    const response = await apiFetch(`${_API_BASE_URL}/bookmarks/`, {
      method: 'POST',
      body: JSON.stringify(bookmark),
    });
    if (!response.ok) return null;
    return await response.json();
  },

  async removeBookmark(bookmarkId: number) {
    await apiFetch(`${_API_BASE_URL}/bookmarks/${bookmarkId}/`, { method: 'DELETE' });
  },

  async getAlerts() {
    const data = await cachedGet(`${_API_BASE_URL}/alerts/`);
    if (!data) return [];
    return Array.isArray(data) ? data : (data.results || []);
  },

  async createAlert(alert: { title: string; keyword: string; threat_type?: string; min_severity?: string }) {
    const response = await apiFetch(`${_API_BASE_URL}/alerts/`, {
      method: 'POST',
      body: JSON.stringify(alert),
    });
    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.detail || 'Failed to create alert');
    }
    return await response.json();
  },

  async updateAlert(alertId: number, patch: Partial<{ title: string; active: boolean }>) {
    const response = await apiFetch(`${_API_BASE_URL}/alerts/${alertId}/`, {
      method: 'PATCH',
      body: JSON.stringify(patch),
    });
    if (!response.ok) return null;
    return await response.json();
  },

  async deleteAlert(alertId: number) {
    await apiFetch(`${_API_BASE_URL}/alerts/${alertId}/`, { method: 'DELETE' });
  },

  async getMitigatedThreats() {
    const data = await cachedGet(`${_API_BASE_URL}/mitigated-threats/`);
    if (!data) return [];
    return Array.isArray(data) ? data : (data.results || []);
  },

  async addMitigatedThreat(payload: { threat_id: string; threat_title: string; threat_type?: string; threat_severity?: string; notes?: string }) {
    const response = await apiFetch(`${_API_BASE_URL}/mitigated-threats/`, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    if (!response.ok) return null;
    return await response.json();
  },

  async removeMitigatedThreat(id: number) {
    await apiFetch(`${_API_BASE_URL}/mitigated-threats/${id}/`, { method: 'DELETE' });
  },
};
