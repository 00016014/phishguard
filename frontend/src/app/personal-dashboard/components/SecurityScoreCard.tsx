'use client';
import { useRouter } from 'next/navigation';
import Icon from '@/components/ui/AppIcon';

interface SecurityScoreCardProps {
  score: number;
  trend: 'up' | 'down' | 'stable';
  lastUpdated: string;
}

export default function SecurityScoreCard({ score, trend, lastUpdated }: SecurityScoreCardProps) {
  const router = useRouter();

  const getScoreColor = (s: number) => {
    if (s >= 80) return '#10B981'; // emerald-500
    if (s >= 60) return '#F59E0B'; // amber-500
    return '#EF4444'; // red-500
  };

  const getScoreTextColor = (s: number) => {
    if (s >= 80) return 'text-success';
    if (s >= 60) return 'text-warning';
    return 'text-error';
  };

  const getScoreLabel = (s: number) => {
    if (s >= 80) return 'Excellent';
    if (s >= 60) return 'Good';
    if (s >= 40) return 'Fair';
    return 'Needs Improvement';
  };

  const getTrendIcon = () => {
    if (trend === 'up') return 'ArrowTrendingUpIcon';
    if (trend === 'down') return 'ArrowTrendingDownIcon';
    return 'MinusIcon';
  };

  const getTrendColor = () => {
    if (trend === 'up') return 'text-success';
    if (trend === 'down') return 'text-error';
    return 'text-muted-foreground';
  };

  // Circular gauge geometry
  const radius = 54;
  const cx = 70;
  const cy = 70;
  const circumference = 2 * Math.PI * radius;
  // Use a 270° arc (from 135° to 405°) — bottom-left to bottom-right going clockwise
  const arcFraction = 0.75; // 270° out of 360°
  const trackLength = circumference * arcFraction;
  const fillLength = trackLength * (Math.min(Math.max(score, 0), 100) / 100);
  const gapLength = circumference - trackLength;

  // Rotate so the arc starts at 135° (bottom-left)
  const startAngle = 135;

  return (
    <div className="bg-card rounded-lg shadow-md p-6 border border-border">
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-lg font-headline font-bold text-foreground">Security Score</h2>
        <div className={`flex items-center space-x-1 ${getTrendColor()}`}>
          <Icon name={getTrendIcon() as any} size={18} />
          <span className="text-sm font-medium">
            {trend === 'stable' ? 'Stable' : trend === 'up' ? '+5%' : '-3%'}
          </span>
        </div>
      </div>

      {/* Circular gauge */}
      <div className="flex flex-col items-center my-2">
        <svg width={140} height={140} viewBox="0 0 140 140">
          {/* Track arc */}
          <circle
            cx={cx}
            cy={cy}
            r={radius}
            fill="none"
            stroke="var(--color-surface)"
            strokeWidth={12}
            strokeDasharray={`${trackLength} ${gapLength}`}
            strokeDashoffset={0}
            strokeLinecap="round"
            transform={`rotate(${startAngle} ${cx} ${cy})`}
          />
          {/* Filled arc */}
          <circle
            cx={cx}
            cy={cy}
            r={radius}
            fill="none"
            stroke={getScoreColor(score)}
            strokeWidth={12}
            strokeDasharray={`${fillLength} ${circumference - fillLength}`}
            strokeDashoffset={0}
            strokeLinecap="round"
            transform={`rotate(${startAngle} ${cx} ${cy})`}
            style={{ transition: 'stroke-dasharray 0.6s ease' }}
          />
          {/* Score number */}
          <text
            x={cx}
            y={cy - 6}
            textAnchor="middle"
            dominantBaseline="middle"
            fontSize="26"
            fontWeight="700"
            fill={getScoreColor(score)}
            fontFamily="var(--font-headline)"
          >
            {score}
          </text>
          {/* "out of 100" label */}
          <text
            x={cx}
            y={cy + 18}
            textAnchor="middle"
            dominantBaseline="middle"
            fontSize="10"
            fill="var(--color-muted-foreground)"
          >
            out of 100
          </text>
        </svg>

        {/* Score label badge */}
        <span
          className={`-mt-3 text-sm font-semibold ${getScoreTextColor(score)}`}
        >
          {getScoreLabel(score)}
        </span>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between text-xs text-muted-foreground mt-2">
        <span>Last updated: {lastUpdated}</span>
        <button
          onClick={() => router.push('/scan-detect-hub')}
          className="text-brand-primary hover:text-brand-primary/80 font-medium transition-colors"
        >
          View Details
        </button>
      </div>
    </div>
  );
}