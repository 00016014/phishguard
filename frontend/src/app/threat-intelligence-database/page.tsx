import type { Metadata } from 'next';
import Header from '@/components/common/Header';
import ThreatDatabaseInteractive from './components/ThreatDatabaseInteractive';

export const metadata: Metadata = {
  title: 'Threat Intelligence Database - PhishGuard',
  description: 'Comprehensive searchable repository of known phishing threats with community contributions, real-time detection data, and expert analysis to help protect against cyber attacks.',
};

export default function ThreatIntelligenceDatabasePage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="pt-24 pb-16 px-4 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <ThreatDatabaseInteractive />
        </div>
      </main>

      <footer className="bg-card border-t border-border py-8 px-4 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <p className="text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} PhishGuard. All rights reserved. | Protecting digital citizens worldwide.
          </p>
        </div>
      </footer>
    </div>
  );
}