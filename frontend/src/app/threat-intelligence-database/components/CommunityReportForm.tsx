'use client';

import { useState, useRef } from 'react';
import Icon from '@/components/ui/AppIcon';
import { ThreatService } from '@/services/ThreatService';

interface CommunityReportFormProps {
  onSubmit: (report: {
    title: string;
    type: string;
    description: string;
    severity: string;
    evidence: string;
    imageUrl: string;
    origin: string;
    affectedUsers: number;
    detectedDate: string;
    detailedAnalysis: string;
    preventionTips: string[];
    realWorldExamples: string[];
  }) => Promise<void>;
  onClose: () => void;
}

const SEVERITY_COLORS: Record<string, string> = {
  Critical: 'bg-red-500/20 text-red-500 border-red-500/30',
  High: 'bg-orange-500/20 text-orange-500 border-orange-500/30',
  Medium: 'bg-yellow-500/20 text-yellow-500 border-yellow-500/30',
  Low: 'bg-green-500/20 text-green-500 border-green-500/30',
};

const THREAT_TYPES = [
  'Email Phishing', 'SMS Phishing', 'Voice Phishing', 'Social Media',
  'Malware', 'Ransomware', 'Spear Phishing', 'Business Email Compromise', 'Other',
];
const SEVERITY_LEVELS = ['Low', 'Medium', 'High', 'Critical'];
const STATUS_OPTIONS = ['active', 'mitigated', 'archived'];
const AI_CONTEXT_TEMPLATES = [
  'Target audience: finance team in US. Delivery channel: email with invoice attachment. Goal: credential theft and wire-fraud redirection.',
  'Observed IOCs: suspicious sender domain, urgent payment language, mismatched reply-to, and shortened URL redirecting to login page.',
  'Campaign pattern: repeated from multiple lookalike domains over 48 hours. Include likely MITRE ATT&CK techniques and recommended containment steps.',
];

