import type { Metadata } from 'next';
import Header from '@/components/common/Header';
import ScanDetectInteractive from './components/ScanDetectInteractive';

export const metadata: Metadata = {
  title: 'Scan & Detect Hub - PhishGuard',
  description: 'Real-time threat scanning and detection for emails, URLs, attachments, and QR codes. Get instant AI-powered analysis with detailed threat explanations and personalized security recommendations.',
};

export default function ScanDetectHubPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="pt-20 pb-12">
        <div className="w-full px-4 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="mb-8">
              <h1 className="text-4xl lg:text-5xl font-headline font-bold text-foreground mb-4">
                Scan & Detect Hub
              </h1>
              <p className="text-lg text-muted-foreground max-w-3xl">
                Advanced AI-powered threat detection for emails, URLs, files, and QR codes. Get instant analysis with detailed explanations and personalized security recommendations.
              </p>
            </div>

            <ScanDetectInteractive />
          </div>
        </div>
      </main>
    </div>
  );
}