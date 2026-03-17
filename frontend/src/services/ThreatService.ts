import { apiFetch, API_BASE_URL } from '@/lib/apiFetch';

const _API_BASE_URL = API_BASE_URL;

export const ThreatService = {
  async submitReport(report: any) {
    // Pack rich fields into evidence as JSON so the backend can extract them
    const evidencePayload = JSON.stringify({
      text_evidence: report.evidence || '',
      image_url: report.imageUrl || '',
      origin: report.origin || 'Community Report',
      affected_users: report.affectedUsers ?? report.affected_users ?? 0,
      detected_date: report.detectedDate || report.detected_date || '',
      detailed_analysis: report.detailedAnalysis || report.detailed_analysis || '',
      prevention_tips: report.preventionTips || report.prevention_tips || [],
      real_world_examples: report.realWorldExamples || report.real_world_examples || [],
    });

    const response = await apiFetch(`${_API_BASE_URL}/threat-reports/`, {
      method: 'POST',
      body: JSON.stringify({
        title: report.title,
        threat_type: report.type,
        description: report.description,
        risk_level: report.severity,
        evidence: evidencePayload,
      }),
    });
    const data = await response.json();
    if (!response.ok) {
      const msg = data?.detail || data?.error || data?.non_field_errors?.[0]
        || Object.values(data || {}).flat().join(' ')
        || `Error ${response.status}`;
      throw new Error(msg);
    }
    return data;
  },

  async aiSuggestReport(scanType: string, content: string, threatLevel: string, details: any[]) {
    const response = await apiFetch(`${_API_BASE_URL}/users/ai_fill_threat_report/`, {
      method: 'POST',
      body: JSON.stringify({ scan_type: scanType, content, threat_level: threatLevel, details }),
    });
    if (!response.ok) throw new Error('AI suggestion failed');
    return response.json() as Promise<{
      title: string;
      type: string;
      severity: string;
      origin: string;
      affected_users: number;
      description: string;
      detailed_analysis: string;
      prevention_tips: string[];
      real_world_examples: string[];
      evidence: string;
    }>;
  },

  async aiSuggestCommunityReport(evidence: string, aiPrompt?: string): Promise<{
    title: string;
    type: string;
    severity: string;
    origin: string;
    affected_users: number;
    description: string;
    detailed_analysis: string;
    prevention_tips: string[];
    real_world_examples: string[];
  }> {
    const response = await apiFetch(`${_API_BASE_URL}/users/ai_fill_community_report/`, {
      method: 'POST',
      body: JSON.stringify({ evidence, ai_prompt: aiPrompt || '' }),
    });
    if (!response.ok) throw new Error('AI suggestion failed');
    return response.json();
  },
};
