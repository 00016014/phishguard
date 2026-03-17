import Link from 'next/link';
import Icon from '@/components/ui/AppIcon';

interface LearningModule {
  id: number;
  title: string;
  description: string;
  duration: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  points: number;
  icon: string;
  completion_count: number;
  completed: boolean;
}

interface LearningHighlightsProps {
  modules: LearningModule[];
}

const LEVEL_CONFIG = {
  beginner:     { bg: 'bg-success/10',  text: 'text-success',  label: 'Beginner',     iconBg: 'bg-success/15',      iconColor: 'text-success' },
  intermediate: { bg: 'bg-warning/10',  text: 'text-warning',  label: 'Intermediate', iconBg: 'bg-warning/15',      iconColor: 'text-warning' },
  advanced:     { bg: 'bg-error/10',    text: 'text-error',    label: 'Advanced',     iconBg: 'bg-brand-primary/15', iconColor: 'text-brand-primary' },
};

const SKELETON_LEVELS = ['beginner', 'intermediate', 'advanced'] as const;

export default function LearningHighlights({ modules }: LearningHighlightsProps) {
  const items = modules.length > 0 ? modules : null;

  return (
    <section className="bg-background py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-12">
          <div>
            <div className="inline-flex items-center space-x-2 bg-brand-secondary/10 px-4 py-2 rounded-full mb-4">
              <Icon name="AcademicCapIcon" size={20} className="text-brand-secondary" variant="solid" />
              <span className="text-sm font-medium text-brand-secondary">Interactive Learning</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-headline font-bold text-foreground mb-4">
              Master Cybersecurity Skills
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl">
              Progressive learning pathways designed to transform you from beginner to cybersecurity advocate
            </p>
          </div>
          <Link
            href="/interactive-learning-lab"
            className="mt-6 lg:mt-0 inline-flex items-center space-x-2 px-6 py-3 bg-brand-secondary hover:bg-brand-secondary/90 text-white font-cta font-semibold rounded-lg transition-all duration-300"
          >
            <span>Explore All Courses</span>
            <Icon name="ArrowRightIcon" size={18} />
          </Link>
        </div>

        {/* Skeleton while loading */}
        {!items && (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {SKELETON_LEVELS.map((lvl) => {
              const cfg = LEVEL_CONFIG[lvl];
              return (
                <div key={lvl} className="bg-card rounded-xl border border-border overflow-hidden animate-pulse">
                  <div className={`h-2 ${cfg.bg}`} />
                  <div className="p-6 space-y-4">
                    <div className={`w-14 h-14 rounded-xl ${cfg.iconBg}`} />
                    <div className="h-4 bg-surface rounded w-3/4" />
                    <div className="h-3 bg-surface rounded w-full" />
                    <div className="h-3 bg-surface rounded w-5/6" />
                    <div className="flex justify-between pt-2">
                      <div className="h-3 bg-surface rounded w-16" />
                      <div className="h-3 bg-surface rounded w-16" />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Real modules */}
        {items && (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {items.map((module) => {
              const cfg = LEVEL_CONFIG[module.difficulty] ?? LEVEL_CONFIG.beginner;
              return (
                <div
                  key={module.id}
                  className="bg-card rounded-xl border border-border overflow-hidden hover:shadow-lg transition-all duration-300 group flex flex-col"
                >
                  {/* Colored top bar */}
                  <div className={`h-1.5 ${cfg.bg.replace('/10', '/60')}`} />

                  <div className="p-6 flex flex-col flex-1">
                    {/* Icon + level badge */}
                    <div className="flex items-start justify-between mb-4">
                      <div className={`w-14 h-14 rounded-xl ${cfg.iconBg} flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                        <Icon name={module.icon as any} size={28} className={cfg.iconColor} variant="solid" />
                      </div>
                      <span className={`${cfg.bg} ${cfg.text} text-xs font-semibold px-3 py-1 rounded-full uppercase`}>
                        {cfg.label}
                      </span>
                    </div>

                    <h3 className="text-xl font-headline font-bold text-foreground mb-2 group-hover:text-brand-primary transition-colors">
                      {module.title}
                    </h3>
                    <p className="text-sm text-muted-foreground leading-relaxed mb-4 flex-1">
                      {module.description}
                    </p>

                    {/* Stats row */}
                    <div className="flex items-center justify-between text-sm text-muted-foreground mb-5">
                      <span className="flex items-center gap-1.5">
                        <Icon name="ClockIcon" size={15} />
                        {module.duration}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Icon name="StarIcon" size={15} className="text-warning" variant="solid" />
                        {module.points} pts
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Icon name="UserGroupIcon" size={15} />
                        {module.completion_count.toLocaleString()} done
                      </span>
                    </div>

                    <div className="pt-4 border-t border-border">
                      <Link
                        href="/interactive-learning-lab"
                        className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-brand-primary/10 hover:bg-brand-primary text-brand-primary hover:text-white font-semibold text-sm rounded-lg transition-all duration-300 group/btn"
                      >
                        <span>{module.completed ? 'Review' : 'Start Learning'}</span>
                        <Icon name="ArrowRightIcon" size={15} className="group-hover/btn:translate-x-1 transition-transform" />
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}

