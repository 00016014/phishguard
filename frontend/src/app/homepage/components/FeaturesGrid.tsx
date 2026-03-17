import Link from 'next/link';
import Icon from '@/components/ui/AppIcon';

interface Feature {
  id: number;
  icon: string;
  title: string;
  description: string;
  link: string;
  color: string;
}

interface FeaturesGridProps {
  features: Feature[];
}

export default function FeaturesGrid({ features }: FeaturesGridProps) {
  const colorClasses: Record<string, string> = {
    primary: 'bg-brand-primary/10 text-brand-primary',
    secondary: 'bg-brand-secondary/10 text-brand-secondary',
    accent: 'bg-accent/10 text-accent',
    success: 'bg-success/10 text-success',
  };

  return (
    <section className="bg-background py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-headline font-bold text-foreground mb-4">
            Comprehensive Protection Ecosystem
          </h2>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            From real-time threat detection to interactive learning, PhishGuard provides everything you need to stay safe online
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature) => (
            <Link
              key={feature.id}
              href={feature.link}
              className="group bg-card p-6 rounded-xl border border-border hover:border-brand-primary hover:shadow-lg transition-all duration-300"
            >
              <div className={`w-14 h-14 ${colorClasses[feature.color]} rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                <Icon name={feature.icon as any} size={28} variant="solid" />
              </div>
              
              <h3 className="text-xl font-headline font-bold text-foreground mb-3 group-hover:text-brand-primary transition-colors">
                {feature.title}
              </h3>
              
              <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                {feature.description}
              </p>

              <div className="flex items-center space-x-2 text-brand-primary font-medium text-sm group-hover:translate-x-2 transition-transform duration-300">
                <span>Explore</span>
                <Icon name="ArrowRightIcon" size={16} />
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}