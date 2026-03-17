import Link from 'next/link';
import Icon from '@/components/ui/AppIcon';

interface ThreatReport {
  id: number;
  title: string;
  category: string;
  severity: 'critical' | 'high' | 'medium';
  date: string;
  description: string;
  affectedUsers?: string;
  affected_users?: string;
  threat_link?: string;
}

interface ThreatIntelligenceProps {
  reports: ThreatReport[];
}

export default function ThreatIntelligence({ reports }: ThreatIntelligenceProps) {
  const severityConfig = {
    critical: {
      bg: 'bg-error/10',
      text: 'text-error',
      border: 'border-error/30',
      icon: 'ExclamationTriangleIcon' as const,
    },
    high: {
      bg: 'bg-warning/10',
      text: 'text-warning',
      border: 'border-warning/30',
      icon: 'ShieldExclamationIcon' as const,
    },
    medium: {
      bg: 'bg-brand-trust/10',
      text: 'text-brand-trust',
      border: 'border-brand-trust/30',
      icon: 'InformationCircleIcon' as const,
    },
  };

  return (
    <section className="bg-surface py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-12">
          <div>
            <div className="inline-flex items-center space-x-2 bg-error/10 px-4 py-2 rounded-full mb-4">
              <Icon name="BoltIcon" size={20} className="text-error" variant="solid" />
              <span className="text-sm font-medium text-error">Live Threat Intelligence</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-headline font-bold text-foreground mb-4">
              Emerging Phishing Techniques
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl">
              Stay informed about the latest threats with our weekly analysis and real-world examples
            </p>
          </div>

          <Link
            href="/threat-intelligence-database"
            className="mt-6 lg:mt-0 inline-flex items-center space-x-2 px-6 py-3 bg-brand-primary hover:bg-brand-primary/90 text-white font-cta font-semibold rounded-lg transition-all duration-300"
          >
            <span>View All Threats</span>
            <Icon name="ArrowRightIcon" size={18} />
          </Link>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {reports.map((report) => {
            const config = severityConfig[report.severity];
            return (
              <div
                key={report.id}
                className={`bg-card p-6 rounded-xl border ${config.border} hover:shadow-lg transition-all duration-300`}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className={`${config.bg} px-3 py-1 rounded-full flex items-center space-x-2`}>
                    <Icon name={config.icon} size={16} className={config.text} variant="solid" />
                    <span className={`text-xs font-medium ${config.text} uppercase`}>
                      {report.severity}
                    </span>
                  </div>
                  <span className="text-xs text-muted-foreground">{report.date}</span>
                </div>

                <h3 className="text-lg font-headline font-bold text-foreground mb-2">
                  {report.title}
                </h3>

                <div className="inline-block bg-surface px-3 py-1 rounded-full text-xs font-medium text-muted-foreground mb-3">
                  {report.category}
                </div>

                <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                  {report.description}
                </p>

                <div className="flex items-center justify-between pt-4 border-t border-border">
                  <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                    <Icon name="UserGroupIcon" size={16} />
                    <span>{report.affected_users ?? report.affectedUsers} affected</span>
                  </div>
                  <Link
                    href={
                      report.threat_link
                        ? `/threat-intelligence-database/${report.threat_link}`
                        : '/threat-intelligence-database'
                    }
                    className="text-brand-primary hover:text-brand-primary/80 font-medium text-sm flex items-center space-x-1 transition-colors"
                  >
                    <span>Learn More</span>
                    <Icon name="ArrowRightIcon" size={14} />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}