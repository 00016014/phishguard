import AppImage from '@/components/ui/AppImage';
import Icon from '@/components/ui/AppIcon';
import type { PlatformStats } from '@/services/ContentService';

interface Testimonial {
  id: number;
  name: string;
  role: string;
  company: string;
  image: string;
  alt: string;
  quote: string;
  rating: number;
}

interface ScanStats {
  threatsBlockedToday: string;
  totalScans: string;
  activeUsers: string;
  detectionRate: string;
}

interface TestimonialsSectionProps {
  testimonials: Testimonial[];
  platformStats: PlatformStats | null;
  scanStats?: ScanStats | null;
}

export default function TestimonialsSection({ testimonials, platformStats, scanStats }: TestimonialsSectionProps) {
  const stats = [
    {
      value: scanStats?.threatsBlockedToday ?? platformStats?.userSatisfactionRate ?? '–',
      label: 'Threats Blocked Today',
      icon: 'ShieldExclamationIcon',
      gradient: 'from-brand-primary to-brand-secondary',
    },
    {
      value: scanStats?.totalScans ?? platformStats?.scansCompleted ?? '–',
      label: 'Total Scans',
      icon: 'MagnifyingGlassIcon',
      gradient: 'from-success to-brand-accent',
    },
    {
      value: scanStats?.activeUsers ?? platformStats?.activeCommunityMembers ?? '–',
      label: 'Active Users',
      icon: 'UsersIcon',
      gradient: 'from-brand-secondary to-brand-trust',
    },
    {
      value: scanStats?.detectionRate ?? platformStats?.threatDetectionAccuracy ?? '–',
      label: 'Detection Rate',
      icon: 'ChartBarIcon',
      gradient: 'from-warning to-error',
    },
  ];

  return (
    <section className="bg-background py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <div className="inline-flex items-center space-x-2 bg-success/10 px-4 py-2 rounded-full mb-4">
            <Icon name="ChatBubbleLeftRightIcon" size={20} className="text-success" variant="solid" />
            <span className="text-sm font-medium text-success">Community Success Stories</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-headline font-bold text-foreground mb-4">
            Trusted by Security-Conscious Users
          </h2>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            Real stories from individuals and businesses who've strengthened their cybersecurity with PhishGuard
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {testimonials.map((testimonial) => (
            <div
              key={testimonial.id}
              className="bg-card p-6 rounded-xl border border-border hover:border-brand-primary hover:shadow-lg transition-all duration-300"
            >
              <div className="flex items-center space-x-1 mb-4">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Icon key={i} name="StarIcon" size={18} className="text-warning" variant="solid" />
                ))}
              </div>

              <p className="text-foreground leading-relaxed mb-6 italic">
                "{testimonial.quote}"
              </p>

              <div className="flex items-center space-x-4 pt-4 border-t border-border">
                <div className="w-12 h-12 rounded-full overflow-hidden flex-shrink-0 bg-surface">
                  <AppImage
                    src={testimonial.image}
                    alt={testimonial.alt}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <div className="font-headline font-bold text-foreground">{testimonial.name}</div>
                  <div className="text-sm text-muted-foreground">{testimonial.role}</div>
                  <div className="text-xs text-muted-foreground">{testimonial.company}</div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-16 grid md:grid-cols-4 gap-6">
          {stats.map((s) => (
            <div
              key={s.label}
              className={`bg-gradient-to-br ${s.gradient} p-6 rounded-xl text-white text-center`}
            >
              <div className="flex items-center justify-center gap-2 mb-3 opacity-80">
                <Icon name={s.icon as any} size={20} className="text-white" />
                <span className="text-xs font-semibold uppercase tracking-wider">+live</span>
              </div>
              <div className="text-4xl font-headline font-bold mb-2">{s.value}</div>
              <div className="text-sm opacity-90">{s.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}