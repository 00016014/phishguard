'use client';
import { useRouter } from 'next/navigation';
import Icon from '@/components/ui/AppIcon';
import AppImage from '@/components/ui/AppImage';

interface Activity {
  id: string;
  type: 'discussion' | 'report' | 'comment';
  title: string;
  author: string;
  authorAvatar: string;
  authorAvatarAlt: string;
  timestamp: string;
  replies?: number;
  link?: string;
}

interface CommunityActivityCardProps {
  activities: Activity[];
}

export default function CommunityActivityCard({ activities }: CommunityActivityCardProps) {
  const router = useRouter();
  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'discussion': return 'ChatBubbleLeftRightIcon';
      case 'report': return 'FlagIcon';
      case 'comment': return 'ChatBubbleLeftIcon';
      default: return 'UserGroupIcon';
    }
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'discussion': return 'text-brand-primary';
      case 'report': return 'text-error';
      case 'comment': return 'text-brand-trust';
      default: return 'text-muted-foreground';
    }
  };

  return (
    <div className="bg-card rounded-lg shadow-md p-6 border border-border">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-headline font-bold text-foreground">Community Activity</h2>
        <button
          onClick={() => router.push('/personal-dashboard#activity')}
          className="text-sm text-brand-primary hover:text-brand-primary/80 font-medium transition-colors"
        >
          View All
        </button>
      </div>

      <div className="space-y-3">
        {activities.map((activity, index) => (
          <div
            key={activity.id ?? index}
            onClick={() => activity.link && router.push(activity.link)}
            className={`flex items-start space-x-3 p-3 bg-surface rounded-lg hover:bg-surface/80 transition-colors group${activity.link ? ' cursor-pointer' : ''}`}
          >
            <div className="flex-shrink-0 w-10 h-10 rounded-full overflow-hidden bg-surface flex items-center justify-center">
              {activity.authorAvatar ? (
                <AppImage
                  src={activity.authorAvatar}
                  alt={activity.authorAvatarAlt}
                  className="w-full h-full object-cover"
                />
              ) : (
                <Icon name="UserCircleIcon" size={28} className="text-muted-foreground" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-2 mb-1">
                <Icon name={getActivityIcon(activity.type) as any} size={14} className={getActivityColor(activity.type)} />
                <span className="text-xs font-medium text-muted-foreground capitalize">{activity.type}</span>
              </div>
              <h3 className="text-sm font-semibold text-foreground mb-1 group-hover:text-brand-primary transition-colors break-all line-clamp-2">
                {activity.title}
              </h3>
              <div className="flex items-center space-x-3 text-xs text-muted-foreground">
                <span>by {activity.author}</span>
                <span>•</span>
                <span>{activity.timestamp}</span>
                {activity.replies !== undefined && (
                  <>
                    <span>•</span>
                    <span className="flex items-center space-x-1">
                      <Icon name="ChatBubbleLeftIcon" size={12} />
                      <span>{activity.replies} replies</span>
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {activities.length === 0 && (
        <div className="text-center py-8">
          <Icon name="UserGroupIcon" size={48} className="text-muted-foreground mx-auto mb-3" />
          <p className="text-sm text-muted-foreground mb-3">No community activity yet</p>
          <button className="px-4 py-2 text-sm font-cta font-semibold text-brand-primary border border-brand-primary hover:bg-brand-primary hover:text-white rounded-md transition-colors">
            Join Community
          </button>
        </div>
      )}
    </div>
  );
}