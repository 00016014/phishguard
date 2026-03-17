import Icon from '@/components/ui/AppIcon';

interface RateLimitTier {
  tier: string;
  requestsPerMinute: number;
  requestsPerDay: number;
  burstLimit: number;
}

interface RateLimitInfoProps {
  tiers: RateLimitTier[];
}

export default function RateLimitInfo({ tiers }: RateLimitInfoProps) {
  return (
    <div className="bg-card border border-border rounded-lg p-6">
      <div className="flex items-center space-x-3 mb-6">
        <div className="w-10 h-10 bg-gradient-to-br from-warning to-amber-600 rounded-lg flex items-center justify-center">
          <Icon name="ClockIcon" size={20} className="text-white" variant="solid" />
        </div>
        <div>
          <h3 className="text-xl font-headline font-bold text-primary">Rate Limits</h3>
          <p className="text-sm text-muted-foreground">Request throttling by subscription tier</p>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left py-3 px-4 text-sm font-semibold text-foreground">Tier</th>
              <th className="text-left py-3 px-4 text-sm font-semibold text-foreground">Per Minute</th>
              <th className="text-left py-3 px-4 text-sm font-semibold text-foreground">Per Day</th>
              <th className="text-left py-3 px-4 text-sm font-semibold text-foreground">Burst Limit</th>
            </tr>
          </thead>
          <tbody>
            {tiers.map((tier, index) => (
              <tr key={index} className="border-b border-border last:border-0 hover:bg-surface transition-colors">
                <td className="py-3 px-4 text-sm font-medium text-brand-primary">{tier.tier}</td>
                <td className="py-3 px-4 text-sm text-foreground">{tier.requestsPerMinute.toLocaleString()}</td>
                <td className="py-3 px-4 text-sm text-foreground">{tier.requestsPerDay.toLocaleString()}</td>
                <td className="py-3 px-4 text-sm text-foreground">{tier.burstLimit.toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-4 p-4 bg-warning/10 border border-warning/20 rounded-md">
        <div className="flex items-start space-x-3">
          <Icon name="ExclamationTriangleIcon" size={20} className="text-warning flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-foreground mb-1">Rate Limit Headers</p>
            <p className="text-sm text-muted-foreground">
              All API responses include X-RateLimit-Limit, X-RateLimit-Remaining, and X-RateLimit-Reset headers for monitoring usage.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}