import type { Metadata } from 'next';
import Header from '@/components/common/Header';
import DashboardInteractive from './components/DashboardInteractive';

export const metadata: Metadata = {
  title: 'Personal Dashboard - PhishGuard',
  description: 'Track your cybersecurity journey with comprehensive scan history, learning progress, custom threat alerts, and security score monitoring on your personalized PhishGuard dashboard.'
};

export default function PersonalDashboardPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="pt-24 pb-16 px-4 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl lg:text-4xl font-headline font-bold text-primary mb-2">
              Personal Dashboard
            </h1>
            <p className="text-base text-muted-foreground">
              Track your cybersecurity journey and stay protected with personalized insights
            </p>
          </div>

          <DashboardInteractive />
        </div>
      </main>

      <footer className="bg-card border-t border-border py-8 px-4 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <p className="text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} PhishGuard. Your AI-powered cybersecurity partner. All rights reserved.
          </p>
        </div>
      </footer>
    </div>

  );
}
