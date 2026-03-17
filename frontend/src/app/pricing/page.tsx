import type { Metadata } from 'next';
import Header from '@/components/common/Header';
import PricingInteractive from './components/PricingInteractive';

export const metadata: Metadata = {
  title: 'Pricing & Plans - PhishGuard',
  description: 'Choose the right PhishGuard plan for your needs. Compare Free, Pro, and Enterprise tiers with full feature breakdown.'
};

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-24 pb-16 px-4 lg:px-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-8">
          <div className="bg-yellow-500/20 border border-yellow-500/20 rounded-lg p-4 flex items-start space-x-3">
            <div className="text-yellow-600 mt-0.5 flex-shrink-0 text-xl">⚠️</div>
            <div>
              <p className="text-sm text-black font-semibold">Under Development</p>
              <p className="text-sm text-black/90 dark:text-yellow-300 mt-1">
                This documentation page is currently being developed and updated. Features and content may change. We appreciate your patience!
              </p>
            </div>
          </div>
        </div>
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl lg:text-5xl font-headline font-bold text-primary mb-4">
              Simple, Transparent Pricing
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Start free and scale as you grow. All plans include core phishing protection.
            </p>
          </div>
          <PricingInteractive />
        </div>
      </main>
      <footer className="bg-card border-t border-border py-8 px-4 lg:px-8">
        <div className="max-w-6xl mx-auto text-center">
          <p className="text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} PhishGuard. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
