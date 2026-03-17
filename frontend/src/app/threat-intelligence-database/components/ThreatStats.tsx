import Icon from '@/components/ui/AppIcon';

interface ThreatStatsProps {
  stats: {
    totalThreats: number;
    activeThreats: number;
    mitigatedThreats: number;
    communityReports: number;
  };
}

const ThreatStats = ({ stats }: ThreatStatsProps) => {
  const statCards = [
    {
      label: 'Total Threats',
      value: stats.totalThreats.toLocaleString(),
      icon: 'CircleStackIcon' as const,
      color: 'text-brand-primary',
      bg: 'bg-brand-primary/10',
    },
    {
      label: 'Active Threats',
      value: stats.activeThreats.toLocaleString(),
      icon: 'ExclamationTriangleIcon' as const,
      color: 'text-error',
      bg: 'bg-error/10',
    },
    {
      label: 'Mitigated',
      value: stats.mitigatedThreats.toLocaleString(),
      icon: 'ShieldCheckIcon' as const,
      color: 'text-success',
      bg: 'bg-success/10',
    },
    {
      label: 'Community Reports',
      value: stats.communityReports.toLocaleString(),
      icon: 'UserGroupIcon' as const,
      color: 'text-brand-trust',
      bg: 'bg-brand-trust/10',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {statCards.map((stat, index) => (
        <div
          key={index}
          className="bg-card border border-border rounded-lg p-5 hover:shadow-md transition-shadow duration-300"
        >
          <div className="flex items-center justify-between mb-3">
            <div className={`${stat.bg} ${stat.color} p-3 rounded-lg`}>
              <Icon name={stat.icon} size={24} variant="solid" />
            </div>
          </div>
          <div className="text-3xl font-headline font-bold text-foreground mb-1">
            {stat.value}
          </div>
          <div className="text-sm text-muted-foreground">{stat.label}</div>
        </div>
      ))}
    </div>
  );
};

export default ThreatStats;