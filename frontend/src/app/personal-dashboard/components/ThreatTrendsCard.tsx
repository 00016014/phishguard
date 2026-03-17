'use client';

import Icon from '@/components/ui/AppIcon';

interface TrendData {
  month: string;
  threats: number;
}

interface ThreatTrendsCardProps {
  data: TrendData[];
}

export default function ThreatTrendsCard({ data }: ThreatTrendsCardProps) {
  if (!data || data.length < 2) {
    return (
      <div className="bg-card rounded-lg shadow-md p-6 border border-border">
        <h2 className="text-lg font-headline font-bold text-foreground mb-4">Threat Trends</h2>
        <div className="h-40 flex items-center justify-center text-sm text-muted-foreground">No trend data yet</div>
      </div>
    );
  }

  const maxThreats = Math.max(...data.map(d => d.threats), 1);
  const currentMonth = data[data.length - 1];
  const previousMonth = data[data.length - 2];
  const trend = currentMonth.threats > previousMonth.threats ? 'up' : currentMonth.threats < previousMonth.threats ? 'down' : 'stable';
  const trendPercentage = previousMonth.threats > 0 
    ? Math.abs(((currentMonth.threats - previousMonth.threats) / previousMonth.threats) * 100).toFixed(0)
    : '0';

  return (
    <div className="bg-card rounded-lg shadow-md p-6 border border-border">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-headline font-bold text-foreground">Threat Trends</h2>
        <div className="flex items-center space-x-2 text-muted-foreground">
          <Icon name="ChartBarIcon" size={20} />
          <span className="text-sm font-medium">Last 7 Days</span>
        </div>
      </div>

      <div className="mb-4 p-4 bg-surface rounded-lg">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-xs text-muted-foreground mb-1">This Week</div>
            <div className="text-2xl font-headline font-bold text-foreground">{currentMonth.threats}</div>
          </div>
          <div className={`flex items-center space-x-1 ${
            trend === 'up' ? 'text-error' : trend === 'down' ? 'text-success' : 'text-muted-foreground'
          }`}>
            <Icon 
              name={trend === 'up' ? 'ArrowTrendingUpIcon' : trend === 'down' ? 'ArrowTrendingDownIcon' : 'MinusIcon'} 
              size={20} 
            />
            <span className="text-sm font-semibold">{trendPercentage}%</span>
          </div>
        </div>
      </div>

      <div className="h-40 flex items-end justify-between space-x-2">
        {data.map((item, index) => {
          const heightPct = (item.threats / maxThreats) * 100;
          return (
            <div key={index} className="flex-1 flex flex-col items-center">
              <div className="w-full flex items-end justify-center mb-2" style={{ height: '120px' }}>
                <div
                  className={`w-full rounded-t-md transition-all duration-500 ${
                    index === data.length - 1 ? 'bg-brand-primary' : 'bg-brand-primary/40'
                  } hover:bg-brand-primary group relative`}
                  style={{ height: `${Math.max(heightPct, 4)}%`, minHeight: '4px' }}
                >
                  <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-foreground text-white text-xs px-2 py-1 rounded whitespace-nowrap">
                    {item.threats} threats
                  </div>
                </div>
              </div>
              <div className="text-xs text-muted-foreground font-medium">{item.month}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}