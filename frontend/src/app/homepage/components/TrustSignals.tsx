import Icon from '@/components/ui/AppIcon';
import AppImage from '@/components/ui/AppImage';

interface TrustSignal {
  id: number;
  type: 'certification' | 'award' | 'partnership';
  name: string;
  description: string;
  logo: string;
  alt: string;
}

interface TrustSignalsProps {
  signals: TrustSignal[];
}

export default function TrustSignals({ signals }: TrustSignalsProps) {
  return (
    <section className="bg-surface py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <div className="inline-flex items-center space-x-2 bg-accent/10 px-4 py-2 rounded-full mb-4">
            <Icon name="ShieldCheckIcon" size={20} className="text-accent" variant="solid" />
            <span className="text-sm font-medium text-accent">Trusted by Industry Leaders</span>
          </div>
          <h2 className="text-3xl font-headline font-bold text-foreground mb-4">
            Industry Recognition & Partnerships
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            PhishGuard is certified and recognized by leading cybersecurity organizations worldwide
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
          {signals.map((signal) => (
            <div
              key={signal.id}
              className="bg-card p-6 rounded-lg border border-border hover:border-brand-primary hover:shadow-md transition-all duration-300 flex flex-col items-center justify-center space-y-3"
            >
              <div className="w-16 h-16 relative flex items-center justify-center">
                <AppImage
                  src={signal.logo}
                  alt={signal.alt}
                  className="w-full h-full object-contain"
                />
              </div>
              <div className="text-center">
                <div className="text-xs font-medium text-foreground">{signal.name}</div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-12 grid md:grid-cols-3 gap-6">
          <div className="bg-card p-6 rounded-lg border border-border text-center">
            <div className="w-12 h-12 bg-success/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Icon name="CheckBadgeIcon" size={24} className="text-success" variant="solid" />
            </div>
            <div className="text-2xl font-headline font-bold text-foreground mb-2">SOC 2 Certified</div>
            <p className="text-sm text-muted-foreground">Enterprise-grade security standards compliance</p>
          </div>

          <div className="bg-card p-6 rounded-lg border border-border text-center">
            <div className="w-12 h-12 bg-brand-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Icon name="GlobeAltIcon" size={24} className="text-brand-primary" variant="solid" />
            </div>
            <div className="text-2xl font-headline font-bold text-foreground mb-2">GDPR Compliant</div>
            <p className="text-sm text-muted-foreground">Full data privacy and protection adherence</p>
          </div>

          <div className="bg-card p-6 rounded-lg border border-border text-center">
            <div className="w-12 h-12 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Icon name="LockClosedIcon" size={24} className="text-accent" variant="solid" />
            </div>
            <div className="text-2xl font-headline font-bold text-foreground mb-2">ISO 27001</div>
            <p className="text-sm text-muted-foreground">Information security management certified</p>
          </div>
        </div>
      </div>
    </section>
  );
}