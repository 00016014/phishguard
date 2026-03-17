import Icon from '@/components/ui/AppIcon';

interface Challenge {
  id: number;
  title: string;
  description: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert';
  type: 'Quiz' | 'Simulation' | 'Assessment';
  duration: string;
  points: number;
  completed: boolean;
  icon: string;
}

interface ChallengeCardProps {
  challenge: Challenge;
  onStart: (id: number) => void;
}

export default function ChallengeCard({ challenge, onStart }: ChallengeCardProps) {
  const difficultyColors = {
    Beginner: 'bg-success/10 text-success border-success/20',
    Intermediate: 'bg-brand-trust/10 text-brand-trust border-brand-trust/20',
    Advanced: 'bg-warning/10 text-warning border-warning/20',
    Expert: 'bg-error/10 text-error border-error/20',
  };

  const typeColors = {
    Quiz: 'bg-brand-accent/10 text-brand-accent',
    Simulation: 'bg-brand-secondary/10 text-brand-secondary',
    Assessment: 'bg-brand-primary/10 text-brand-primary',
  };

  return (
    <div className="bg-card rounded-lg border border-border shadow-sm hover:shadow-md transition-shadow overflow-hidden">
      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className={`p-3 rounded-lg ${typeColors[challenge.type]}`}>
            <Icon name={challenge.icon as any} size={24} />
          </div>
          {challenge.completed && (
            <div className="flex items-center space-x-1 text-success text-sm font-medium">
              <Icon name="CheckCircleIcon" size={16} variant="solid" />
              <span>Completed</span>
            </div>
          )}
        </div>

        <h3 className="text-lg font-headline font-bold text-foreground mb-2">
          {challenge.title}
        </h3>

        <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
          {challenge.description}
        </p>

        <div className="flex flex-wrap gap-2 mb-4">
          <span className={`px-3 py-1 rounded-full text-xs font-medium border ${difficultyColors[challenge.difficulty]}`}>
            {challenge.difficulty}
          </span>
          <span className="px-3 py-1 rounded-full text-xs font-medium bg-surface text-foreground">
            {challenge.type}
          </span>
        </div>

        <div className="flex items-center justify-between text-sm text-muted-foreground mb-4">
          <div className="flex items-center space-x-1">
            <Icon name="ClockIcon" size={16} />
            <span>{challenge.duration}</span>
          </div>
          <div className="flex items-center space-x-1">
            <Icon name="StarIcon" size={16} variant="solid" className="text-warning" />
            <span className="font-medium text-foreground">{challenge.points} pts</span>
          </div>
        </div>

        <button
          onClick={() => onStart(challenge.id)}
          className={`w-full py-2.5 px-4 rounded-md font-cta font-semibold transition-all ${
            challenge.completed
              ? 'bg-surface text-foreground hover:bg-muted'
              : 'bg-brand-accent text-white hover:bg-brand-accent/90 shadow-sm hover:shadow-md'
          }`}
        >
          {challenge.completed ? 'Review Challenge' : 'Start Challenge'}
        </button>
      </div>
    </div>
  );
}