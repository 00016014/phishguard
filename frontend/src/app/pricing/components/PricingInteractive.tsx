'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Icon from '@/components/ui/AppIcon';
import { ContentService } from '@/services/ContentService';
import { useAuth } from '@/contexts/AuthContext';
import { useSubscription } from '@/contexts/SubscriptionContext';

const FeatureValue = ({ value }: { value: string | boolean }) => {
  if (value === true) return <Icon name="CheckIcon" size={18} className="text-green-500" />;
  if (value === false) return <Icon name="XMarkIcon" size={18} className="text-muted-foreground/40" />;
  return <span className="text-sm text-foreground">{value}</span>;
};

type BillingCycle = 'monthly' | 'annual';

interface PlanFeature {
  name: string;
  free: string | boolean;
  pro: string | boolean;
  enterprise: string | boolean;
  category: string;
}

export default function PricingInteractive() {
  const { user } = useAuth();
  const { subscription } = useSubscription();
  const isCurrentPlan = (planId: string) => !!user && subscription.tier === planId;

  const [billing, setBilling] = useState<BillingCycle>('monthly');
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());
  const [plans, setPlans] = useState<any[]>([]);
  const [features, setFeatures] = useState<PlanFeature[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPricing();
  }, []);

  const loadPricing = async () => {
    const [plansData, featuresData] = await Promise.all([
      ContentService.getPricingPlans(),
      ContentService.getPricingFeatures()
    ]);
    
    setPlans(plansData.map((p: any) => ({
      ...p,
      id: p.plan_id,
      monthlyPrice: p.monthly_price,
      annualPrice: p.annual_price,
      badgeColor: p.badge_color,
      ctaStyle: p.cta_style,
      iconBg: p.icon_bg,
      iconColor: p.icon_color
    })));
    
    setFeatures(featuresData.map((f: any) => ({
      name: f.name,
      category: f.category,
      free: f.free_value === 'true' ? true : f.free_value === 'false' ? false : f.free_value,
      pro: f.pro_value === 'true' ? true : f.pro_value === 'false' ? false : f.pro_value,
      enterprise: f.enterprise_value === 'true' ? true : f.enterprise_value === 'false' ? false : f.enterprise_value
    })));
    
    setLoading(false);
  };

  const categories = Array.from(new Set(features.map(f => f.category)));

  const toggleCategory = (category: string) => {
    setExpandedCategories(prev => {
      const next = new Set(prev);
      if (next.has(category)) {
        next.delete(category);
      } else {
        next.add(category);
      }
      return next;
    });
  };

  const getPrice = (plan: any) => {
    return billing === 'annual' ? plan.annualPrice : plan.monthlyPrice;
  };

  if (loading) {
    return (
      <div className="animate-pulse space-y-10">
        <div className="h-12 bg-surface rounded w-1/4 mx-auto"></div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map(i => <div key={i} className="h-96 bg-surface rounded-xl"></div>)}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-10">
      {/* Billing Toggle */}
      <div className="flex items-center justify-center">
        <div className="flex items-center bg-surface rounded-lg p-1 border border-border">
          <button
            onClick={() => setBilling('monthly')}
            className={`px-5 py-2 text-sm font-medium rounded-md transition-all duration-200 ${
              billing === 'monthly' ?'bg-card text-foreground shadow-sm' :'text-muted-foreground hover:text-foreground'
            }`}
          >
            Monthly
          </button>
          <button
            onClick={() => setBilling('annual')}
            className={`px-5 py-2 text-sm font-medium rounded-md transition-all duration-200 flex items-center space-x-2 ${
              billing === 'annual' ?'bg-card text-foreground shadow-sm' :'text-muted-foreground hover:text-foreground'
            }`}
          >
            <span>Annual</span>
            <span className="text-xs font-semibold text-success bg-success/10 px-1.5 py-0.5 rounded">Save 20%</span>
          </button>
        </div>
      </div>

      {/* Plan Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {plans.map((plan) => (
        <div
            key={plan.id}
            className={`relative rounded-xl border p-6 flex flex-col ${
              isCurrentPlan(plan.id)
                ? 'border-success shadow-lg ring-2 ring-success/30 bg-card'
                : plan.highlight
                ? 'border-brand-primary shadow-lg ring-2 ring-brand-primary/20 bg-card'
                : 'border-border bg-card shadow-md'
            }`}
          >
            {plan.badge && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold ${plan.badgeColor}`}>
                  {plan.badge}
                </span>
              </div>
            )}
            {isCurrentPlan(plan.id) && (
              <div className="absolute -top-3 right-4">
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-success text-white">
                  <Icon name="CheckCircleIcon" size={12} variant="solid" /> Current Plan
                </span>
              </div>
            )}

            <div className="mb-5">
              <div className={`inline-flex items-center justify-center w-12 h-12 rounded-xl mb-4 ${plan.iconBg}`}>
                <Icon name={plan.icon as any} size={24} className={plan.iconColor} variant="solid" />
              </div>
              <h3 className="text-xl font-headline font-bold text-foreground">{plan.name}</h3>
              <p className="text-sm text-muted-foreground mt-1">{plan.description}</p>
            </div>

            <div className="mb-6">
              {plan.monthlyPrice === 0 ? (
                <div className="flex items-end space-x-1">
                  <span className="text-4xl font-headline font-bold text-foreground">Free</span>
                </div>
              ) : (
                <div className="flex items-end space-x-1">
                  <span className="text-4xl font-headline font-bold text-foreground">${getPrice(plan)}</span>
                  <span className="text-muted-foreground text-sm mb-1">/mo</span>
                </div>
              )}
              {billing === 'annual' && plan.monthlyPrice > 0 && (
                <p className="text-xs text-muted-foreground mt-1">
                  Billed annually (${getPrice(plan) * 12}/yr)
                </p>
              )}
            </div>

            <div className="space-y-2.5 mb-6 flex-1">
              {features.filter(f => f.category === 'Scanning').slice(0, 4).map(feature => {
                const val = feature[plan.id as keyof PlanFeature] as string | boolean;
                return (
                  <div key={feature.name} className="flex items-center space-x-2.5">
                    {val === false ? (
                      <Icon name="MinusIcon" size={16} className="text-muted-foreground/40 flex-shrink-0" />
                    ) : (
                      <Icon name="CheckCircleIcon" size={16} className="text-success flex-shrink-0" variant="solid" />
                    )}
                    <span className={`text-sm ${
                      val === false ? 'text-muted-foreground/60 line-through' : 'text-foreground'
                    }`}>
                      {typeof val === 'string' ? `${val} — ` : ''}{feature.name}
                    </span>
                  </div>
                );
              })}
            </div>

            {isCurrentPlan(plan.id) ? (
              <Link
                href="/personal-dashboard"
                className="w-full text-center px-5 py-3 rounded-md text-sm font-semibold transition-all duration-200 block bg-success/10 border border-success/30 text-success hover:bg-success/20"
              >
                ✓ Current Plan — Go to Dashboard
              </Link>
            ) : (
              <Link
                href={plan.id === 'enterprise' ? '/api-documentation' : user ? '/personal-dashboard' : '/login'}
                className={`w-full text-center px-5 py-3 rounded-md text-sm font-semibold transition-all duration-200 block ${
                  plan.ctaStyle
                }`}
              >
                {plan.cta}
              </Link>
            )}
          </div>
        ))}
      </div>

      {/* Feature Comparison Table */}
      <div className="bg-card rounded-xl border border-border shadow-md overflow-hidden">
        <div className="px-6 py-5 border-b border-border">
          <h2 className="text-xl font-headline font-bold text-foreground">Full Feature Comparison</h2>
          <p className="text-sm text-muted-foreground mt-1">Click a category to expand. See everything included in each plan.</p>
        </div>

        {/* Table Header */}
        <div className="grid grid-cols-4 bg-surface border-b border-border">
          <div className="px-6 py-4 text-sm font-semibold text-muted-foreground">Feature</div>
          {plans.map(plan => (
            <div key={plan.id} className={`px-4 py-4 text-center ${
              plan.highlight ? 'bg-brand-primary/5' : ''
            }`}>
              <span className={`text-sm font-bold ${
                plan.id === 'pro' ? 'text-brand-primary' :
                plan.id === 'enterprise'? 'text-purple-600' : 'text-foreground'
              }`}>{plan.name}</span>
            </div>
          ))}
        </div>

        {/* Feature Rows by Category */}
        {categories.map((category) => {
          const isExpanded = expandedCategories.has(category);
          return (
            <div key={category}>
              <button
                onClick={() => toggleCategory(category)}
                className="w-full grid grid-cols-4 bg-surface/60 border-b border-border hover:bg-surface transition-colors"
              >
                <div className="col-span-4 px-6 py-3 flex items-center justify-between">
                  <span className="text-sm font-semibold text-foreground">{category}</span>
                  <Icon
                    name={isExpanded ? 'ChevronUpIcon' : 'ChevronDownIcon'}
                    size={16}
                    className="text-muted-foreground"
                  />
                </div>
              </button>

              {isExpanded && (
                features.filter(f => f.category === category).map((feature, idx) => (
                  <div
                    key={feature.name}
                    className={`grid grid-cols-4 border-b border-border/50 hover:bg-surface/30 transition-colors ${
                      idx % 2 === 0 ? '' : 'bg-surface/20'
                    }`}
                  >
                    <div className="px-6 py-3.5 text-sm text-foreground">{feature.name}</div>
                    {plans.map(plan => (
                      <div key={plan.id} className={`px-4 py-3.5 text-center flex items-center justify-center ${
                        plan.highlight ? 'bg-brand-primary/5' : ''
                      }`}>
                        <FeatureValue value={feature[plan.id as keyof PlanFeature] as string | boolean} />
                      </div>
                    ))}
                  </div>
                ))
              )}
            </div>
          );
        })}

        {/* Expand All hint */}
        <div className="px-6 py-4 bg-surface/30 border-t border-border">
          <button
            onClick={() => {
              if (expandedCategories.size === categories.length) {
                setExpandedCategories(new Set());
              } else {
                setExpandedCategories(new Set(categories));
              }
            }}
            className="text-sm text-brand-primary hover:text-brand-primary/80 font-medium transition-colors"
          >
            {expandedCategories.size === categories.length ? 'Collapse all categories' : 'Expand all categories'}
          </button>
        </div>
      </div>

      {/* CTA Bottom */}
      <div className="text-center bg-gradient-to-r from-brand-primary/10 to-brand-secondary/10 rounded-xl border border-brand-primary/20 p-8">
        {user ? (
          <>
            <h3 className="text-xl font-headline font-bold text-foreground mb-2">
              You&apos;re on the <span className="capitalize text-brand-primary">{subscription.tier}</span> plan
            </h3>
            <p className="text-sm text-muted-foreground mb-5">
              {subscription.tier === 'enterprise'
                ? 'You have full access to all PhishGuard features.'
                : subscription.tier === 'pro'
                ? 'Upgrade to Enterprise for unlimited team access and integrations.'
                : 'Upgrade to Pro for more scans, analytics & priority support.'}
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              <Link
                href="/personal-dashboard"
                className="inline-flex items-center space-x-2 px-6 py-3 bg-brand-primary hover:bg-brand-primary/90 text-white text-sm font-semibold rounded-md transition-all duration-200 shadow-sm hover:shadow-md"
              >
                <Icon name="ChartBarIcon" size={16} />
                <span>Go to Dashboard</span>
              </Link>
              {subscription.tier !== 'enterprise' && (
                <Link
                  href="/api-documentation"
                  className="inline-flex items-center space-x-2 px-6 py-3 border border-border text-sm font-medium text-foreground hover:bg-surface rounded-md transition-colors"
                >
                  <Icon name="CodeBracketIcon" size={16} />
                  <span>Contact Sales</span>
                </Link>
              )}
            </div>
          </>
        ) : (
          <>
            <h3 className="text-xl font-headline font-bold text-foreground mb-2">Not sure which plan is right for you?</h3>
            <p className="text-sm text-muted-foreground mb-5">Start with our free plan and upgrade anytime. No credit card required.</p>
            <div className="flex flex-wrap justify-center gap-3">
              <Link
                href="/login"
                className="inline-flex items-center space-x-2 px-6 py-3 bg-brand-primary hover:bg-brand-primary/90 text-white text-sm font-semibold rounded-md transition-all duration-200 shadow-sm hover:shadow-md"
              >
                <Icon name="ShieldCheckIcon" size={16} variant="solid" />
                <span>Start Free Today</span>
              </Link>
              <Link
                href="/api-documentation"
                className="inline-flex items-center space-x-2 px-6 py-3 border border-border text-sm font-medium text-foreground hover:bg-surface rounded-md transition-colors"
              >
                <Icon name="CodeBracketIcon" size={16} />
                <span>View API Docs</span>
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
