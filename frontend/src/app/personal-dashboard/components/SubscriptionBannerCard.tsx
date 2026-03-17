'use client';

import Link from 'next/link';
import Icon from '@/components/ui/AppIcon';
import { useSubscription } from '@/contexts/SubscriptionContext';

export default function SubscriptionBannerCard({ alertsCount }: { alertsCount?: number }) {
  const { subscription, isAtLimit, isNearLimit, getTierBadgeColor, getTierLabel } = useSubscription();
  const liveAlertsUsed = alertsCount ?? subscription.alertsUsed;
  const alertsAtLimitLive = subscription.alertsLimit !== 'unlimited' && liveAlertsUsed >= (subscription.alertsLimit as number);
  const alertsNearLimitLive = !alertsAtLimitLive && subscription.alertsLimit !== 'unlimited' && liveAlertsUsed / (subscription.alertsLimit as number) >= 0.7;

  const getUsageBarColor = (used: number, limit: number | 'unlimited') => {
    if (limit === 'unlimited') return 'bg-success';
    const ratio = used / (limit as number);
    if (ratio >= 1) return 'bg-error';
    if (ratio >= 0.7) return 'bg-warning';
    return 'bg-brand-primary';
  };

  const getUsagePercent = (used: number, limit: number | 'unlimited') => {
    if (limit === 'unlimited') return 100;
    return Math.min((used / (limit as number)) * 100, 100);
  };

  const isFree = subscription.tier === 'free';
  const scansAtLimit = isAtLimit('scans');
  const scansNearLimit = isNearLimit('scans');

  return (
    <div className={`rounded-lg border p-5 ${
      scansAtLimit
        ? 'bg-error/5 border-error/30'
        : scansNearLimit
        ? 'bg-warning/5 border-warning/30' :'bg-card border-border'
    } shadow-md`}>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="flex items-center justify-center w-10 h-10 bg-brand-primary/10 rounded-lg">
            <Icon name="ShieldCheckIcon" size={22} className="text-brand-primary" variant="solid" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-base font-headline font-bold text-foreground">Your Plan</span>
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${
                getTierBadgeColor()
              }`}>
                {subscription.tier === 'enterprise' && <Icon name="StarIcon" size={10} className="mr-1" variant="solid" />}
                {subscription.tier === 'pro' && <Icon name="BoltIcon" size={10} className="mr-1" variant="solid" />}
                {getTierLabel()}
              </span>
            </div>
            {isFree && (
              <p className="text-xs text-muted-foreground mt-0.5">Resets on {subscription.renewalDate}</p>
            )}
          </div>
        </div>

        {isFree && (
          <Link
            href="/pricing"
            className="inline-flex items-center space-x-2 px-4 py-2 bg-brand-primary hover:bg-brand-primary/90 text-white text-sm font-semibold rounded-md transition-all duration-200 shadow-sm hover:shadow-md whitespace-nowrap"
          >
            <Icon name="ArrowUpCircleIcon" size={16} variant="solid" />
            <span>Upgrade to Pro</span>
          </Link>
        )}
        {!isFree && (
          <Link
            href="/pricing"
            className="inline-flex items-center space-x-2 px-4 py-2 border border-border text-sm font-medium text-foreground hover:bg-surface rounded-md transition-colors"
          >
            <Icon name="CreditCardIcon" size={16} />
            <span>Manage Plan</span>
          </Link>
        )}
      </div>

      <div className="mt-5 grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground flex items-center space-x-1">
              <Icon name="MagnifyingGlassIcon" size={12} />
              <span>Scans this month</span>
            </span>
            <span className={`text-xs font-bold ${
              scansAtLimit ? 'text-error' : scansNearLimit ? 'text-warning' : 'text-foreground'
            }`}>
              {subscription.scansUsed}{subscription.scansLimit !== 'unlimited' ? `/${subscription.scansLimit}` : ' / ∞'}
            </span>
          </div>
          <div className="w-full bg-surface rounded-full h-2">
            <div
              className={`h-2 rounded-full transition-all duration-500 ${getUsageBarColor(subscription.scansUsed, subscription.scansLimit)}`}
              style={{ width: `${getUsagePercent(subscription.scansUsed, subscription.scansLimit)}%` }}
            />
          </div>
          {scansAtLimit && (
            <p className="text-xs text-error font-medium">Limit reached — upgrade to scan more</p>
          )}
          {scansNearLimit && !scansAtLimit && (
            <p className="text-xs text-warning font-medium">Almost at limit</p>
          )}
        </div>

        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground flex items-center space-x-1">
              <Icon name="CodeBracketIcon" size={12} />
              <span>API calls today</span>
            </span>
            <span className={`text-xs font-bold ${
              isAtLimit('apiCalls') ? 'text-error' : isNearLimit('apiCalls') ? 'text-warning' : 'text-foreground'
            }`}>
              {subscription.apiCallsUsed}{subscription.apiCallsLimit !== 'unlimited' ? `/${subscription.apiCallsLimit}` : ' / ∞'}
            </span>
          </div>
          <div className="w-full bg-surface rounded-full h-2">
            <div
              className={`h-2 rounded-full transition-all duration-500 ${getUsageBarColor(subscription.apiCallsUsed, subscription.apiCallsLimit)}`}
              style={{ width: `${getUsagePercent(subscription.apiCallsUsed, subscription.apiCallsLimit)}%` }}
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground flex items-center space-x-1">
              <Icon name="BellIcon" size={12} />
              <span>Active alerts</span>
            </span>
            <span className={`text-xs font-bold ${
              alertsAtLimitLive ? 'text-error' : alertsNearLimitLive ? 'text-warning' : 'text-foreground'
            }`}>
              {liveAlertsUsed}{subscription.alertsLimit !== 'unlimited' ? `/${subscription.alertsLimit}` : ' / ∞'}
            </span>
          </div>
          <div className="w-full bg-surface rounded-full h-2">
            <div
              className={`h-2 rounded-full transition-all duration-500 ${getUsageBarColor(liveAlertsUsed, subscription.alertsLimit)}`}
              style={{ width: `${getUsagePercent(liveAlertsUsed, subscription.alertsLimit)}%` }}
            />
          </div>
        </div>
      </div>

      {isFree && (
        <div className="mt-4 pt-4 border-t border-border">
          <div className="flex flex-wrap gap-3">
            {[
              { icon: 'CheckCircleIcon', text: 'Unlimited scans with Pro' },
              { icon: 'CheckCircleIcon', text: 'Advanced analytics' },
              { icon: 'CheckCircleIcon', text: 'Priority support' },
            ].map((item) => (
              <span key={item.text} className="flex items-center space-x-1.5 text-xs text-muted-foreground">
                <Icon name={item.icon as any} size={13} className="text-success" variant="solid" />
                <span>{item.text}</span>
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
