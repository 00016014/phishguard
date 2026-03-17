'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';

export type SubscriptionTier = 'free' | 'pro' | 'enterprise';

export interface TierLimits {
  scansPerMonth: number | 'unlimited';
  apiCallsPerDay: number | 'unlimited';
  threatAlerts: number | 'unlimited';
  bookmarks: number | 'unlimited';
  learningModules: number | 'unlimited';
  exportReports: boolean;
  prioritySupport: boolean;
  advancedAnalytics: boolean;
  teamMembers: number | 'unlimited';
  customIntegrations: boolean;
}

export interface SubscriptionData {
  tier: SubscriptionTier;
  scansUsed: number;
  scansLimit: number | 'unlimited';
  apiCallsUsed: number;
  apiCallsLimit: number | 'unlimited';
  alertsUsed: number;
  alertsLimit: number | 'unlimited';
  renewalDate: string;
}

const TIER_LIMITS: Record<SubscriptionTier, TierLimits> = {
  free: {
    scansPerMonth: 10,
    apiCallsPerDay: 50,
    threatAlerts: 3,
    bookmarks: 5,
    learningModules: 3,
    exportReports: false,
    prioritySupport: false,
    advancedAnalytics: false,
    teamMembers: 1,
    customIntegrations: false,
  },
  pro: {
    scansPerMonth: 500,
    apiCallsPerDay: 5000,
    threatAlerts: 'unlimited',
    bookmarks: 'unlimited',
    learningModules: 'unlimited',
    exportReports: true,
    prioritySupport: true,
    advancedAnalytics: true,
    teamMembers: 5,
    customIntegrations: false,
  },
  enterprise: {
    scansPerMonth: 'unlimited',
    apiCallsPerDay: 'unlimited',
    threatAlerts: 'unlimited',
    bookmarks: 'unlimited',
    learningModules: 'unlimited',
    exportReports: true,
    prioritySupport: true,
    advancedAnalytics: true,
    teamMembers: 'unlimited',
    customIntegrations: true,
  },
};

interface SubscriptionContextType {
  subscription: SubscriptionData;
  tierLimits: TierLimits;
  isAtLimit: (feature: 'scans' | 'apiCalls' | 'alerts') => boolean;
  isNearLimit: (feature: 'scans' | 'apiCalls' | 'alerts') => boolean;
  getTierBadgeColor: () => string;
  getTierLabel: () => string;
}

const SubscriptionContext = createContext<SubscriptionContextType | null>(null);

export const useSubscription = () => {
  const context = useContext(SubscriptionContext);
  if (!context) throw new Error('useSubscription must be used within SubscriptionProvider');
  return context;
};

export const SubscriptionProvider = ({ children }: { children: React.ReactNode }) => {
  const { user } = useAuth();
  const [subscription, setSubscription] = useState<SubscriptionData>({
    tier: 'free',
    scansUsed: 0,
    scansLimit: 10,
    apiCallsUsed: 0,
    apiCallsLimit: 50,
    alertsUsed: 0,
    alertsLimit: 3,
    renewalDate: 'Never',
  });

  useEffect(() => {
    if (user?.profile) {
      const p = user.profile;
      const tier = (p.tier || 'free') as SubscriptionTier;
      // Always derive limits from the tier so stale DB defaults never mislead
      const tierDerivedLimits: Record<SubscriptionTier, {
        scans: number | 'unlimited';
        apiCalls: number | 'unlimited';
        alerts: number | 'unlimited';
      }> = {
        free:       { scans: p.scans_limit || 10,  apiCalls: p.api_calls_limit || 50, alerts: p.alerts_limit || 3 },
        pro:        { scans: 500,                   apiCalls: 5000,                    alerts: 'unlimited' },
        enterprise: { scans: 'unlimited',           apiCalls: 'unlimited',             alerts: 'unlimited' },
      };
      const lim = tierDerivedLimits[tier];
      setSubscription({
        tier,
        scansUsed: p.scans_used || 0,
        scansLimit: lim.scans,
        apiCallsUsed: p.api_calls_used || 0,
        apiCallsLimit: lim.apiCalls,
        alertsUsed: p.alerts_used || 0,
        alertsLimit: lim.alerts,
        renewalDate: p.renewal_date || 'N/A',
      });
    }
  }, [user]);

  const tierLimits = TIER_LIMITS[subscription.tier];

  const isAtLimit = (feature: 'scans' | 'apiCalls' | 'alerts') => {
    if (feature === 'scans') {
      return (
        subscription.scansLimit !== 'unlimited' &&
        subscription.scansUsed >= (subscription.scansLimit as number)
      );
    }
    if (feature === 'apiCalls') {
      return (
        subscription.apiCallsLimit !== 'unlimited' &&
        subscription.apiCallsUsed >= (subscription.apiCallsLimit as number)
      );
    }
    return (
      subscription.alertsLimit !== 'unlimited' &&
      subscription.alertsUsed >= (subscription.alertsLimit as number)
    );
  };

  const isNearLimit = (feature: 'scans' | 'apiCalls' | 'alerts') => {
    if (feature === 'scans') {
      if (subscription.scansLimit === 'unlimited') return false;
      return subscription.scansUsed / (subscription.scansLimit as number) >= 0.7;
    }
    if (feature === 'apiCalls') {
      if (subscription.apiCallsLimit === 'unlimited') return false;
      return subscription.apiCallsUsed / (subscription.apiCallsLimit as number) >= 0.7;
    }
    if (subscription.alertsLimit === 'unlimited') return false;
    return subscription.alertsUsed / (subscription.alertsLimit as number) >= 0.7;
  };

  const getTierBadgeColor = () => {
    if (subscription.tier === 'enterprise')
      return 'bg-purple-100 text-purple-700 border-purple-200';
    if (subscription.tier === 'pro') return 'bg-blue-100 text-blue-700 border-blue-200';
    return 'bg-gray-100 text-gray-600 border-gray-200';
  };

  const getTierLabel = () => {
    if (subscription.tier === 'enterprise') return 'Enterprise';
    if (subscription.tier === 'pro') return 'Pro';
    return 'Free';
  };

  return (
    <SubscriptionContext.Provider
      value={{ subscription, tierLimits, isAtLimit, isNearLimit, getTierBadgeColor, getTierLabel }}
    >
      {children}
    </SubscriptionContext.Provider>
  );
};

export { TIER_LIMITS };
