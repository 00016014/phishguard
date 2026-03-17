import type { Metadata } from 'next';
import Header from '@/components/common/Header';
import Icon from '@/components/ui/AppIcon';
import APIInteractive from './components/APIInteractive';

export const metadata: Metadata = {
  title: 'API Documentation - PhishGuard',
  description: 'Comprehensive developer resources for integrating PhishGuard AI-powered threat detection capabilities into your applications with real-time scanning, webhooks, and machine learning APIs.',
};

export default function APIDocumentationPage() {
  const quickStartGuides = [
    {
      title: 'Email Scanning Integration',
      description: 'Integrate real-time email threat detection into your email client or security gateway',
      icon: 'EnvelopeIcon',
      steps: [
        'Obtain your API key from the developer dashboard',
        'Install the PhishGuard SDK for your platform',
        'Configure webhook endpoints for scan results',
        'Implement email content submission to scan endpoint',
        'Handle threat detection responses and user notifications',
      ],
    },
    {
      title: 'Web Application Protection',
      description: 'Add URL and link scanning to protect users from malicious websites',
      icon: 'GlobeAltIcon',
      steps: [
        'Set up authentication with your API credentials',
        'Integrate URL scanning before link redirects',
        'Implement real-time threat warnings for users',
        'Configure custom threat response actions',
        'Monitor scanning analytics through dashboard',
      ],
    },
    {
      title: 'Mobile App Security',
      description: 'Protect mobile users with on-device and cloud-based threat detection',
      icon: 'DevicePhoneMobileIcon',
      steps: [
        'Add PhishGuard mobile SDK to your project',
        'Initialize SDK with API key and configuration',
        'Implement content scanning for messages and links',
        'Handle offline detection with cached threat database',
        'Sync threat intelligence updates automatically',
      ],
    },
    {
      title: 'Custom Threat Detection',
      description: 'Build specialized phishing detection for industry-specific threats',
      icon: 'AdjustmentsHorizontalIcon',
      steps: [
        'Access advanced API endpoints for custom models',
        'Train detection models with your threat data',
        'Deploy custom detection rules and patterns',
        'Integrate with existing security infrastructure',
        'Monitor and refine detection accuracy over time',
      ],
    },
  ];

  const endpoints = [
    {
      method: 'POST' as const,
      endpoint: '/api/v1/scan/email',
      description: 'Scan email content for phishing threats with detailed analysis and confidence scoring',
      parameters: [
        { name: 'content', type: 'string', required: true, description: 'Email body content (HTML or plain text)' },
        { name: 'subject', type: 'string', required: true, description: 'Email subject line' },
        { name: 'sender', type: 'string', required: true, description: 'Sender email address' },
        { name: 'headers', type: 'object', required: false, description: 'Email headers for advanced analysis' },
      ],
    },
    {
      method: 'POST' as const,
      endpoint: '/api/v1/scan/url',
      description: 'Analyze URLs for malicious content, redirects, and known phishing domains',
      parameters: [
        { name: 'url', type: 'string', required: true, description: 'Full URL to scan' },
        { name: 'context', type: 'string', required: false, description: 'Context where URL was found' },
      ],
    },
    {
      method: 'GET' as const,
      endpoint: '/api/v1/threats/database',
      description: 'Query the threat intelligence database for known phishing campaigns',
      parameters: [
        { name: 'query', type: 'string', required: true, description: 'Search query (domain, email, or hash)' },
        { name: 'limit', type: 'number', required: false, description: 'Maximum results to return (default: 50)' },
        { name: 'offset', type: 'number', required: false, description: 'Pagination offset' },
      ],
    },
    {
      method: 'POST' as const,
      endpoint: '/api/v1/threats/report',
      description: 'Submit new phishing threats to the community database',
      parameters: [
        { name: 'type', type: 'string', required: true, description: 'Threat type (email, url, domain)' },
        { name: 'content', type: 'string', required: true, description: 'Threat content or URL' },
        { name: 'evidence', type: 'array', required: false, description: 'Supporting evidence files' },
      ],
    },
    {
      method: 'GET' as const,
      endpoint: '/api/v1/scan/history',
      description: 'Retrieve scan history and results for your account',
      parameters: [
        { name: 'start_date', type: 'string', required: false, description: 'Filter by start date (ISO 8601)' },
        { name: 'end_date', type: 'string', required: false, description: 'Filter by end date (ISO 8601)' },
        { name: 'threat_level', type: 'string', required: false, description: 'Filter by threat level (low, medium, high, critical)' },
      ],
    },
    {
      method: 'PUT' as const,
      endpoint: '/api/v1/settings/webhooks',
      description: 'Configure webhook endpoints for real-time threat notifications',
      parameters: [
        { name: 'url', type: 'string', required: true, description: 'Webhook endpoint URL' },
        { name: 'events', type: 'array', required: true, description: 'Events to subscribe to' },
        { name: 'secret', type: 'string', required: false, description: 'Webhook signing secret' },
      ],
    },
  ];

  const codeExamples = [
    {
      title: 'Email Scan Request',
      language: 'javascript',
      code: `const PhishGuard = require('@phishguard/sdk');

const client = new PhishGuard({
  apiKey: process.env.PHISHGUARD_API_KEY
});

async function scanEmail(emailData) {
  try {
    const result = await client.scan.email({
      content: emailData.body,
      subject: emailData.subject,
      sender: emailData.from,
      headers: emailData.headers
    });
    
    if (result.threatLevel === 'high' || result.threatLevel === 'critical') {
      console.log('⚠️ Phishing threat detected!');
      console.log('Confidence:', result.confidence);
      console.log('Indicators:', result.indicators);
    }
    
    return result;
  } catch (error) {
    console.error('Scan failed:', error.message);
  }
}`,
    },
    {
      title: 'URL Scanning with Webhooks',
      language: 'javascript',
      code: `const express = require('express');
const PhishGuard = require('@phishguard/sdk');

const app = express();
const client = new PhishGuard({ apiKey: process.env.PHISHGUARD_API_KEY });

// Scan URL endpoint
app.post('/scan-url', async (req, res) => {
  const { url } = req.body;
  
  const result = await client.scan.url({
    url: url,
    context: 'user_submission'
  });
  
  res.json(result);
});

// Webhook receiver
app.post('/webhooks/phishguard', (req, res) => {
  const signature = req.headers['x-phishguard-signature'];
  
  if (client.webhooks.verify(req.body, signature)) {
    const event = req.body;
    
    if (event.type === 'threat.detected') {
      // Handle threat detection
      notifySecurityTeam(event.data);
    }
  }
  
  res.sendStatus(200);
});`,
    },
    {
      title: 'Email Scan Request',
      language: 'python',
      code: `from phishguard import PhishGuardClient

client = PhishGuardClient(api_key=os.environ['PHISHGUARD_API_KEY'])

def scan_email(email_data):
    try:
        result = client.scan.email(
            content=email_data['body'],
            subject=email_data['subject'],
            sender=email_data['from'],
            headers=email_data.get('headers')
        )
        
        if result.threat_level in ['high', 'critical']:
            print(f"⚠️ Phishing threat detected!")
            print(f"Confidence: {result.confidence}")
            print(f"Indicators: {result.indicators}")
        
        return result
    except Exception as e:
        print(f"Scan failed: {str(e)}")`,
    },
    {
      title: 'Threat Database Query',
      language: 'python',
      code: `from phishguard import PhishGuardClient

client = PhishGuardClient(api_key=os.environ['PHISHGUARD_API_KEY'])

# Search for known threats
threats = client.threats.search(
    query='suspicious-domain.com',
    limit=10
)

for threat in threats:
    print(f"Threat ID: {threat.id}")
    print(f"Type: {threat.type}")
    print(f"First Seen: {threat.first_seen}")
    print(f"Confidence: {threat.confidence}")
    print("---")`,
    },
    {
      title: 'Email Scan Request',
      language: 'php',
      code: `<?php
require 'vendor/autoload.php';

use PhishGuard\\Client;

$client = new Client([
    'api_key' => getenv('PHISHGUARD_API_KEY')
]);

function scanEmail($emailData) {
    try {
        $result = $client->scan->email([
            'content' => $emailData['body'],
            'subject' => $emailData['subject'],
            'sender' => $emailData['from'],
            'headers' => $emailData['headers'] ?? null
        ]);
        
        if (in_array($result->threatLevel, ['high', 'critical'])) {
            echo "⚠️ Phishing threat detected!\\n";
            echo "Confidence: {$result->confidence}\\n";
        }
        
        return $result;
    } catch (Exception $e) {
        echo "Scan failed: {$e->getMessage()}\\n";
    }
}`,
    },
    {
      title: 'Webhook Configuration',
      language: 'php',
      code: `<?php
require 'vendor/autoload.php';

use PhishGuard\\Client;

$client = new Client(['api_key' => getenv('PHISHGUARD_API_KEY')]);

// Configure webhook
$webhook = $client->webhooks->create([
    'url' => 'https://your-domain.com/webhooks/phishguard',
    'events' => ['threat.detected', 'scan.completed'],
    'secret' => bin2hex(random_bytes(32))
]);

// Webhook receiver
$payload = file_get_contents('php://input');
$signature = $_SERVER['HTTP_X_PHISHGUARD_SIGNATURE'];

if ($client->webhooks->verify($payload, $signature)) {
    $event = json_decode($payload);
    
    if ($event->type === 'threat.detected') {
        // Handle threat detection
        notifySecurityTeam($event->data);
    }
}`,
    },
    {
      title: 'Email Scan Request',
      language: 'ruby',
      code: `require 'phishguard'

client = PhishGuard::Client.new(
  api_key: ENV['PHISHGUARD_API_KEY']
)

def scan_email(email_data)
  begin
    result = client.scan.email(
      content: email_data[:body],
      subject: email_data[:subject],
      sender: email_data[:from],
      headers: email_data[:headers]
    )
    
    if ['high', 'critical'].include?(result.threat_level)
      puts "⚠️ Phishing threat detected!" puts"Confidence: #{result.confidence}" puts"Indicators: #{result.indicators}"
    end
    
    result
  rescue => e
    puts "Scan failed: #{e.message}"
  end
end`,
    },
    {
      title: 'Batch URL Scanning',
      language: 'ruby',
      code: `require 'phishguard'

client = PhishGuard::Client.new(api_key: ENV['PHISHGUARD_API_KEY'])

urls = [
  'https://suspicious-site1.com',
  'https://suspicious-site2.com',
  'https://suspicious-site3.com'
]

# Batch scan URLs
results = client.scan.batch_urls(urls)

results.each do |result|
  puts "URL: #{result.url}"
  puts "Threat Level: #{result.threat_level}" puts"Safe: #{result.is_safe}" puts"---"
end`,
    },
    {
      title: 'Email Scan Request',
      language: 'java',
      code: `import com.phishguard.PhishGuardClient;
import com.phishguard.models.ScanResult;

public class EmailScanner {
    private PhishGuardClient client;
    
    public EmailScanner() {
        this.client = new PhishGuardClient.Builder()
            .apiKey(System.getenv("PHISHGUARD_API_KEY"))
            .build();
    }
    
    public ScanResult scanEmail(EmailData emailData) {
        try {
            ScanResult result = client.scan()
                .email()
                .content(emailData.getBody())
                .subject(emailData.getSubject())
                .sender(emailData.getFrom())
                .headers(emailData.getHeaders())
                .execute();
            
            if (result.getThreatLevel().isHighOrCritical()) {
                System.out.println("⚠️ Phishing threat detected!");
                System.out.println("Confidence: " + result.getConfidence());
            }
            
            return result;
        } catch (Exception e) {
            System.err.println("Scan failed: " + e.getMessage());
            return null;
        }
    }
}`,
    },
    {
      title: 'Real-time Threat Monitoring',
      language: 'java',
      code: `import com.phishguard.PhishGuardClient;
import com.phishguard.webhooks.WebhookHandler;

public class ThreatMonitor {
    private PhishGuardClient client;
    
    public ThreatMonitor() {
        this.client = new PhishGuardClient.Builder()
            .apiKey(System.getenv("PHISHGUARD_API_KEY"))
            .build();
    }
    
    public void setupWebhook() {
        WebhookHandler handler = new WebhookHandler(client);
        
        handler.on("threat.detected", event -> {
            System.out.println("New threat detected!");
            System.out.println("Type: " + event.getData().getType());
            System.out.println("Severity: " + event.getData().getSeverity());
            
            // Notify security team
            notifySecurityTeam(event.getData());
        });
        
        handler.listen(8080);
    }
}`,
    },
  ];

  const sdks = [
    {
      name: 'JavaScript SDK',
      language: 'javascript',
      description: 'Official Node.js and browser SDK with TypeScript support and promise-based API',
      icon: 'CodeBracketIcon',
      version: 'v2.4.1',
      installCommand: 'npm install @phishguard/sdk',
    },
    {
      name: 'Python SDK',
      language: 'python',
      description: 'Pythonic API client with async support and comprehensive type hints',
      icon: 'CommandLineIcon',
      version: 'v1.8.3',
      installCommand: 'pip install phishguard',
    },
    {
      name: 'PHP SDK',
      language: 'php',
      description: 'Modern PHP library with PSR-4 autoloading and Composer integration',
      icon: 'CodeBracketSquareIcon',
      version: 'v1.5.2',
      installCommand: 'composer require phishguard/sdk',
    },
    {
      name: 'Ruby SDK',
      language: 'ruby',
      description: 'Elegant Ruby gem with Rails integration and ActiveRecord support',
      icon: 'CubeIcon',
      version: 'v1.3.7',
      installCommand: 'gem install phishguard',
    },
    {
      name: 'Java SDK',
      language: 'java',
      description: 'Enterprise-grade Java library with Spring Boot starter and Maven support',
      icon: 'CubeTransparentIcon',
      version: 'v2.1.0',
      installCommand: 'implementation "com.phishguard:sdk:2.1.0"',
    },
    {
      name: 'Go SDK',
      language: 'go',
      description: 'Lightweight Go package with context support and concurrent scanning',
      icon: 'BoltIcon',
      version: 'v1.2.4',
      installCommand: 'go get github.com/phishguard/go-sdk',
    },
  ];

  const pricingTiers = [
    {
      name: 'Developer',
      price: 'Free',
      description: 'Perfect for testing and small projects',
      requestLimit: '1,000/month',
      features: [
        'Email and URL scanning',
        'Basic threat intelligence access',
        'Community support',
        'Standard API response times',
        '7-day scan history',
      ],
    },
    {
      name: 'Professional',
      price: '$99',
      description: 'For growing businesses and applications',
      requestLimit: '50,000/month',
      isPopular: true,
      features: [
        'All Developer features',
        'Advanced threat detection',
        'Webhook notifications',
        'Priority API response times',
        '90-day scan history',
        'Email support (24hr response)',
        'Custom detection rules',
      ],
    },
    {
      name: 'Enterprise',
      price: 'Custom',
      description: 'For large-scale deployments',
      requestLimit: 'Unlimited',
      features: [
        'All Professional features',
        'Dedicated infrastructure',
        'SLA guarantees (99.9% uptime)',
        'White-label options',
        'Unlimited scan history',
        'Priority phone support',
        'Custom ML model training',
        'Compliance certifications',
      ],
    },
  ];

  const authSteps = [
    {
      title: 'Generate API Key',
      description: 'Create a new API key from your PhishGuard dashboard under Settings > API Keys. Each key can be scoped to specific permissions.',
      code: 'Dashboard > Settings > API Keys > Generate New Key',
    },
    {
      title: 'Include in Request Headers',
      description: 'Add your API key to the Authorization header using Bearer token authentication for all API requests.',
      code: 'Authorization: Bearer YOUR_API_KEY_HERE',
    },
    {
      title: 'Verify Authentication',
      description: 'Test your API key by making a request to the authentication verification endpoint to ensure proper setup.',
      code: 'GET https://api.phishguard.com/v1/auth/verify',
    },
    {
      title: 'Secure Key Storage',
      description: 'Store API keys securely using environment variables or secret management systems. Never commit keys to version control.',
    },
  ];

  const webhookEvents = [
    {
      name: 'threat.detected',
      description: 'Triggered when a high or critical threat is detected during scanning',
      payload: '{ "event": "threat.detected", "data": { "scan_id": "...", "threat_level": "high", "indicators": [...] } }',
    },
    {
      name: 'scan.completed',
      description: 'Fired when any scan operation completes successfully',
      payload: '{ "event": "scan.completed", "data": { "scan_id": "...", "result": "safe", "timestamp": "..." } }',
    },
    {
      name: 'threat.reported',
      description: 'Notifies when a new threat is reported to the community database',
      payload: '{ "event": "threat.reported", "data": { "threat_id": "...", "type": "email", "reporter": "..." } }',
    },
    {
      name: 'quota.warning',
      description: 'Alerts when API usage reaches 80% of monthly quota',
      payload: '{ "event": "quota.warning", "data": { "current_usage": 40000, "limit": 50000, "percentage": 80 } }',
    },
  ];

  const rateLimitTiers = [
    { tier: 'Developer', requestsPerMinute: 10, requestsPerDay: 1000, burstLimit: 20 },
    { tier: 'Professional', requestsPerMinute: 100, requestsPerDay: 50000, burstLimit: 200 },
    { tier: 'Enterprise', requestsPerMinute: 1000, requestsPerDay: 999999, burstLimit: 2000 },
  ];

  const errorCodes = [
    {
      code: 400,
      name: 'Bad Request',
      description: 'The request was malformed or missing required parameters',
      solution: 'Verify all required parameters are included and properly formatted according to the API documentation',
    },
    {
      code: 401,
      name: 'Unauthorized',
      description: 'Authentication failed or API key is invalid',
      solution: 'Check that your API key is correct and included in the Authorization header as a Bearer token',
    },
    {
      code: 403,
      name: 'Forbidden',
      description: 'API key lacks permission for the requested resource',
      solution: 'Verify your API key has the necessary scopes enabled in your dashboard settings',
    },
    {
      code: 429,
      name: 'Rate Limit Exceeded',
      description: 'Too many requests sent in a given time period',
      solution: 'Implement exponential backoff and respect the X-RateLimit-Reset header for retry timing',
    },
    {
      code: 500,
      name: 'Internal Server Error',
      description: 'An unexpected error occurred on the PhishGuard servers',
      solution: 'Retry the request after a brief delay. Contact support if the issue persists',
    },
    {
      code: 503,
      name: 'Service Unavailable',
      description: 'PhishGuard API is temporarily unavailable due to maintenance',
      solution: 'Check the status page at status.phishguard.com and retry after the maintenance window',
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="pt-16">
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-primary via-secondary to-brand-primary text-white py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-8">
            <div className="bg-yellow-500/20 border border-yellow-500/20 rounded-lg p-4 flex items-start space-x-3">
              <Icon name="ExclamationTriangleIcon" size={20} className="text-yellow-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm text-white font-semibold">Under Development</p>
                <p className="text-sm text-white/90 dark:text-yellow-300 mt-1">
                  This documentation page is currently being developed and updated. Features and content may change. We appreciate your patience!
                </p>
              </div>
            </div>
          </div>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-12 h-12 bg-white/10 backdrop-blur-sm rounded-lg flex items-center justify-center">
                  <Icon name="CodeBracketSquareIcon" size={28} className="text-white" variant="solid" />
                </div>
                <span className="text-brand-accent font-semibold text-lg">Developer Resources</span>
              </div>
              <h1 className="text-5xl font-headline font-bold mb-6">
                PhishGuard API Documentation
              </h1>
              <p className="text-xl text-white/90 mb-8 leading-relaxed">
                Integrate AI-powered phishing detection into your applications with our comprehensive REST API, 
                WebSocket connections for real-time threats, and official SDKs for all major programming languages.
              </p>
              <div className="flex flex-wrap gap-4">
                <button className="px-6 py-3 bg-brand-accent text-white font-cta font-semibold rounded-md hover:bg-brand-accent/90 transition-colors shadow-lg">
                  Get API Key
                </button>
                <button className="px-6 py-3 bg-white/10 backdrop-blur-sm text-white font-cta font-semibold rounded-md hover:bg-white/20 transition-colors border border-white/20">
                  View Live Demo
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-12 bg-card border-b border-border">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {[
                { label: 'API Uptime', value: '99.9%', icon: 'CheckBadgeIcon' },
                { label: 'Avg Response Time', value: '< 200ms', icon: 'BoltIcon' },
                { label: 'Daily API Calls', value: '2.4M+', icon: 'ChartBarIcon' },
                { label: 'Developer Community', value: '15K+', icon: 'UsersIcon' },
              ].map((stat, index) => (
                <div key={index} className="text-center">
                  <div className="flex justify-center mb-3">
                    <div className="w-12 h-12 bg-brand-primary/10 rounded-lg flex items-center justify-center">
                      <Icon name={stat.icon as any} size={24} className="text-brand-primary" />
                    </div>
                  </div>
                  <div className="text-3xl font-bold text-primary mb-1">{stat.value}</div>
                  <div className="text-sm text-muted-foreground">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Main Content */}
        <section className="py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <APIInteractive
              quickStartGuides={quickStartGuides}
              endpoints={endpoints}
              codeExamples={codeExamples}
              sdks={sdks}
              pricingTiers={pricingTiers}
              authSteps={authSteps}
              webhookEvents={webhookEvents}
              rateLimitTiers={rateLimitTiers}
              errorCodes={errorCodes}
            />
          </div>
        </section>

        {/* Support Section */}
        <section className="py-16 bg-surface">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-headline font-bold text-primary mb-4">Need Help Getting Started?</h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Our developer support team is here to help you integrate PhishGuard successfully
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                {
                  icon: 'BookOpenIcon',
                  title: 'Documentation',
                  description: 'Comprehensive guides, tutorials, and API reference',
                  link: 'Browse Docs',
                },
                {
                  icon: 'ChatBubbleLeftRightIcon',
                  title: 'Community Forum',
                  description: 'Connect with other developers and share solutions',
                  link: 'Join Discussion',
                },
                {
                  icon: 'LifebuoyIcon',
                  title: 'Expert Support',
                  description: 'Get help from our integration specialists',
                  link: 'Contact Support',
                },
              ].map((item, index) => (
                <div key={index} className="bg-card border border-border rounded-lg p-6 hover:shadow-md transition-shadow">
                  <div className="w-12 h-12 bg-gradient-to-br from-brand-primary to-brand-secondary rounded-lg flex items-center justify-center mb-4">
                    <Icon name={item.icon as any} size={24} className="text-white" />
                  </div>
                  <h3 className="text-lg font-headline font-bold text-primary mb-2">{item.title}</h3>
                  <p className="text-sm text-muted-foreground mb-4">{item.description}</p>
                  <button className="text-sm font-semibold text-brand-primary hover:text-brand-primary/80 transition-colors flex items-center space-x-2">
                    <span>{item.link}</span>
                    <Icon name="ArrowRightIcon" size={16} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="bg-primary text-white py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
              <div>
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-10 h-10 bg-gradient-to-br from-brand-accent to-brand-trust rounded-lg flex items-center justify-center">
                    <Icon name="ShieldCheckIcon" size={24} className="text-white" variant="solid" />
                  </div>
                  <span className="text-xl font-headline font-bold">PhishGuard</span>
                </div>
                <p className="text-sm text-white/70">
                  AI-powered cybersecurity protection for everyone
                </p>
              </div>

              {[
                {
                  title: 'Resources',
                  links: ['API Reference', 'SDK Documentation', 'Code Examples', 'Status Page'],
                },
                {
                  title: 'Support',
                  links: ['Help Center', 'Community Forum', 'Contact Support', 'Report Issue'],
                },
                {
                  title: 'Company',
                  links: ['About Us', 'Careers', 'Privacy Policy', 'Terms of Service'],
                },
              ].map((column, index) => (
                <div key={index}>
                  <h4 className="font-semibold mb-4">{column.title}</h4>
                  <ul className="space-y-2">
                    {column.links.map((link, linkIndex) => (
                      <li key={linkIndex}>
                        <a href="#" className="text-sm text-white/70 hover:text-white transition-colors">
                          {link}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>

            <div className="pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
              <p className="text-sm text-white/70">
                &copy; {new Date().getFullYear()} PhishGuard. All rights reserved.
              </p>
              <div className="flex items-center space-x-6">
                {['Twitter', 'GitHub', 'LinkedIn', 'Discord'].map((social, index) => (
                  <a
                    key={index}
                    href="#"
                    className="text-white/70 hover:text-white transition-colors"
                    aria-label={social}
                  >
                    <Icon name="GlobeAltIcon" size={20} />
                  </a>
                ))}
              </div>
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
}