const CommunityReportForm = ({ onSubmit, onClose }: CommunityReportFormProps) => {
  const [formData, setFormData] = useState({
    title: '',
    type: 'Email Phishing',
    severity: 'Medium',
    status: 'active',
    origin: '',
    affectedUsers: '' as string | number,
    detectedDate: new Date().toISOString().slice(0, 10),
    description: '',
    detailedAnalysis: '',
    evidence: '',
    imageUrl: '',
  });
  const [preventionTips, setPreventionTips] = useState<string[]>(['']);
  const [realWorldExamples, setRealWorldExamples] = useState<string[]>(['']);
  const [tipInput, setTipInput] = useState('');
  const [exampleInput, setExampleInput] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [aiPrompt, setAiPrompt] = useState('');
  const [showAiPrompt, setShowAiPrompt] = useState(false);
  const tipInputRef = useRef<HTMLInputElement>(null);
  const exampleInputRef = useRef<HTMLInputElement>(null);

  const set = (key: string, value: any) => setFormData(prev => ({ ...prev, [key]: value }));

  const addTip = () => {
    const v = tipInput.trim();
    if (v) {
      setPreventionTips(prev => [...prev.filter(t => t), v]);
      setTipInput('');
      setTimeout(() => tipInputRef.current?.focus(), 50);
    }
  };

  const addExample = () => {
    const v = exampleInput.trim();
    if (v) {
      setRealWorldExamples(prev => [...prev.filter(e => e), v]);
      setExampleInput('');
      setTimeout(() => exampleInputRef.current?.focus(), 50);
    }
  };

  const buildAiContext = () => {
    const hints: string[] = [];
    if (formData.type) hints.push(`Threat type selected: ${formData.type}`);
    if (formData.severity) hints.push(`Severity selected: ${formData.severity}`);
    if (formData.origin.trim()) hints.push(`Origin hint: ${formData.origin.trim()}`);
    if (formData.affectedUsers) hints.push(`Estimated affected users: ${formData.affectedUsers}`);
    if (formData.imageUrl.trim()) hints.push(`Related image/screenshot URL: ${formData.imageUrl.trim()}`);
    const prompt = aiPrompt.trim();
    if (prompt) hints.push(`Reporter context: ${prompt}`);
    return hints.join('\n');
  };

  const handleAiFill = async () => {
    const evidenceSource = formData.evidence.trim() || formData.description.trim() || 'Suspicious threat reported by user';
    const aiContext = buildAiContext();
    setAiLoading(true);
    setError('');
    try {
      const s = await ThreatService.aiSuggestCommunityReport(evidenceSource, aiContext || undefined);
      setFormData(prev => ({
        ...prev,
        title: s.title || prev.title,
        type: s.type || prev.type,
        severity: s.severity || prev.severity,
        origin: s.origin || prev.origin,
        affectedUsers: s.affected_users ?? prev.affectedUsers,
        description: s.description || prev.description,
        detailedAnalysis: s.detailed_analysis || prev.detailedAnalysis,
      }));
      if (Array.isArray(s.prevention_tips) && s.prevention_tips.length > 0) {
        setPreventionTips(s.prevention_tips);
      }
      if (Array.isArray(s.real_world_examples) && s.real_world_examples.length > 0) {
        setRealWorldExamples(s.real_world_examples);
      }
    } catch {
      setError('AI fill failed — please fill the form manually or try again.');
    } finally {
      setAiLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      await onSubmit({
        title: formData.title,
        type: formData.type,
        description: formData.description,
        severity: formData.severity,
        evidence: formData.evidence,
        imageUrl: formData.imageUrl,
        origin: formData.origin,
        affectedUsers: Number(formData.affectedUsers) || 0,
        detectedDate: formData.detectedDate,
        detailedAnalysis: formData.detailedAnalysis,
        preventionTips: preventionTips.filter(t => t.trim()),
        realWorldExamples: realWorldExamples.filter(e => e.trim()),
      });
      setSuccess(true);
    } catch (err: any) {
      setError(err?.message || 'Failed to submit report. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const inputCls = 'w-full px-4 py-2.5 bg-background border border-input rounded-md text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent text-sm';
  const labelCls = 'block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5';

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
      <div className="bg-card border border-border rounded-xl w-full max-w-4xl max-h-[92vh] overflow-y-auto shadow-2xl flex flex-col">
        {/* Header */}
        <div className="sticky top-0 bg-card border-b border-border px-6 py-4 flex items-center justify-between z-10">
          <h2 className="text-xl font-headline font-bold text-foreground flex items-center gap-2">
            <Icon name="FlagIcon" size={22} />
            Report New Threat
          </h2>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleAiFill}
              disabled={aiLoading || submitting}
              className="flex items-center gap-2 px-4 py-2 bg-brand-accent/10 border border-brand-accent/30 text-brand-accent rounded-md text-sm font-semibold hover:bg-brand-accent/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {aiLoading ? (
                <>
                  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  AI Filling…
                </>
              ) : (
                <>
                  <Icon name="SparklesIcon" size={16} />
                  AI Fill
                </>
              )}
            </button>
            <button
              type="button"
              onClick={() => setShowAiPrompt(p => !p)}
              className={`flex items-center gap-1.5 px-3 py-2 border rounded-md text-sm font-medium transition-colors ${
                showAiPrompt
                  ? 'bg-brand-accent/20 border-brand-accent/40 text-brand-accent'
                  : 'bg-surface border-border text-muted-foreground hover:text-foreground hover:bg-muted'
              }`}
            >
              <Icon name="PencilSquareIcon" size={15} />
              Prompt
            </button>
            <button onClick={onClose} className="p-2 hover:bg-surface rounded-md transition-colors" aria-label="Close">
              <Icon name="XMarkIcon" size={22} />
            </button>
          </div>
        </div>

        {showAiPrompt && (
          <div className="border-b border-border bg-brand-accent/5 px-6 py-3">
            <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">
              AI Context — give the AI extra detail about this threat
            </label>
            <p className="text-xs text-muted-foreground mb-2">
              Add concrete context: target audience, attack goal, observed indicators (domains, URLs, sender patterns), timeline, and impact.
            </p>
            <div className="flex items-end gap-3">
              <textarea
                value={aiPrompt}
                onChange={e => setAiPrompt(e.target.value)}
                placeholder="e.g. Target: procurement team in UK. Sender domain: paypa1-billing-support.com. IOC: bit.ly redirect to fake Microsoft login. Goal: credential theft + invoice fraud."
                rows={2}
                className="flex-1 px-4 py-2.5 bg-background border border-input rounded-md text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent text-sm resize-none"
              />
              <button
                type="button"
                onClick={handleAiFill}
                disabled={aiLoading || submitting}
                className="flex items-center gap-2 px-4 py-2.5 bg-brand-accent text-white rounded-md text-sm font-semibold hover:bg-brand-accent/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
              >
                {aiLoading ? (
                  <>
                    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Filling…
                  </>
                ) : (
                  <>
                    <Icon name="SparklesIcon" size={16} />
                    Fill with AI
                  </>
                )}
              </button>
            </div>
            <div className="flex flex-wrap gap-2 mt-2">
              {AI_CONTEXT_TEMPLATES.map((template, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setAiPrompt(template)}
                  className="px-2.5 py-1 text-xs rounded-full border border-border bg-background text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                >
                  Use Template {idx + 1}
                </button>
              ))}
              <span className="text-xs text-muted-foreground self-center">{aiPrompt.trim().length}/500</span>
            </div>
          </div>
        )}

        {success ? (
          <div className="p-14 flex flex-col items-center text-center">
            <div className="w-20 h-20 rounded-full bg-success/20 flex items-center justify-center mb-6">
              <Icon name="CheckCircleIcon" size={48} className="text-success" variant="solid" />
            </div>
            <h3 className="text-xl font-headline font-bold text-foreground mb-2">Report Submitted!</h3>
            <p className="text-muted-foreground mb-6 max-w-sm">
              Thank you for helping keep the community safe. Your report is now live in the Threat Intelligence Database.
            </p>
            <button onClick={onClose} className="px-6 py-2.5 bg-brand-accent text-white font-semibold rounded-md hover:bg-brand-accent/90 transition-colors">
              Close
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-0">
            <div className="flex flex-col lg:flex-row gap-0">
              {/* Left: Form */}
              <div className="flex-1 p-6 space-y-5">
                {/* Row 1: Title */}
                <div>
                  <label className={labelCls}>Threat Title *</label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={e => set('title', e.target.value)}
                    placeholder="e.g. PayPal Invoice Email Scam Campaign"
                    required
                    className={inputCls}
                  />
                </div>

                {/* Row 2: Type + Severity */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className={labelCls}>Threat Type *</label>
                    <select value={formData.type} onChange={e => set('type', e.target.value)} required className={inputCls}>
                      {THREAT_TYPES.map(t => <option key={t}>{t}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className={labelCls}>Severity Level *</label>
                    <select value={formData.severity} onChange={e => set('severity', e.target.value)} required className={inputCls}>
                      {SEVERITY_LEVELS.map(s => <option key={s}>{s}</option>)}
                    </select>
                  </div>
                </div>

                {/* Row 3: Status + Origin + Affected Users + Date */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div>
                    <label className={labelCls}>Status</label>
                    <select value={formData.status} onChange={e => set('status', e.target.value)} className={inputCls}>
                      {STATUS_OPTIONS.map(s => <option key={s}>{s}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className={labelCls}>Origin</label>
                    <input
                      type="text"
                      value={formData.origin}
                      onChange={e => set('origin', e.target.value)}
                      placeholder="e.g. Russia, Dark Web"
                      className={inputCls}
                    />
                  </div>
                  <div>
                    <label className={labelCls}>Affected Users</label>
                    <input
                      type="number"
                      min="0"
                      value={formData.affectedUsers}
                      onChange={e => set('affectedUsers', e.target.value)}
                      placeholder="e.g. 5000"
                      className={inputCls}
                    />
                  </div>
                  <div>
                    <label className={labelCls}>Detected Date</label>
                    <input
                      type="date"
                      value={formData.detectedDate}
                      onChange={e => set('detectedDate', e.target.value)}
                      className={inputCls}
                    />
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label className={labelCls}>Description *</label>
                  <textarea
                    value={formData.description}
                    onChange={e => set('description', e.target.value)}
                    placeholder="Briefly describe the threat, how it was encountered, and its impact…"
                    required
                    rows={3}
                    className={`${inputCls} resize-none`}
                  />
                </div>

                {/* Detailed Analysis */}
                <div>
                  <label className={labelCls}>Detailed Analysis</label>
                  <textarea
                    value={formData.detailedAnalysis}
                    onChange={e => set('detailedAnalysis', e.target.value)}
                    placeholder="Provide in-depth technical analysis: attack vectors, indicators of compromise, TTPs…"
                    rows={4}
                    className={`${inputCls} resize-none`}
                  />
                </div>

                {/* Evidence */}
                <div>
                  <label className={labelCls}>Evidence / IOCs</label>
                  <textarea
                    value={formData.evidence}
                    onChange={e => set('evidence', e.target.value)}
                    placeholder="Paste suspicious URLs, email headers, domain names, hashes, screenshots description…"
                    rows={3}
                    className={`${inputCls} resize-none`}
                  />
                </div>

                {/* Image URL */}
                <div>
                  <label className={labelCls}>Image URL</label>
                  <input
                    type="url"
                    value={formData.imageUrl}
                    onChange={e => set('imageUrl', e.target.value)}
                    placeholder="https://example.com/screenshot.png — optional screenshot or image URL"
                    className={inputCls}
                  />
                </div>

                {/* Prevention Tips */}
                <div>
                  <label className={labelCls}>Prevention Tips</label>
                  <div className="space-y-2 mb-2">
                    {preventionTips.filter(t => t.trim()).map((tip, i) => (
                      <div key={i} className="flex items-center gap-2 p-2 bg-surface rounded-md text-sm">
                        <Icon name="ShieldCheckIcon" size={14} className="text-success flex-shrink-0" />
                        <span className="flex-1 text-foreground">{tip}</span>
                        <button
                          type="button"
                          onClick={() => setPreventionTips(prev => prev.filter((_, idx) => idx !== i))}
                          className="text-muted-foreground hover:text-error transition-colors"
                        >
                          <Icon name="XMarkIcon" size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <input
                      ref={tipInputRef}
                      type="text"
                      value={tipInput}
                      onChange={e => setTipInput(e.target.value)}
                      onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addTip(); } }}
                      placeholder="Add a prevention tip and press Enter…"
                      className={`${inputCls} flex-1`}
                    />
                    <button type="button" onClick={addTip} className="px-3 py-2.5 bg-surface border border-border rounded-md text-sm font-medium hover:bg-muted transition-colors">
                      Add
                    </button>
                  </div>
                </div>

                {/* Real-World Examples */}
                <div>
                  <label className={labelCls}>Real-World Examples</label>
                  <div className="space-y-2 mb-2">
                    {realWorldExamples.filter(e => e.trim()).map((ex, i) => (
                      <div key={i} className="flex items-center gap-2 p-2 bg-surface rounded-md text-sm">
                        <Icon name="DocumentTextIcon" size={14} className="text-brand-trust flex-shrink-0" />
                        <span className="flex-1 text-foreground">{ex}</span>
                        <button
                          type="button"
                          onClick={() => setRealWorldExamples(prev => prev.filter((_, idx) => idx !== i))}
                          className="text-muted-foreground hover:text-error transition-colors"
                        >
                          <Icon name="XMarkIcon" size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <input
                      ref={exampleInputRef}
                      type="text"
                      value={exampleInput}
                      onChange={e => setExampleInput(e.target.value)}
                      onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addExample(); } }}
                      placeholder="Add a real-world example and press Enter…"
                      className={`${inputCls} flex-1`}
                    />
                    <button type="button" onClick={addExample} className="px-3 py-2.5 bg-surface border border-border rounded-md text-sm font-medium hover:bg-muted transition-colors">
                      Add
                    </button>
                  </div>
                </div>
              </div>

              {/* Right: Live Preview */}
              <div className="lg:w-72 xl:w-80 border-t lg:border-t-0 lg:border-l border-border p-6 space-y-4">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Live Preview</p>
                <div className="rounded-lg border border-border bg-background overflow-hidden shadow-sm">
                  {formData.imageUrl ? (
                    <div className="h-24 overflow-hidden bg-surface">
                      <img
                        src={formData.imageUrl}
                        alt="Threat"
                        className="w-full h-full object-cover"
                        onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }}
                      />
                    </div>
                  ) : (
                    <div className="h-24 bg-gradient-to-br from-brand-accent/20 via-brand-trust/10 to-surface flex items-center justify-center">
                      <Icon name="ShieldExclamationIcon" size={40} className="text-muted-foreground/40" />
                    </div>
                  )}
                  <div className="p-4 space-y-3">
                    <div className="flex items-center justify-between gap-2">
                      <span className={`text-xs font-bold px-2 py-0.5 rounded-full border ${SEVERITY_COLORS[formData.severity] || SEVERITY_COLORS.Medium}`}>
                        {formData.severity}
                      </span>
                      <span className="text-xs text-muted-foreground capitalize">{formData.status}</span>
                    </div>
                    <h3 className="font-headline font-semibold text-foreground text-sm leading-snug line-clamp-2">
                      {formData.title || 'Threat Title'}
                    </h3>
                    <div className="space-y-1 text-xs text-muted-foreground">
                      <div className="flex gap-1.5">
                        <Icon name="TagIcon" size={12} className="mt-0.5 flex-shrink-0" />
                        <span>{formData.type}</span>
                      </div>
                      {formData.origin && (
                        <div className="flex gap-1.5">
                          <Icon name="GlobeAltIcon" size={12} className="mt-0.5 flex-shrink-0" />
                          <span>{formData.origin}</span>
                        </div>
                      )}
                      <div className="flex gap-1.5">
                        <Icon name="CalendarIcon" size={12} className="mt-0.5 flex-shrink-0" />
                        <span>{formData.detectedDate}</span>
                      </div>
                      {formData.affectedUsers ? (
                        <div className="flex gap-1.5">
                          <Icon name="UsersIcon" size={12} className="mt-0.5 flex-shrink-0" />
                          <span>{Number(formData.affectedUsers).toLocaleString()} affected</span>
                        </div>
                      ) : null}
                    </div>
                    {formData.description && (
                      <p className="text-xs text-muted-foreground line-clamp-3 border-t border-border pt-2">
                        {formData.description}
                      </p>
                    )}
                    {preventionTips.filter(t => t.trim()).length > 0 && (
                      <div className="border-t border-border pt-2">
                        <p className="text-xs font-semibold text-foreground mb-1">Prevention Tips</p>
                        <ul className="space-y-0.5">
                          {preventionTips.filter(t => t.trim()).slice(0, 3).map((tip, i) => (
                            <li key={i} className="text-xs text-muted-foreground flex gap-1">
                              <span className="text-success">•</span>
                              <span className="line-clamp-1">{tip}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>

                <div className="bg-brand-trust/10 border border-brand-trust/30 rounded-lg p-3">
                  <div className="flex items-start gap-2">
                    <Icon name="InformationCircleIcon" size={16} className="text-brand-trust mt-0.5 flex-shrink-0" />
                    <p className="text-xs text-muted-foreground">
                      Your report will be reviewed and added to the Threat Intelligence Database to help protect the community.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="sticky bottom-0 bg-card border-t border-border px-6 py-4 flex items-center justify-between gap-3">
              {error && (
                <div className="flex items-center gap-2 text-sm text-error flex-1">
                  <Icon name="ExclamationCircleIcon" size={16} className="flex-shrink-0" />
                  <span>{error}</span>
                </div>
              )}
              <div className="flex items-center gap-3 ml-auto">
                <button type="button" onClick={onClose} disabled={submitting} className="px-5 py-2.5 bg-surface text-foreground font-semibold rounded-md hover:bg-muted transition-colors text-sm disabled:opacity-50">
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting || !formData.title || !formData.description}
                  className="px-6 py-2.5 bg-brand-accent text-white font-semibold rounded-md hover:bg-brand-accent/90 transition-colors flex items-center gap-2 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Icon name="PaperAirplaneIcon" size={16} />
                  {submitting ? 'Submitting…' : 'Submit Report'}
                </button>
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default CommunityReportForm;
