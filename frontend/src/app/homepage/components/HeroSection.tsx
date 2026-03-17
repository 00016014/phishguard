import Link from 'next/link';
import Icon from '@/components/ui/AppIcon';

interface HeroSectionProps {
  liveStats: {
    threatsDetected: string;
    usersProtected: string;
    scansCompleted: string;
  };
}

export default function HeroSection({ liveStats }: HeroSectionProps) {
  return (
    <section className="relative bg-gradient-to-br from-primary via-secondary to-brand-primary text-white overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(0,212,170,0.1),transparent_50%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_50%,rgba(37,99,235,0.1),transparent_50%)]" />
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-32">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-8">
            <div className="inline-flex items-center space-x-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full border border-white/20">
              <Icon name="ShieldCheckIcon" size={20} variant="solid" className="text-accent" />
              <span className="text-sm font-medium">AI-Powered Cybersecurity Partner</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-headline font-bold leading-tight">
              Your Digital Guardian Against Phishing Threats
            </h1>

            <p className="text-lg sm:text-xl text-white/90 leading-relaxed">
              Learn, detect, protect, share. PhishGuard combines cutting-edge AI detection with comprehensive education, making cybersecurity accessible to everyone.
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                href="/scan-detect-hub"
                className="inline-flex items-center justify-center space-x-2 px-8 py-4 bg-accent hover:bg-accent/90 text-primary font-cta font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-300"
              >
                <Icon name="MagnifyingGlassIcon" size={20} variant="solid" />
                <span>Start Free Scan</span>
              </Link>

              <Link
                href="/interactive-learning-lab"
                className="inline-flex items-center justify-center space-x-2 px-8 py-4 bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/30 font-cta font-semibold rounded-lg transition-all duration-300"
              >
                <Icon name="AcademicCapIcon" size={20} />
                <span>Explore Learning Lab</span>
              </Link>
            </div>

            <div className="grid grid-cols-3 gap-6 pt-8 border-t border-white/20">
              <div className="space-y-1">
                <div className="text-3xl font-headline font-bold text-accent">{liveStats.threatsDetected}</div>
                <div className="text-sm text-white/80">Threats Detected</div>
              </div>
              <div className="space-y-1">
                <div className="text-3xl font-headline font-bold text-accent">{liveStats.usersProtected}</div>
                <div className="text-sm text-white/80">Users Protected</div>
              </div>
              <div className="space-y-1">
                <div className="text-3xl font-headline font-bold text-accent">{liveStats.scansCompleted}</div>
                <div className="text-sm text-white/80">Scans Completed</div>
              </div>
            </div>
          </div>

          <div className="hidden lg:block relative">
            <div className="relative w-full h-[500px] bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-sm rounded-2xl border border-white/20 p-8 shadow-2xl">
              <div className="absolute top-8 right-8 w-16 h-16 bg-accent/20 rounded-full animate-pulse" />
              <div className="absolute bottom-8 left-8 w-24 h-24 bg-brand-secondary/20 rounded-full animate-pulse" style={{ animationDelay: '1s' }} />
              
              <div className="space-y-6">
                <div className="flex items-center space-x-3 bg-white/10 backdrop-blur-sm p-4 rounded-lg border border-white/20">
                  <div className="flex-shrink-0 w-12 h-12 bg-success/20 rounded-full flex items-center justify-center">
                    <Icon name="CheckCircleIcon" size={24} variant="solid" className="text-success" />
                  </div>
                  <div className="flex-1">
                    <div className="text-sm font-medium">Email Verified Safe</div>
                    <div className="text-xs text-white/70">No threats detected</div>
                  </div>
                </div>

                <div className="flex items-center space-x-3 bg-white/10 backdrop-blur-sm p-4 rounded-lg border border-white/20">
                  <div className="flex-shrink-0 w-12 h-12 bg-error/20 rounded-full flex items-center justify-center">
                    <Icon name="ExclamationTriangleIcon" size={24} variant="solid" className="text-error" />
                  </div>
                  <div className="flex-1">
                    <div className="text-sm font-medium">Phishing Detected</div>
                    <div className="text-xs text-white/70">Blocked automatically</div>
                  </div>
                </div>

                <div className="flex items-center space-x-3 bg-white/10 backdrop-blur-sm p-4 rounded-lg border border-white/20">
                  <div className="flex-shrink-0 w-12 h-12 bg-warning/20 rounded-full flex items-center justify-center">
                    <Icon name="ShieldExclamationIcon" size={24} variant="solid" className="text-warning" />
                  </div>
                  <div className="flex-1">
                    <div className="text-sm font-medium">Suspicious Link</div>
                    <div className="text-xs text-white/70">Review recommended</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}