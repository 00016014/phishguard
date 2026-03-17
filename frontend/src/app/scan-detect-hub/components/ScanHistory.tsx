'use client';

import { useState } from 'react';
import Icon from '@/components/ui/AppIcon';

interface ScanDetail {
  category: string;
  severity: 'safe' | 'warning' | 'danger';
  finding: string;
  explanation: string;
}

interface HistoryItem {
  id: string;
  type: string;
  content: string;
  timestamp: string;
  threatLevel: 'safe' | 'low' | 'medium' | 'high' | 'critical';
  score: number;
  details?: ScanDetail[];
}

interface ScanHistoryProps {
  history: HistoryItem[];
  onViewDetails: (id: string) => void;
}

export default function ScanHistory({ history, onViewDetails }: ScanHistoryProps) {
  const [filter, setFilter] = useState<string>('all');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const handleView = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
    onViewDetails(id);
  };

  const getThreatBadge = (level: string) => {
    switch (level) {
      case 'safe':
        return 'bg-success/10 text-success border-success/20';
      case 'low':
        return 'bg-brand-accent/10 text-brand-accent border-brand-accent/20';
      case 'medium':
        return 'bg-warning/10 text-warning border-warning/20';
      case 'high':
        return 'bg-error/10 text-error border-error/20';
      case 'critical':
        return 'bg-brand-cta/10 text-brand-cta border-brand-cta/20';
      default:
        return 'bg-surface text-foreground border-border';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'email':
        return 'EnvelopeIcon';
      case 'url':
        return 'LinkIcon';
      case 'attachment':
        return 'DocumentIcon';
      case 'qr':
        return 'QrCodeIcon';
      default:
        return 'ShieldCheckIcon';
    }
  };

  const filteredHistory = filter === 'all' 
    ? history 
    : history.filter(item => item.type === filter);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-headline font-bold text-foreground">
          Recent Scans
        </h3>
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="px-4 py-2 border border-input rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary"
        >
          <option value="all">All Types</option>
          <option value="email">Email</option>
          <option value="url">URL</option>
          <option value="attachment">Attachment</option>
          <option value="qr">QR Code</option>
        </select>
      </div>

      <div className="space-y-3">
        {filteredHistory.map((item) => (
          <div
            key={item.id}
            className="p-4 bg-card border border-border rounded-lg hover:border-brand-primary/50 transition-all duration-300"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-3 flex-1 min-w-0">
                <div className="p-2 bg-surface rounded-lg">
                  <Icon name={getTypeIcon(item.type) as any} size={20} className="text-brand-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2 mb-1">
                    <span className="text-xs font-medium text-muted-foreground uppercase">
                      {item.type}
                    </span>
                    <span className={`px-2 py-0.5 text-xs font-semibold rounded border ${getThreatBadge(item.threatLevel)}`}>
                      {item.threatLevel.toUpperCase()}
                    </span>
                  </div>
                  <p className="text-sm text-foreground font-medium truncate mb-1">
                    {item.content}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {item.timestamp}
                  </p>
                </div>
              </div>
              <button
                onClick={() => handleView(item.id)}
                className="ml-4 px-3 py-1.5 text-sm text-brand-primary hover:text-brand-primary/80 font-medium flex items-center space-x-1"
              >
                <span>{expandedId === item.id ? 'Hide' : 'View'}</span>
                <Icon name={expandedId === item.id ? 'ChevronUpIcon' : 'ChevronDownIcon'} size={14} />
              </button>
            </div>
            {expandedId === item.id && (
              <div className="mt-3 pt-3 border-t border-border space-y-2">
                <div className="flex items-center justify-between text-xs mb-2">
                  <span className="text-muted-foreground font-medium">Threat Score</span>
                  <span className="font-bold text-foreground">{item.score}/100</span>
                </div>
                {(item.details && item.details.length > 0) ? item.details.map((d, i) => (
                  <div key={i} className={`p-3 rounded-md text-xs ${
                    d.severity === 'danger' ? 'bg-error/10 border border-error/20' :
                    d.severity === 'warning' ? 'bg-warning/10 border border-warning/20' :
                    'bg-success/10 border border-success/20'
                  }`}>
                    <div className="font-semibold text-foreground mb-0.5">{d.finding}</div>
                    <div className="text-muted-foreground">{d.explanation}</div>
                  </div>
                )) : (
                  <p className="text-xs text-muted-foreground">No detailed breakdown available.</p>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}