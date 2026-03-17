import type { Metadata } from 'next';
import Header from '@/components/common/Header';
import ThreatDatabaseInteractive from '../components/ThreatDatabaseInteractive';

interface Props {
  params: Promise<{ threat_id: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { threat_id } = await params;
  const readable = threat_id
    .split('-')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
  return {
    title: `${readable} - Threat Intelligence | PhishGuard`,
    description: `Detailed analysis and prevention tips for the "${readable}" phishing threat. Community insights, indicators of compromise, and expert guidance.`,
  };
}

export default async function ThreatDetailPage({ params }: Props) {
  const { threat_id } = await params;
  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="pt-24 pb-16 px-4 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <ThreatDatabaseInteractive initialThreatId={threat_id} />
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
