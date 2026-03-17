import AppImage from '@/components/ui/AppImage';
import Icon from '@/components/ui/AppIcon';

interface LeaderboardEntry {
  rank: number;
  name: string;
  avatar: string;
  alt: string;
  score: number;
  challengesCompleted: number;
  badge: string;
}

interface LeaderboardSectionProps {
  entries: LeaderboardEntry[];
  currentUserRank: number;
}

export default function LeaderboardSection({ entries, currentUserRank }: LeaderboardSectionProps) {
  const getRankIcon = (rank: number) => {
    if (rank === 1) return '🥇';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    return rank;
  };

  return (
    <div className="bg-card rounded-lg border border-border shadow-sm overflow-hidden">
      <div className="bg-gradient-to-r from-brand-primary to-brand-secondary p-6">
        <h2 className="text-2xl font-headline font-bold text-white mb-2">
          Monthly Leaderboard
        </h2>
        <p className="text-white/80 text-sm">
          Top performers in January 2026
        </p>
      </div>

      <div className="p-6">
        <div className="space-y-3">
          {entries.map((entry) => (
            <div
              key={entry.rank}
              className={`flex items-center justify-between p-4 rounded-lg transition-all ${
                entry.rank === currentUserRank
                  ? 'bg-brand-accent/10 border-2 border-brand-accent' :'bg-surface hover:bg-muted'
              }`}
            >
              <div className="flex items-center space-x-4 flex-1">
                <div className="text-2xl font-bold w-12 text-center">
                  {getRankIcon(entry.rank)}
                </div>

                <div className="relative">
                  <AppImage
                    src={entry.avatar}
                    alt={entry.alt}
                    width={48}
                    height={48}
                    className="rounded-full object-cover"
                  />
                  {entry.rank <= 3 && (
                    <div className="absolute -bottom-1 -right-1 bg-warning text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                      <Icon name="StarIcon" size={12} variant="solid" />
                    </div>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2">
                    <h3 className="font-semibold text-foreground truncate">
                      {entry.name}
                    </h3>
                    {entry.rank === currentUserRank && (
                      <span className="text-xs font-medium text-brand-accent">(You)</span>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {entry.challengesCompleted} challenges completed
                  </p>
                </div>
              </div>

              <div className="text-right">
                <div className="text-xl font-bold text-brand-primary">
                  {entry.score.toLocaleString()}
                </div>
                <div className="text-xs text-muted-foreground">points</div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 pt-6 border-t border-border">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Your current rank:</span>
            <span className="font-bold text-brand-primary text-lg">#{currentUserRank}</span>
          </div>
        </div>
      </div>
    </div>
  );
}