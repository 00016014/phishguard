'use client';

import { useState, useEffect } from 'react';
import Icon from '@/components/ui/AppIcon';
import { ThreatService } from '@/services/ThreatService';

interface ScanDetails {
  scanType: string;
  content: string;
  threatLevel: string;
  details: Array<{
    category: string;
    severity: string;
    finding: string;
    explanation: string;
  }>;
}

interface ReportThreatModalProps {
  scanDetails: ScanDetails;
  onClose: () => void;
}

const THREAT_TYPES = [
  'Email Phishing',
  'SMS Phishing',
  'Voice Phishing',
  'Social Media',
  'Malware',
  'Ransomware',
  'QR Code Phishing',
  'Malicious URL',
  'Spear Phishing',
  'Business Email Compromise',
];

const SEVERITIES = ['Low', 'Medium', 'High', 'Critical'];

export default function ReportThreatModal({ scanDetails, onClose }: ReportThreatModalProps) {
  const [formData, setFormData] = useState({
    title: '',
    type: 'Email Phishing',
    description: '',
    detailedAnalysis: '',
    severity: 'Medium',
    evidence: scanDetails.content,
    origin: `Scan Detect Hub (${scanDetails.scanType.toUpperCase()} scan)`,
    affectedUsers: 100 as number | string,
    preventionTips: [] as string[],
    realWorldExamples: [] as string[],
  });
  const [tipInput, setTipInput] = useState('');
  const [exampleInput, setExampleInput] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [aiFilling, setAiFilling] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  // Auto-trigger AI fill on open
  useEffect(() => {
    handleAiFill();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleAiFill = async () => {
    setAiFilling(true);
    setError('');
    try {
      const suggested = await ThreatService.aiSuggestReport(
        scanDetails.scanType,
        scanDetails.content,
        scanDetails.threatLevel,
        scanDetails.details,
      );
      setFormData({
        title: suggested.title ?? '',
        type: THREAT_TYPES.includes(suggested.type) ? suggested.type : (THREAT_TYPES[0] ?? 'Email Phishing'),
        description: suggested.description ?? '',
        detailedAnalysis: suggested.detailed_analysis ?? '',
        severity: SEVERITIES.includes(suggested.severity) ? suggested.severity : 'Medium',
        evidence: suggested.evidence ?? scanDetails.content,
        origin: suggested.origin ?? `Scan Detect Hub (${scanDetails.scanType.toUpperCase()} scan)`,
        affectedUsers: suggested.affected_users ?? 100,
        preventionTips: Array.isArray(suggested.prevention_tips) ? suggested.prevention_tips : [],
        realWorldExamples: Array.isArray(suggested.real_world_examples) ? suggested.real_world_examples : [],
      });
    } catch {
      // Silently fall back — user can edit manually
    } finally {
      setAiFilling(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      await ThreatService.submitReport(formData);
      setSuccess(true);
    } catch (err: any) {
      setError(err?.message || 'Failed to submit report. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const field = (key: keyof typeof formData, val: string) =>
    setFormData((prev) => ({ ...prev, [key]: val }));

  const addTip = () => {
    const v = tipInput.trim();
    if (!v) return;
    setFormData(prev => ({ ...prev, preventionTips: [...prev.preventionTips, v] }));
    setTipInput('');
  };

  const addExample = () => {
    const v = exampleInput.trim();
    if (!v) return;
    setFormData(prev => ({ ...prev, realWorldExamples: [...prev.realWorldExamples, v] }));
    setExampleInput('');
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-card border border-border rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
        {/* Header */}
        <div className="sticky top-0 bg-card border-b border-border px-6 py-4 flex items-center justify-between z-10">
          <h2 className="text-2xl font-headline font-bold text-foreground flex items-center space-x-2">
            <Icon name="FlagIcon" size={24} />
            <span>Report New Threat</span>
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-surface rounded-md transition-colors"
            aria-label="Close"
          >
            <Icon name="XMarkIcon" size={24} />
          </button>
        </div>

        {success ? (
          <div className="p-10 flex flex-col items-center text-center">
            <div className="w-20 h-20 rounded-full bg-green-500/20 flex items-center justify-center mb-6">
              <Icon name="CheckCircleIcon" size={48} className="text-green-500" variant="solid" />
            </div>
            <h3 className="text-xl font-headline font-bold text-foreground mb-2">Report Submitted!</h3>
            <p className="text-muted-foreground mb-6">
              Thank you for helping keep the community safe. Our security team will review your
              report and take appropriate action.
            </p>
            <button
              onClick={onClose}
              className="px-6 py-2.5 bg-brand-accent text-white font-semibold rounded-md hover:bg-brand-accent/90 transition-colors"
            >
              Close
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-5">
            {/* AI fill banner */}
            <div className={`flex items-center space-x-3 p-3 rounded-lg border transition-colors ${
              aiFilling
                ? 'bg-brand-primary/10 border-brand-primary/30'
                : 'bg-surface border-border'
            }`}>
              {aiFilling ? (
                <>
                  <svg className="animate-spin h-5 w-5 text-brand-primary flex-shrink-0" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  <span className="text-sm text-brand-primary font-medium">AI is analysing scan data and filling the form…</span>
                </>
              ) : (
                <>
                  <Icon name="SparklesIcon" size={20} className="text-brand-primary flex-shrink-0" />
                  <span className="text-sm text-muted-foreground flex-1">Form auto-filled by AI based on scan results.</span>
                  <button
                    type="button"
                    onClick={handleAiFill}
                    disabled={aiFilling}
                    className="text-xs text-brand-primary hover:text-brand-primary/80 font-medium transition-colors whitespace-nowrap"
                  >
                    Re-fill
                  </button>
                </>
              )}
            </div>

            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Threat Title *</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => field('title', e.target.value)}
                placeholder="Brief description of the threat"
                required
                disabled={aiFilling}
                className="w-full px-4 py-3 bg-background border border-input rounded-md text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-60"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Type */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Threat Type *</label>
                <select
                  value={formData.type}
                  onChange={(e) => field('type', e.target.value)}
                  required
                  disabled={aiFilling}
                  className="w-full px-4 py-3 bg-background border border-input rounded-md text-foreground focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-60"
                >
                  {THREAT_TYPES.map((t) => <option key={t}>{t}</option>)}
                </select>
              </div>

              {/* Severity */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Severity Level *</label>
                <select
                  value={formData.severity}
                  onChange={(e) => field('severity', e.target.value)}
                  required
                  disabled={aiFilling}
                  className="w-full px-4 py-3 bg-background border border-input rounded-md text-foreground focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-60"
                >
                  {SEVERITIES.map((s) => <option key={s}>{s}</option>)}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Origin</label>
                <input
                  type="text"
                  value={formData.origin}
                  onChange={(e) => field('origin', e.target.value)}
                  disabled={aiFilling}
                  className="w-full px-4 py-3 bg-background border border-input rounded-md text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-60"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Affected Users (Estimated)</label>
                <input
                  type="number"
                  min={0}
                  value={formData.affectedUsers}
                  onChange={(e) => setFormData(prev => ({ ...prev, affectedUsers: e.target.value }))}
                  disabled={aiFilling}
                  className="w-full px-4 py-3 bg-background border border-input rounded-md text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-60"
                />
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Detailed Description *</label>
              <textarea
                value={formData.description}
                onChange={(e) => field('description', e.target.value)}
                placeholder="Provide detailed information about the threat…"
                required
                disabled={aiFilling}
                rows={5}
                className="w-full px-4 py-3 bg-background border border-input rounded-md text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none disabled:opacity-60"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Technical Analysis</label>
              <textarea
                value={formData.detailedAnalysis}
                onChange={(e) => field('detailedAnalysis', e.target.value)}
                placeholder="Deeper analysis of attack flow, indicators, likely objective, and response considerations…"
                disabled={aiFilling}
                rows={5}
                className="w-full px-4 py-3 bg-background border border-input rounded-md text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none disabled:opacity-60"
              />
            </div>

            {/* Evidence */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Evidence (URLs, Email Headers, Screenshots)
              </label>
              <textarea
                value={formData.evidence}
                onChange={(e) => field('evidence', e.target.value)}
                placeholder="Paste any relevant URLs, email headers, or describe screenshots…"
                disabled={aiFilling}
                rows={3}
                className="w-full px-4 py-3 bg-background border border-input rounded-md text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none disabled:opacity-60"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Prevention Tips</label>
              <div className="space-y-2 mb-2">
                {formData.preventionTips.map((tip, i) => (
                  <div key={i} className="flex items-center gap-2 p-2 bg-surface rounded-md text-sm">
                    <Icon name="ShieldCheckIcon" size={14} className="text-success flex-shrink-0" />
                    <span className="flex-1 text-foreground">{tip}</span>
                    <button
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, preventionTips: prev.preventionTips.filter((_, idx) => idx !== i) }))}
                      className="text-muted-foreground hover:text-error transition-colors"
                    >
                      <Icon name="XMarkIcon" size={14} />
                    </button>
                  </div>
                ))}
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={tipInput}
                  onChange={(e) => setTipInput(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addTip(); } }}
                  placeholder="Add a prevention tip and press Enter…"
                  className="flex-1 px-4 py-2.5 bg-background border border-input rounded-md text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                />
                <button type="button" onClick={addTip} className="px-3 py-2.5 bg-surface border border-border rounded-md text-sm font-medium hover:bg-muted transition-colors">
                  Add
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Real-World Examples</label>
              <div className="space-y-2 mb-2">
                {formData.realWorldExamples.map((example, i) => (
                  <div key={i} className="flex items-center gap-2 p-2 bg-surface rounded-md text-sm">
                    <Icon name="DocumentTextIcon" size={14} className="text-brand-trust flex-shrink-0" />
                    <span className="flex-1 text-foreground">{example}</span>
                    <button
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, realWorldExamples: prev.realWorldExamples.filter((_, idx) => idx !== i) }))}
                      className="text-muted-foreground hover:text-error transition-colors"
                    >
                      <Icon name="XMarkIcon" size={14} />
                    </button>
                  </div>
                ))}
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={exampleInput}
                  onChange={(e) => setExampleInput(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addExample(); } }}
                  placeholder="Add a real-world example and press Enter…"
                  className="flex-1 px-4 py-2.5 bg-background border border-input rounded-md text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                />
                <button type="button" onClick={addExample} className="px-3 py-2.5 bg-surface border border-border rounded-md text-sm font-medium hover:bg-muted transition-colors">
                  Add
                </button>
              </div>
            </div>

            {/* Guidelines */}
            <div className="bg-brand-trust/10 border border-brand-trust/30 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <Icon name="InformationCircleIcon" size={20} className="text-brand-trust mt-0.5 flex-shrink-0" />
                <div className="text-sm text-foreground">
                  <p className="font-semibold mb-1">Community Guidelines</p>
                  <p className="text-muted-foreground">
                    Your report will be reviewed by our security team and shared with the community
                    to help protect others. Please ensure all information is accurate and does not
                    contain personal data.
                  </p>
                </div>
              </div>
            </div>

            {error && (
              <div className="flex items-center space-x-2 p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-sm text-red-500">
                <Icon name="ExclamationCircleIcon" size={18} className="flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div className="flex items-center justify-end space-x-3 pt-4 border-t border-border">
              <button
                type="button"
                onClick={onClose}
                disabled={submitting}
                className="px-6 py-2.5 bg-surface text-foreground font-semibold rounded-md hover:bg-muted transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting || aiFilling}
                className="px-6 py-2.5 bg-brand-accent text-white font-semibold rounded-md hover:bg-brand-accent/90 transition-colors flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Icon name="PaperAirplaneIcon" size={18} />
                <span>{submitting ? 'Submitting…' : 'Submit Report'}</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
