'use client';
import { useState } from 'react';
import Link from 'next/link';
import AppImage from '@/components/ui/AppImage';
import Icon from '@/components/ui/AppIcon';

interface ThreatCardProps {
  threat: {
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
  };
  onViewDetails?: (id: string) => void;
  isBookmarked?: boolean;
  onBookmark?: () => void;
  isMitigated?: boolean;
  onMitigate?: () => void;
}

const ThreatCard = ({ threat, onViewDetails, isBookmarked = false, onBookmark, isMitigated = false, onMitigate }: ThreatCardProps) => {
  const [bookmarkPending, setBookmarkPending] = useState(false);
  const [mitigatePending, setMitigatePending] = useState(false);

  const handleBookmark = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!onBookmark || bookmarkPending) return;
    setBookmarkPending(true);
    await onBookmark();
    setBookmarkPending(false);
  };

  const handleMitigate = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!onMitigate || mitigatePending) return;
    setMitigatePending(true);
    await onMitigate();
    setMitigatePending(false);
  };
  const severityConfig = {
    critical: {
      bg: 'bg-error/10',
      text: 'text-error',
      border: 'border-error',
      icon: 'ExclamationTriangleIcon' as const,
    },
    high: {
      bg: 'bg-warning/10',
      text: 'text-warning',
      border: 'border-warning',
      icon: 'ExclamationCircleIcon' as const,
    },
    medium: {
      bg: 'bg-brand-trust/10',
      text: 'text-brand-trust',
      border: 'border-brand-trust',
      icon: 'InformationCircleIcon' as const,
    },
    low: {
      bg: 'bg-success/10',
      text: 'text-success',
      border: 'border-success',
      icon: 'CheckCircleIcon' as const,
    },
  };

  const statusConfig = {
    active: { text: 'Active Threat', color: 'text-error' },
    mitigated: { text: 'Resolved', color: 'text-muted-foreground' },
    archived: { text: 'Archived', color: 'text-muted-foreground' },
  };

  const config = severityConfig[threat.severity];
  const statusInfo = isMitigated
    ? { text: 'Mitigated', color: 'text-success' }
    : statusConfig[threat.status];

  return (
    <div className="bg-card border border-border rounded-lg overflow-hidden hover:shadow-lg transition-all duration-300 group">
      <div className="relative h-48 overflow-hidden">
        <AppImage
          src={threat.image}
          alt={threat.alt}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        <div className={`absolute top-3 left-3 px-3 py-1.5 ${config.bg} ${config.text} border ${config.border} rounded-md flex items-center space-x-2 backdrop-blur-sm`}>
          <Icon name={config.icon} size={16} variant="solid" />
          <span className="text-xs font-semibold uppercase">{threat.severity}</span>
        </div>
        <div className={`absolute top-3 right-3 px-3 py-1.5 bg-card/90 ${statusInfo.color} border border-border rounded-md backdrop-blur-sm`}>
          <span className="text-xs font-semibold">{statusInfo.text}</span>
        </div>
      </div>

      <div className="p-5">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <h3 className="text-lg font-headline font-bold text-foreground mb-1 line-clamp-2 group-hover:text-brand-primary transition-colors">
              {threat.title}
            </h3>
            <div className="flex items-center space-x-3 text-sm text-muted-foreground">
              <span className="flex items-center space-x-1">
                <Icon name="TagIcon" size={14} />
                <span>{threat.type}</span>
              </span>
              <span className="flex items-center space-x-1">
                <Icon name="MapPinIcon" size={14} />
                <span>{threat.origin}</span>
              </span>
            </div>
          </div>
        </div>

        <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
          {threat.description}
        </p>

        <div className="flex items-center justify-between pt-4 border-t border-border">
          <div className="flex items-center space-x-4 text-xs text-muted-foreground">
            <span className="flex items-center space-x-1">
              <Icon name="CalendarIcon" size={14} />
              <span>{threat.detectedDate}</span>
            </span>
            <span className="flex items-center space-x-1">
              <Icon name="UserGroupIcon" size={14} />
              <span>{threat.affectedUsers.toLocaleString()} affected</span>
            </span>
            <span className="flex items-center space-x-1">
              <Icon name="ChatBubbleLeftRightIcon" size={14} />
              <span>{threat.communityReports} reports</span>
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 mt-4">
          <Link
            href={`/threat-intelligence-database/${threat.id}`}
            className="flex-1 px-4 py-2.5 bg-brand-primary text-white font-cta font-semibold rounded-md hover:bg-brand-primary/90 transition-all duration-300 flex items-center justify-center space-x-2"
          >
            <span>Learn More</span>
            <Icon name="ArrowRightIcon" size={16} />
          </Link>
          {onBookmark && (
            <button
              onClick={handleBookmark}
              disabled={bookmarkPending}
              title={isBookmarked ? 'Remove bookmark' : 'Bookmark this threat'}
              className={`flex-shrink-0 p-2.5 rounded-md border transition-all ${
                isBookmarked
                  ? 'bg-brand-primary/10 border-brand-primary text-brand-primary'
                  : 'border-border text-muted-foreground hover:border-brand-primary hover:text-brand-primary'
              }`}
            >
              <Icon name="BookmarkIcon" size={18} variant={isBookmarked ? 'solid' : 'outline'} />
            </button>
          )}
          {onMitigate && (
            <button
              onClick={handleMitigate}
              disabled={mitigatePending}
              title={isMitigated ? 'Remove mitigation mark' : 'Mark as mitigated'}
              className={`flex-shrink-0 p-2.5 rounded-md border transition-all ${
                isMitigated
                  ? 'bg-success/10 border-success text-success'
                  : 'border-border text-muted-foreground hover:border-success hover:text-success'
              }`}
            >
              <Icon name={isMitigated ? 'CheckBadgeIcon' : 'ShieldCheckIcon'} size={18} variant={isMitigated ? 'solid' : 'outline'} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ThreatCard;