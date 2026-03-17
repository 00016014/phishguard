'use client';
import { useRouter } from 'next/navigation';
import Icon from '@/components/ui/AppIcon';

interface Recommendation {
  id: string;
  type: 'course' | 'webinar' | 'assessment';
  title: string;
  description: string;
  date: string;
  duration: string;
  difficulty?: string;
  challengeId?: string;
}

interface UpcomingRecommendationsCardProps {
  recommendations: Recommendation[];
}

export default function UpcomingRecommendationsCard({ recommendations }: UpcomingRecommendationsCardProps) {
  const router = useRouter();
  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'course': return 'BookOpenIcon';
      case 'webinar': return 'VideoCameraIcon';
      case 'assessment': return 'ClipboardDocumentCheckIcon';
      default: return 'LightBulbIcon';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'course': return 'bg-brand-primary';
      case 'webinar': return 'bg-brand-secondary';
      case 'assessment': return 'bg-brand-accent';
      default: return 'bg-muted';
    }
  };

  const getDifficultyColor = (difficulty?: string) => {
    if (!difficulty) return '';
    switch (difficulty.toLowerCase()) {
      case 'beginner': return 'text-success';
      case 'intermediate': return 'text-warning';
      case 'advanced': return 'text-error';
      default: return 'text-muted-foreground';
    }
  };

  return (
    <div className="bg-card rounded-lg shadow-md p-6 border border-border">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-headline font-bold text-foreground">Recommended for You</h2>
        <Icon name="SparklesIcon" size={20} className="text-brand-accent" />
      </div>

      <div className="space-y-4">
        {recommendations.map((rec) => (
          <div
            key={rec.id}
            className="p-4 bg-surface rounded-lg hover:bg-surface/80 transition-colors group"
          >
            <div className="flex items-start space-x-3 mb-3">
              <div className={`flex-shrink-0 w-10 h-10 rounded-lg ${getTypeColor(rec.type)} flex items-center justify-center`}>
                <Icon name={getTypeIcon(rec.type) as any} size={20} className="text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-2 mb-1">
                  <span className="text-xs font-semibold text-brand-primary uppercase">{rec.type}</span>
                  {rec.difficulty && (
                    <>
                      <span className="text-xs text-muted-foreground">•</span>
                      <span className={`text-xs font-medium ${getDifficultyColor(rec.difficulty)} capitalize`}>
                        {rec.difficulty}
                      </span>
                    </>
                  )}
                </div>
                <h3 className="text-sm font-semibold text-foreground mb-1 group-hover:text-brand-primary transition-colors">
                  {rec.title}
                </h3>
                <p className="text-xs text-muted-foreground mb-2">{rec.description}</p>
                <div className="flex items-center space-x-3 text-xs text-muted-foreground">
                  <span className="flex items-center space-x-1">
                    <Icon name="CalendarIcon" size={14} />
                    <span>{rec.date}</span>
                  </span>
                  <span className="flex items-center space-x-1">
                    <Icon name="ClockIcon" size={14} />
                    <span>{rec.duration}</span>
                  </span>
                </div>
              </div>
            </div>
            <button
              onClick={() => router.push(rec.challengeId ? `/interactive-learning-lab?challenge=${rec.challengeId}` : '/interactive-learning-lab')}
              className="w-full px-4 py-2 text-sm font-cta font-semibold text-brand-primary border border-brand-primary hover:bg-brand-primary hover:text-white rounded-md transition-colors"
            >
              Start Challenge
            </button>
          </div>
        ))}
      </div>

      {recommendations.length === 0 && (
        <div className="text-center py-8">
          <Icon name="LightBulbIcon" size={48} className="text-muted-foreground mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">No recommendations available yet</p>
        </div>
      )}
    </div>
  );
}