'use client';

import { useEffect, useState } from 'react';
import Icon from '@/components/ui/AppIcon';
import AppImage from '@/components/ui/AppImage';
import { useAuth } from '@/contexts/AuthContext';
import { ContentService } from '@/services/ContentService';
import { toast } from 'sonner';

interface ThreatDetail {
  id: string;
  title: string;
  type: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  detectedDate: string;
  affectedUsers: number;
  description: string;
  image: string;
  alt: string;
  origin: string;
  status: 'active' | 'mitigated' | 'archived';
  communityReports: number;
  detailedAnalysis: string;
  preventionTips: string[];
  realWorldExamples: string[];
  relatedThreats: string[];
  communityInsights: Array<{
    user: string;
    date: string;
    insight: string;
  }>;
}

interface ThreatDetailModalProps {
  threat: ThreatDetail | null;
  onClose: () => void;
  isBookmarked?: boolean;
  onBookmark?: () => void;
  isMitigated?: boolean;
  onMitigate?: () => void;
}

const ThreatDetailModal = ({ threat, onClose, isBookmarked = false, onBookmark, isMitigated = false, onMitigate }: ThreatDetailModalProps) => {
  const { user } = useAuth();
  const [localInsights, setLocalInsights] = useState<ThreatDetail['communityInsights']>([]);
  const [commentText, setCommentText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [bookmarkPending, setBookmarkPending] = useState(false);
  const [mitigatePending, setMitigatePending] = useState(false);

  const handleBookmark = async () => {
    if (!onBookmark || bookmarkPending) return;
    setBookmarkPending(true);
    await onBookmark();
    setBookmarkPending(false);
  };

  const handleMitigate = async () => {
    if (!onMitigate || mitigatePending) return;
    setMitigatePending(true);
    await onMitigate();
    setMitigatePending(false);
  };

  useEffect(() => {
    if (threat) {
      document.body.style.overflow = 'hidden';
      setLocalInsights(threat.communityInsights || []);
      setCommentText('');
      setSubmitError('');
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [threat]);

  if (!threat) return null;

  const handleAddInsight = async () => {
    const text = commentText.trim();
    if (!text) return;
    setSubmitting(true);
    setSubmitError('');
    const result = await ContentService.addCommunityInsight(threat.id, text);
    setSubmitting(false);
    if (result?.community_insights) {
      setLocalInsights(result.community_insights);
      setCommentText('');
      toast.success('Insight posted successfully');
    } else {
      setSubmitError('Failed to post insight. Please try again.');
      toast.error('Failed to post insight');
    }
  };

  const severityConfig = {
    critical: {
      bg: 'bg-error/10',
      text: 'text-error',
      border: 'border-error',
    },
    high: {
      bg: 'bg-warning/10',
      text: 'text-warning',
      border: 'border-warning',
    },
    medium: {
      bg: 'bg-brand-trust/10',
      text: 'text-brand-trust',
      border: 'border-brand-trust',
    },
    low: {
      bg: 'bg-success/10',
      text: 'text-success',
      border: 'border-success',
    },
  };

  const config = severityConfig[threat.severity];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
      <div className="bg-card border border-border rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl animate-slide-in-right">
        <div className="sticky top-0 bg-card border-b border-border px-6 py-4 flex items-center justify-between z-10">
          <h2 className="text-2xl font-headline font-bold text-foreground">Threat Details</h2>
          <div className="flex items-center gap-2">
            {onBookmark && (
              <button
                onClick={handleBookmark}
                disabled={bookmarkPending}
                title={isBookmarked ? 'Remove bookmark' : 'Bookmark this threat'}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-md border text-sm font-medium transition-all ${
                  isBookmarked
                    ? 'bg-brand-primary/10 border-brand-primary text-brand-primary'
                    : 'border-border text-muted-foreground hover:border-brand-primary hover:text-brand-primary'
                }`}
              >
                <Icon name="BookmarkIcon" size={16} variant={isBookmarked ? 'solid' : 'outline'} />
                <span>{isBookmarked ? 'Bookmarked' : 'Bookmark'}</span>
              </button>
            )}
            {onMitigate && (
              <button
                onClick={handleMitigate}
                disabled={mitigatePending}
                title={isMitigated ? 'Remove mitigation mark' : 'Mark as mitigated'}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-md border text-sm font-medium transition-all ${
                  isMitigated
                    ? 'bg-success/10 border-success text-success'
                    : 'border-border text-muted-foreground hover:border-success hover:text-success'
                }`}
              >
                <Icon name={isMitigated ? 'CheckBadgeIcon' : 'ShieldCheckIcon'} size={16} variant={isMitigated ? 'solid' : 'outline'} />
                <span>{isMitigated ? 'Mitigated' : 'Mark Mitigated'}</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="p-2 hover:bg-surface rounded-md transition-colors"
              aria-label="Close modal"
            >
              <Icon name="XMarkIcon" size={24} />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          <div className="relative h-64 rounded-lg overflow-hidden">
            <AppImage src={threat.image} alt={threat.alt} className="w-full h-full object-cover" />
            <div
              className={`absolute top-4 left-4 px-4 py-2 ${config.bg} ${config.text} border ${config.border} rounded-md backdrop-blur-sm`}
            >
              <span className="text-sm font-semibold uppercase">{threat.severity} Severity</span>
            </div>
          </div>

          <div>
            <h3 className="text-2xl font-headline font-bold text-foreground mb-3">
              {threat.title}
            </h3>
            <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
              <span className="flex items-center space-x-1">
                <Icon name="TagIcon" size={16} />
                <span>{threat.type}</span>
              </span>
              <span className="flex items-center space-x-1">
                <Icon name="MapPinIcon" size={16} />
                <span>{threat.origin}</span>
              </span>
              <span className="flex items-center space-x-1">
                <Icon name="CalendarIcon" size={16} />
                <span>Detected: {threat.detectedDate}</span>
              </span>
              <span className="flex items-center space-x-1">
                <Icon name="UserGroupIcon" size={16} />
                <span>{threat.affectedUsers.toLocaleString()} affected</span>
              </span>
            </div>
          </div>

          <div className="bg-surface border border-border rounded-lg p-5">
            <h4 className="text-lg font-headline font-bold text-foreground mb-3 flex items-center space-x-2">
              <Icon name="DocumentTextIcon" size={20} />
              <span>Detailed Analysis</span>
            </h4>
            <p className="text-foreground leading-relaxed">{threat.detailedAnalysis}</p>
          </div>

          <div className="bg-surface border border-border rounded-lg p-5">
            <h4 className="text-lg font-headline font-bold text-foreground mb-3 flex items-center space-x-2">
              <Icon name="ShieldCheckIcon" size={20} />
              <span>Prevention Tips</span>
            </h4>
            <ul className="space-y-2">
              {threat.preventionTips.map((tip, index) => (
                <li key={index} className="flex items-start space-x-3">
                  <Icon
                    name="CheckCircleIcon"
                    size={20}
                    className="text-success mt-0.5 flex-shrink-0"
                    variant="solid"
                  />
                  <span className="text-foreground">{tip}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-surface border border-border rounded-lg p-5">
            <h4 className="text-lg font-headline font-bold text-foreground mb-3 flex items-center space-x-2">
              <Icon name="ExclamationTriangleIcon" size={20} />
              <span>Real-World Examples</span>
            </h4>
            <ul className="space-y-3">
              {threat.realWorldExamples.map((example, index) => (
                <li key={index} className="flex items-start space-x-3">
                  <span className="flex-shrink-0 w-6 h-6 bg-warning/20 text-warning rounded-full flex items-center justify-center text-xs font-bold">
                    {index + 1}
                  </span>
                  <span className="text-foreground">{example}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-surface border border-border rounded-lg p-5">
            <h4 className="text-lg font-headline font-bold text-foreground mb-3 flex items-center space-x-2">
              <Icon name="ChatBubbleLeftRightIcon" size={20} />
              <span>Community Insights ({localInsights.length})</span>
            </h4>

            {/* Add comment form */}
            {user ? (
              <div className="mb-4 p-4 bg-card border border-border rounded-lg">
                <p className="text-sm font-semibold text-foreground mb-2">Add your insight</p>
                <textarea
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  placeholder="Share what you know about this threat..."
                  rows={3}
                  className="w-full px-3 py-2 rounded-md border border-border bg-surface text-foreground text-sm resize-none focus:outline-none focus:ring-2 focus:ring-brand-primary/50 placeholder:text-muted-foreground"
                />
                {submitError && (
                  <p className="text-xs text-error mt-1">{submitError}</p>
                )}
                <div className="flex justify-end mt-2">
                  <button
                    onClick={handleAddInsight}
                    disabled={submitting || !commentText.trim()}
                    className="px-4 py-2 bg-brand-primary text-white text-sm font-semibold rounded-md hover:bg-brand-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
                  >
                    <Icon name="PaperAirplaneIcon" size={16} />
                    <span>{submitting ? 'Posting…' : 'Post Insight'}</span>
                  </button>
                </div>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground mb-4 italic">Log in to share your insight.</p>
            )}

            <div className="space-y-4">
              {localInsights.length === 0 && (
                <p className="text-sm text-muted-foreground">No insights yet. Be the first to share!</p>
              )}
              {localInsights.map((insight, index) => (
                <div key={index} className="bg-card border border-border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-semibold text-foreground">{insight.user}</span>
                    <span className="text-xs text-muted-foreground">{insight.date}</span>
                  </div>
                  <p className="text-sm text-foreground">{insight.insight}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-border">
            <button
              onClick={onClose}
              className="px-6 py-2.5 bg-surface text-foreground font-cta font-semibold rounded-md hover:bg-muted transition-colors"
            >
              Close
            </button>
            <button className="px-6 py-2.5 bg-brand-accent text-white font-cta font-semibold rounded-md hover:bg-brand-accent/90 transition-colors flex items-center space-x-2">
              <Icon name="FlagIcon" size={18} />
              <span>Report Similar Threat</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ThreatDetailModal;
