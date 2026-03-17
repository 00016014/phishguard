interface LearningStatsProps {
  stats: {
    totalChallenges: number;
    completedChallenges: number;
    currentStreak: number;
    securityScore: number;
  };
}

export default function LearningStats({ stats }: LearningStatsProps) {
  const completionRate = Math.round((stats.completedChallenges / stats.totalChallenges) * 100);

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <div className="bg-card rounded-lg p-6 border border-border shadow-sm">
        <div className="text-sm font-medium text-muted-foreground mb-1">Completion Rate</div>
        <div className="text-3xl font-bold text-brand-primary">{completionRate}%</div>
        <div className="text-xs text-muted-foreground mt-1">
          {stats.completedChallenges} of {stats.totalChallenges} challenges
        </div>
      </div>

      <div className="bg-card rounded-lg p-6 border border-border shadow-sm">
        <div className="text-sm font-medium text-muted-foreground mb-1">Current Streak</div>
        <div className="text-3xl font-bold text-brand-accent">{stats.currentStreak}</div>
        <div className="text-xs text-muted-foreground mt-1">consecutive days</div>
      </div>

      <div className="bg-card rounded-lg p-6 border border-border shadow-sm">
        <div className="text-sm font-medium text-muted-foreground mb-1">Security Score</div>
        <div className="text-3xl font-bold text-brand-secondary">{stats.securityScore}</div>
        <div className="text-xs text-muted-foreground mt-1">out of 1000 points</div>
      </div>

      <div className="bg-card rounded-lg p-6 border border-border shadow-sm">
        <div className="text-sm font-medium text-muted-foreground mb-1">Rank</div>
        <div className="text-3xl font-bold text-brand-trust">
          {stats.securityScore >= 800 ? 'Expert' : stats.securityScore >= 600 ? 'Advanced' : stats.securityScore >= 400 ? 'Intermediate' : 'Beginner'}
        </div>
        <div className="text-xs text-muted-foreground mt-1">skill level</div>
      </div>
    </div>
  );
}