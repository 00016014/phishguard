import { apiFetch, API_BASE_URL } from '@/lib/apiFetch';

const API_CONTENT_BASE_URL = `${API_BASE_URL}/content`;

export interface PlatformStats {
  threatsDetected: string;
  usersProtected: string;
  scansCompleted: string;
  userSatisfactionRate: string;
  activeCommunityMembers: string;
  avgUserRating: string;
  threatDetectionAccuracy: string;
}

export const ContentService = {
  async getLiveStats() {
    const response = await fetch(`${API_CONTENT_BASE_URL}/live-stats/`);
    if (!response.ok) return {};
    const data = await response.json();
    return data.reduce((acc: any, stat: any) => {
      acc[stat.title] = stat.value;
      return acc;
    }, {});
  },

  async getPlatformStats(): Promise<PlatformStats | null> {
    const response = await fetch(`${API_CONTENT_BASE_URL}/live-stats/platform-stats/`);
    if (!response.ok) return null;
    return await response.json();
  },

  async getTrustSignals() {
    const response = await fetch(`${API_CONTENT_BASE_URL}/trust-signals/`);
    return response.ok ? await response.json() : [];
  },

  async getFeatures() {
    const response = await fetch(`${API_CONTENT_BASE_URL}/features/`);
    return response.ok ? await response.json() : [];
  },

  async getThreatSummaries() {
    const response = await fetch(`${API_CONTENT_BASE_URL}/threat-summaries/`);
    return response.ok ? await response.json() : [];
  },

  async getTestimonials() {
    const response = await fetch(`${API_CONTENT_BASE_URL}/testimonials/`);
    return response.ok ? await response.json() : [];
  },

  async getModuleHighlights() {
    const response = await fetch(`${API_BASE_URL}/learning-lab/highlights/`);
    return response.ok ? await response.json() : [];
  },

  async getThreatIntelligence(params: any = {}) {
    const query = new URLSearchParams(params).toString();
    const response = await fetch(`${API_CONTENT_BASE_URL}/threat-intelligence/?${query}`);
    return response.ok ? await response.json() : [];
  },

  async getPricingPlans() {
    const response = await fetch(`${API_CONTENT_BASE_URL}/pricing-plans/`);
    return response.ok ? await response.json() : [];
  },

  async getPricingFeatures() {
    const response = await fetch(`${API_CONTENT_BASE_URL}/pricing-features/`);
    return response.ok ? await response.json() : [];
  },

  async getThreatStats() {
    const response = await fetch(`${API_CONTENT_BASE_URL}/threat-intelligence/stats/`);
    if (!response.ok) return null;
    return await response.json();
  },

  async addCommunityInsight(threatId: string, insight: string) {
    const response = await apiFetch(
      `${API_BASE_URL}/threat-intelligence/${threatId}/add_insight/`,
      { method: 'POST', body: JSON.stringify({ insight }) }
    );
    if (!response.ok) return null;
    return await response.json();
  },
};
