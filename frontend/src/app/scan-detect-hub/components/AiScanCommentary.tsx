'use client';

import { useEffect, useState } from 'react';
import Icon from '@/components/ui/AppIcon';
import { ScannerService } from '@/services/ScannerService';

interface Props {
  scanType: string;
  content: string;
  threatLevel: string;
  score: number;
  details: any[];
}

const VERDICT_STYLES: Record<string, string> = {
  Safe: 'bg-green-500/15 text-green-500 border-green-500/30',
  'Low Risk': 'bg-green-400/15 text-green-400 border-green-400/30',
  'Moderate Risk': 'bg-yellow-500/15 text-yellow-500 border-yellow-500/30',
  'High Risk': 'bg-orange-500/15 text-orange-500 border-orange-500/30',
  'Critical Threat': 'bg-red-500/15 text-red-500 border-red-500/30',
};

const CONFIDENCE_COLORS: Record<string, string> = {
  High: 'text-green-500',
  Medium: 'text-yellow-500',
  Low: 'text-orange-500',
};

export default function AiScanCommentary({ scanType, content, threatLevel, score, details }: Props) {
  const [commentary, setCommentary] = useState<{
    verdict: string;
    headline: string;
    summary: string;
    recommendations: string[];
    confidence: string;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const detailsSignature = JSON.stringify(details ?? []);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(false);
    setCommentary(null);

    ScannerService.getAiCommentary(scanType, content, threatLevel, score, details)
      .then(data => {
        if (!cancelled) setCommentary(data);
      })
      .catch(() => {
        if (!cancelled) setError(true);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => { cancelled = true; };
  }, [scanType, content, threatLevel, score, detailsSignature]);

  if (loading) {
    return (
      <div className="rounded-lg border border-brand-accent/20 bg-brand-accent/5 p-5 flex items-center gap-4 animate-pulse">
        <div className="w-8 h-8 rounded-full bg-brand-accent/20 flex items-center justify-center flex-shrink-0">
          <svg className="w-4 h-4 animate-spin text-brand-accent" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
        </div>
        <div className="space-y-2 flex-1">
          <div className="h-4 bg-brand-accent/10 rounded w-48" />
          <div className="h-3 bg-brand-accent/10 rounded w-72" />
        </div>
      </div>
    );
  }

  if (error || !commentary) return null;

  const verdictStyle = VERDICT_STYLES[commentary.verdict] || VERDICT_STYLES['Moderate Risk'];
  const confidenceColor = CONFIDENCE_COLORS[commentary.confidence] || 'text-muted-foreground';

  return (
    <div className="rounded-lg border border-brand-accent/25 bg-gradient-to-br from-brand-accent/5 to-brand-trust/5 p-5 space-y-4">
      {/* Header row */}
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-brand-accent/15 flex items-center justify-center flex-shrink-0">
            <Icon name="SparklesIcon" size={16} className="text-brand-accent" />
          </div>
          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">AI Analysis</p>
            <p className="text-sm font-bold text-foreground leading-snug">{commentary.headline}</p>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <span className={`text-xs font-bold px-2.5 py-1 rounded-full border ${verdictStyle}`}>
            {commentary.verdict}
          </span>
          <span className={`text-xs font-medium ${confidenceColor}`}>
            {commentary.confidence} confidence
          </span>
        </div>
      </div>

      {/* Summary */}
      <p className="text-sm text-muted-foreground leading-relaxed">{commentary.summary}</p>

      {/* Recommendations */}
      {commentary.recommendations.length > 0 && (
        <div>
          <p className="text-xs font-semibold text-foreground uppercase tracking-wider mb-2">Recommended Actions</p>
          <ul className="space-y-1.5">
            {commentary.recommendations.map((rec, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-foreground">
                <Icon name="CheckCircleIcon" size={15} className="text-brand-accent mt-0.5 flex-shrink-0" variant="solid" />
                <span>{rec}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
