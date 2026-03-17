import Icon from '@/components/ui/AppIcon';

interface Stat {
  label: string;
  value: string;
  icon: string;
  trend: string;
  trendUp: boolean;
}

interface LiveThreatStatsProps {
  stats: Stat[];
}

export default function LiveThreatStats({ stats }: LiveThreatStatsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat, index) => (
        <div
          key={index}
          className="p-6 bg-card border border-border rounded-lg hover:border-brand-primary/50 transition-all duration-300"
        >
          <div className="flex items-start justify-between mb-4">
            <div className="p-3 bg-brand-primary/10 rounded-lg">
              <Icon name={stat.icon as any} size={24} className="text-brand-primary" />
            </div>
            <div className={`flex items-center space-x-1 text-xs font-medium ${
              stat.trendUp ? 'text-success' : 'text-error'
            }`}>
              <Icon 
                name={stat.trendUp ? 'ArrowTrendingUpIcon' : 'ArrowTrendingDownIcon'} 
                size={16} 
              />
              <span>{stat.trend}</span>
            </div>
          </div>
          <div>
            <p className="text-3xl font-headline font-bold text-foreground mb-1">
              {stat.value}
            </p>
            <p className="text-sm text-muted-foreground">
              {stat.label}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}