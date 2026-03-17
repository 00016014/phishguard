'use client';
import { useRouter } from 'next/navigation';
import Icon from '@/components/ui/AppIcon';

interface Module {
  id: string;
  title: string;
  progress: number;
  totalLessons: number;
  completedLessons: number;
  category: string;
}

interface LearningProgressCardProps {
  modules: Module[];
  overallProgress: number;
}

export default function LearningProgressCard({ modules, overallProgress }: LearningProgressCardProps) {
  const router = useRouter();
  return (
    <div className="bg-card rounded-lg shadow-md p-6 border border-border">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-headline font-bold text-foreground">Learning Progress</h2>
        <div className="flex items-center space-x-2">
          <Icon name="AcademicCapIcon" size={20} className="text-brand-primary" />
          <span className="text-sm font-semibold text-brand-primary">{overallProgress}% Complete</span>
        </div>
      </div>

      <div className="w-full bg-surface rounded-full h-2 mb-6">
        <div
          className="h-2 rounded-full bg-gradient-to-r from-brand-primary to-brand-secondary transition-all duration-500"
          style={{ width: `${overallProgress}%` }}
        />
      </div>

      <div className="space-y-4">
        {modules.map((module) => (
          <div key={module.id} className="p-4 bg-surface rounded-lg hover:bg-surface/80 transition-colors">
            <div className="flex items-start justify-between mb-2">
              <div className="flex-1">
                <h3 className="text-sm font-semibold text-foreground mb-1">{module.title}</h3>
                <span className="text-xs text-muted-foreground">{module.category}</span>
              </div>
              <span className="text-xs font-medium text-brand-primary ml-3">
                {module.completedLessons}/{module.totalLessons}
              </span>
            </div>
            <div className="w-full bg-background rounded-full h-1.5">
              <div
                className="h-1.5 rounded-full bg-brand-accent transition-all duration-300"
                style={{ width: `${module.progress}%` }}
              />
            </div>
          </div>
        ))}
      </div>

      {modules.length === 0 && (
        <div className="text-center py-8">
          <Icon name="BookOpenIcon" size={48} className="text-muted-foreground mx-auto mb-3" />
          <p className="text-sm text-muted-foreground mb-3">Start your learning journey today!</p>
          <button
            onClick={() => router.push('/interactive-learning-lab')}
            className="px-4 py-2 text-sm font-cta font-semibold text-white bg-brand-primary hover:bg-brand-primary/90 rounded-md transition-colors"
          >
            Browse Courses
          </button>
        </div>
      )}
    </div>
  );
}