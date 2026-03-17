import Link from 'next/link';
import Icon from '@/components/ui/AppIcon';

interface Action {
  title: string;
  description: string;
  icon: string;
  link: string;
  type: 'primary' | 'secondary';
}

interface RecommendedActionsProps {
  actions: Action[];
  onReportThreat?: () => void;
}

export default function RecommendedActions({ actions, onReportThreat }: RecommendedActionsProps) {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-headline font-bold text-foreground">
        Recommended Actions
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {actions.map((action, index) => {
          const isReport = action.title === 'Report This Threat' && onReportThreat;
          const baseClass = `p-6 rounded-lg border-2 transition-all duration-300 hover:shadow-md text-left w-full ${
            action.type === 'primary'
              ? 'border-brand-primary bg-brand-primary/5 hover:bg-brand-primary/10'
              : 'border-border bg-card hover:border-brand-primary/50'
          }`;
          const inner = (
            <div className="flex items-start space-x-4">
              <div className={`p-3 rounded-lg ${
                action.type === 'primary' ? 'bg-brand-primary text-white' : 'bg-surface text-brand-primary'
              }`}>
                <Icon name={action.icon as any} size={24} />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-semibold text-foreground mb-1">{action.title}</h4>
                <p className="text-sm text-muted-foreground">{action.description}</p>
              </div>
              <Icon name="ChevronRightIcon" size={20} className="text-muted-foreground mt-1" />
            </div>
          );

          return isReport ? (
            <button key={index} type="button" onClick={onReportThreat} className={baseClass}>
              {inner}
            </button>
          ) : (
            <Link key={index} href={action.link} className={baseClass}>
              {inner}
            </Link>
          );
        })}
      </div>
    </div>
  );
}