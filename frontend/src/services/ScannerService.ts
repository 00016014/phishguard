import { apiFetch, cachedGet, API_BASE_URL } from '@/lib/apiFetch';

export interface ScanResult {
  id?: number;
  threatLevel: 'safe' | 'low' | 'medium' | 'high' | 'critical';
  score: number;
  details: Array<{
    category: string;
    severity: 'safe' | 'warning' | 'danger';
    finding: string;
    explanation: string;
    // VirusTotal extended data (present when category === 'VirusTotal Analysis')
    vt_stats?: { malicious: number; suspicious: number; harmless: number; undetected: number; total: number };
    vt_vendors?: string[];
    vt_categories?: string[];
    vt_reputation?: number;
    vt_votes?: { harmless?: number; malicious?: number };
    vt_tags?: string[];
    vt_final_url?: string;
  }>;
  actions: Array<{
    title: string;
    description: string;
    icon: string;
    link: string;
    type: 'primary' | 'secondary';
  }>;
}

const _API_BASE_URL = API_BASE_URL;

export const ScannerService = {
  async performScan(type: 'email' | 'url' | 'file' | 'qr', content: string): Promise<ScanResult> {
    const response = await apiFetch(`${_API_BASE_URL}/scans/perform_scan/`, {
      method: 'POST',
      body: JSON.stringify({ type, content }),
    });

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      throw new Error(errData.error || 'Scan failed');
    }

    const data = await response.json();
    return {
      id: data.id,
      threatLevel: data.threat_level,
      score: data.score,
      details: data.details,
      actions: this.getActions(data.threat_level),
    };
  },

  getActions(threatLevel: string): ScanResult['actions'] {
    const actions: ScanResult['actions'] = [
      {
        title: 'Learn About Phishing',
        description: 'Understand how to identify threats',
        icon: 'AcademicCapIcon',
        link: '/interactive-learning-lab',
        type: 'primary',
      },
    ];
    if (threatLevel !== 'safe') {
      actions.push({
        title: 'Report This Threat',
        description: 'Help protect the community',
        icon: 'FlagIcon',
        link: '/threat-intelligence-database',
        type: 'primary',
      });
    }
    return actions;
  },

  async getRecentScans(page = 1, pageSize = 20) {
    const data = await cachedGet(`${API_BASE_URL}/scans/?page=${page}&page_size=${pageSize}`, 15_000);
    if (!data) return { count: 0, results: [] };
    if (Array.isArray(data)) return { count: data.length, results: data };
    return data;
  },

  async getScanStats() {
    return cachedGet(`${API_BASE_URL}/scans/stats/`, 60_000);
  },

  async getAiCommentary(
    scanType: string,
    content: string,
    threatLevel: string,
    score: number,
    details: any[],
  ): Promise<{
    verdict: string;
    headline: string;
    summary: string;
    recommendations: string[];
    confidence: string;
  }> {
    const response = await apiFetch(`${API_BASE_URL}/users/ai_scan_commentary/`, {
      method: 'POST',
      body: JSON.stringify({ scan_type: scanType, content, threat_level: threatLevel, score, details }),
    });
    if (!response.ok) throw new Error('AI commentary failed');
    return response.json();
  },
};
