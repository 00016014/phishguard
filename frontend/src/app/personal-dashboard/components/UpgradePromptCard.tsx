'use client';

import Link from 'next/link';
import Icon from '@/components/ui/AppIcon';
import { useSubscription } from '@/contexts/SubscriptionContext';

export default function UpgradePromptCard() {
  const { subscription, isAtLimit, isNearLimit } = useSubscription();

  if (subscription?.tier !== 'free') return null;
  if (!isAtLimit('scans') && !isNearLimit('scans')) return null;

  const atLimit = isAtLimit('scans');

  return (
    <div className={`rounded-lg border p-5 shadow-md ${
      atLimit
        ? 'bg-gradient-to-r from-error/10 to-warning/10 border-error/30' :'bg-gradient-to-r from-brand-primary/10 to-brand-secondary/10 border-brand-primary/30'
    }`}>
      <div className="flex items-start space-x-4">
        <div className={`flex-shrink-0 flex items-center justify-center w-12 h-12 rounded-full ${
          atLimit ? 'bg-error/20' : 'bg-warning/20'
        }`}>
          <Icon
            name={atLimit ? 'ExclamationCircleIcon' : 'ExclamationTriangleIcon'}
            size={26}
            className={atLimit ? 'text-error' : 'text-warning'}
            variant="solid"
          />
        </div>
        <div className="flex-1">
          <h3 className="text-base font-headline font-bold text-foreground">
            {atLimit ? 'Scan Limit Reached' : 'Approaching Scan Limit'}
          </h3>
          <p className="text-sm text-muted-foreground mt-1">
            {atLimit
              ? `You've used all ${subscription?.scansLimit} free scans this month. Upgrade to Pro for 500 scans/month or Enterprise for unlimited.`
              : `You've used ${subscription?.scansUsed} of ${subscription?.scansLimit} free scans. Upgrade now to avoid interruptions.`
            }
          </p>
          <div className="flex flex-wrap gap-3 mt-4">
            <Link
              href="/pricing"
              className="inline-flex items-center space-x-2 px-5 py-2.5 bg-brand-primary hover:bg-brand-primary/90 text-white text-sm font-semibold rounded-md transition-all duration-200 shadow-sm hover:shadow-md"
            >
              <Icon name="ArrowUpCircleIcon" size={16} variant="solid" />
              <span>Upgrade to Pro — $9/mo</span>
            </Link>
            <Link
              href="/pricing"
              className="inline-flex items-center space-x-2 px-5 py-2.5 border border-border text-sm font-medium text-foreground hover:bg-surface rounded-md transition-colors"
            >
              <span>View All Plans</span>
              <Icon name="ArrowRightIcon" size={14} />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
