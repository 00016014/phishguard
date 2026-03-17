'use client';
import { useRouter } from 'next/navigation';
import Icon from '@/components/ui/AppIcon';

interface Threat {
  id: string;
  title: string;
  category: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  dateAdded: string;
}

interface BookmarkedThreatsCardProps {
  threats: Threat[];
}

export default function BookmarkedThreatsCard({ threats }: BookmarkedThreatsCardProps) {
  const router = useRouter();
  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'text-error';
      case 'high': return 'text-warning';
      case 'medium': return 'text-brand-trust';
      default: return 'text-success';
    }
  };

  const getSeverityBg = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-error/10';
      case 'high': return 'bg-warning/10';
      case 'medium': return 'bg-brand-trust/10';
      default: return 'bg-success/10';
    }
  };

  return (
    <div className="bg-card rounded-lg shadow-md p-6 border border-border">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-headline font-bold text-foreground">Bookmarked Threats</h2>
        <button
          onClick={() => router.push('/threat-intelligence-database')}
          className="text-sm text-brand-primary hover:text-brand-primary/80 font-medium transition-colors"
        >
          View All
        </button>
      </div>

      <div className="space-y-3">
        {threats.map((threat) => (
          <div
            key={threat.id}
            onClick={() => router.push(`/threat-intelligence-database/${threat.id}`)}
            className="flex items-start justify-between p-3 bg-surface rounded-lg hover:bg-surface/80 transition-colors group cursor-pointer"
          >
            <div className="flex items-start space-x-3 flex-1 min-w-0">
              <Icon name="BookmarkIcon" size={20} className="text-brand-primary flex-shrink-0 mt-0.5" variant="solid" />
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-semibold text-foreground mb-1 group-hover:text-brand-primary transition-colors">
                  {threat.title}
                </h3>
                <div className="flex items-center space-x-3 text-xs text-muted-foreground">
                  <span className="flex items-center space-x-1">
                    <Icon name="TagIcon" size={14} />
                    <span>{threat.category}</span>
                  </span>
                  <span>{threat.dateAdded}</span>
                </div>
              </div>
            </div>
            <span className={`flex-shrink-0 ml-3 px-2 py-1 text-xs font-semibold rounded-full ${getSeverityBg(threat.severity)} ${getSeverityColor(threat.severity)} capitalize`}>
              {threat.severity}
            </span>
          </div>
        ))}
      </div>

      {threats.length === 0 && (
        <div className="text-center py-8">
          <Icon name="BookmarkSlashIcon" size={48} className="text-muted-foreground mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">No bookmarked threats yet</p>
        </div>
      )}
    </div>
  );
}