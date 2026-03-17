import Link from 'next/link';
import Icon from '@/components/ui/AppIcon';

export default function CTASection() {
  return (
    <section className="bg-gradient-to-br from-primary via-secondary to-brand-primary text-white py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center space-x-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full border border-white/20 mb-6">
            <Icon name="RocketLaunchIcon" size={20} variant="solid" className="text-accent" />
            <span className="text-sm font-medium">Start Your Security Journey Today</span>
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-headline font-bold mb-6">
            Ready to Protect Your Digital Life?
          </h2>

          <p className="text-lg sm:text-xl text-white/90 mb-10 leading-relaxed">
            Join thousands of users who trust PhishGuard to keep them safe from phishing threats. Get started with a free scan or explore our comprehensive learning resources.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link
              href="/scan-detect-hub"
              className="inline-flex items-center justify-center space-x-2 px-8 py-4 bg-accent hover:bg-accent/90 text-primary font-cta font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-300"
            >
              <Icon name="ShieldCheckIcon" size={20} variant="solid" />
              <span>Start Free Security Scan</span>
            </Link>

            <Link
              href="/personal-dashboard"
              className="inline-flex items-center justify-center space-x-2 px-8 py-4 bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/30 font-cta font-semibold rounded-lg transition-all duration-300"
            >
              <Icon name="ChartBarIcon" size={20} />
              <span>View Your Dashboard</span>
            </Link>
          </div>

          <div className="mt-12 grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg p-6">
              <div className="w-12 h-12 bg-accent/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Icon name="BoltIcon" size={24} variant="solid" className="text-accent" />
              </div>
              <div className="text-2xl font-headline font-bold mb-2">Instant Results</div>
              <p className="text-sm text-white/80">Get threat analysis in seconds with our AI-powered detection</p>
            </div>

            <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg p-6">
              <div className="w-12 h-12 bg-accent/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Icon name="AcademicCapIcon" size={24} variant="solid" className="text-accent" />
              </div>
              <div className="text-2xl font-headline font-bold mb-2">Learn & Grow</div>
              <p className="text-sm text-white/80">Access comprehensive courses and interactive tutorials</p>
            </div>

            <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg p-6">
              <div className="w-12 h-12 bg-accent/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Icon name="UserGroupIcon" size={24} variant="solid" className="text-accent" />
              </div>
              <div className="text-2xl font-headline font-bold mb-2">Join Community</div>
              <p className="text-sm text-white/80">Connect with 50K+ security-conscious users worldwide</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}