'use client';

import { useState } from 'react';
import Icon from '@/components/ui/AppIcon';
import QuickStartCard from './QuickStartCard';
import EndpointCard from './EndpointCard';
import CodeExample from './CodeExample';
import SDKCard from './SDKCard';
import PricingTierCard from './PricingTierCard';
import AuthenticationGuide from './AuthenticationGuide';
import WebhookConfig from './WebhookConfig';
import RateLimitInfo from './RateLimitInfo';
import ErrorCodeTable from './ErrorCodeTable';

interface APIInteractiveProps {
  quickStartGuides: Array<{
    title: string;
    description: string;
    icon: string;
    steps: string[];
  }>;
  endpoints: Array<{
    method: 'GET' | 'POST' | 'PUT' | 'DELETE';
    endpoint: string;
    description: string;
    parameters?: Array<{
      name: string;
      type: string;
      required: boolean;
      description: string;
    }>;
  }>;
  codeExamples: Array<{
    title: string;
    language: string;
    code: string;
  }>;
  sdks: Array<{
    name: string;
    language: string;
    description: string;
    icon: string;
    version: string;
    installCommand: string;
  }>;
  pricingTiers: Array<{
    name: string;
    price: string;
    description: string;
    features: string[];
    requestLimit: string;
    isPopular?: boolean;
  }>;
  authSteps: Array<{
    title: string;
    description: string;
    code?: string;
  }>;
  webhookEvents: Array<{
    name: string;
    description: string;
    payload: string;
  }>;
  rateLimitTiers: Array<{
    tier: string;
    requestsPerMinute: number;
    requestsPerDay: number;
    burstLimit: number;
  }>;
  errorCodes: Array<{
    code: number;
    name: string;
    description: string;
    solution: string;
  }>;
}

export default function APIInteractive({
  quickStartGuides,
  endpoints,
  codeExamples,
  sdks,
  pricingTiers,
  authSteps,
  webhookEvents,
  rateLimitTiers,
  errorCodes,
}: APIInteractiveProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'endpoints' | 'sdks' | 'pricing' | 'advanced'>('overview');
  const [selectedLanguage, setSelectedLanguage] = useState('javascript');

  const tabs = [
    { id: 'overview', label: 'Quick Start', icon: 'RocketLaunchIcon' },
    { id: 'endpoints', label: 'API Reference', icon: 'CommandLineIcon' },
    { id: 'sdks', label: 'SDKs & Libraries', icon: 'CubeIcon' },
    { id: 'pricing', label: 'Pricing & Limits', icon: 'CurrencyDollarIcon' },
    { id: 'advanced', label: 'Advanced', icon: 'Cog6ToothIcon' },
  ];

  const languages = ['javascript', 'python', 'php', 'ruby', 'java'];

  const filteredCodeExamples = codeExamples.filter(
    (example) => example.language.toLowerCase() === selectedLanguage
  );

  return (
    <div className="space-y-8">
      {/* Tab Navigation */}
      <div className="bg-card border border-border rounded-lg p-2">
        <div className="flex flex-wrap gap-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center space-x-2 px-4 py-2.5 rounded-md font-medium text-sm transition-all ${
                activeTab === tab.id
                  ? 'bg-brand-primary text-white shadow-sm'
                  : 'text-muted-foreground hover:text-foreground hover:bg-surface'
              }`}
            >
              <Icon name={tab.icon as any} size={18} />
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="space-y-8">
          {/* Quick Start Guides */}
          <div>
            <h2 className="text-2xl font-headline font-bold text-primary mb-6">Quick Start Guides</h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {quickStartGuides.map((guide, index) => (
                <QuickStartCard key={index} {...guide} />
              ))}
            </div>
          </div>

          {/* Authentication */}
          <div>
            <h2 className="text-2xl font-headline font-bold text-primary mb-6">Authentication</h2>
            <AuthenticationGuide steps={authSteps} />
          </div>

          {/* Code Examples */}
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-headline font-bold text-primary">Code Examples</h2>
              <div className="flex items-center space-x-2">
                {languages.map((lang) => (
                  <button
                    key={lang}
                    onClick={() => setSelectedLanguage(lang)}
                    className={`px-3 py-1.5 rounded-md text-sm font-medium capitalize transition-colors ${
                      selectedLanguage === lang
                        ? 'bg-brand-primary text-white' :'bg-surface text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    {lang}
                  </button>
                ))}
              </div>
            </div>
            <div className="space-y-4">
              {filteredCodeExamples.map((example, index) => (
                <CodeExample key={index} {...example} />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Endpoints Tab */}
      {activeTab === 'endpoints' && (
        <div className="space-y-8">
          <div>
            <h2 className="text-2xl font-headline font-bold text-primary mb-2">API Endpoints</h2>
            <p className="text-muted-foreground mb-6">
              Complete reference for all PhishGuard API endpoints with parameters and response formats.
            </p>
            <div className="space-y-4">
              {endpoints.map((endpoint, index) => (
                <EndpointCard key={index} {...endpoint} />
              ))}
            </div>
          </div>

          <ErrorCodeTable errors={errorCodes} />
        </div>
      )}

      {/* SDKs Tab */}
      {activeTab === 'sdks' && (
        <div className="space-y-8">
          <div>
            <h2 className="text-2xl font-headline font-bold text-primary mb-2">Official SDKs</h2>
            <p className="text-muted-foreground mb-6">
              Pre-built libraries for seamless integration with your favorite programming languages.
            </p>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {sdks.map((sdk, index) => (
                <SDKCard key={index} {...sdk} />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Pricing Tab */}
      {activeTab === 'pricing' && (
        <div className="space-y-8">
          <div>
            <h2 className="text-2xl font-headline font-bold text-primary mb-2">API Pricing Tiers</h2>
            <p className="text-muted-foreground mb-6">
              Choose the plan that fits your integration needs and scale as you grow.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {pricingTiers.map((tier, index) => (
                <PricingTierCard key={index} {...tier} />
              ))}
            </div>
          </div>

          <RateLimitInfo tiers={rateLimitTiers} />
        </div>
      )}

      {/* Advanced Tab */}
      {activeTab === 'advanced' && (
        <div className="space-y-8">
          <WebhookConfig events={webhookEvents} />

          <div className="bg-card border border-border rounded-lg p-6">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-10 h-10 bg-gradient-to-br from-brand-trust to-cyan-600 rounded-lg flex items-center justify-center">
                <Icon name="ShieldCheckIcon" size={20} className="text-white" variant="solid" />
              </div>
              <div>
                <h3 className="text-xl font-headline font-bold text-primary">Security Best Practices</h3>
                <p className="text-sm text-muted-foreground">Recommendations for secure API integration</p>
              </div>
            </div>

            <ul className="space-y-3">
              {[
                'Always use HTTPS for API requests to ensure encrypted communication',
                'Store API keys securely using environment variables or secret management systems',
                'Implement request signing for additional security layer',
                'Rotate API keys regularly and immediately if compromised',
                'Use IP whitelisting for production environments when possible',
                'Monitor API usage patterns to detect unusual activity',
                'Implement proper error handling to avoid exposing sensitive information',
              ].map((practice, index) => (
                <li key={index} className="flex items-start space-x-3">
                  <Icon name="CheckCircleIcon" size={20} className="text-success flex-shrink-0 mt-0.5" variant="solid" />
                  <span className="text-sm text-foreground">{practice}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}