import Icon from '@/components/ui/AppIcon';
import Link from 'next/link';

interface QuickAction {
  id: string;
  title: string;
  description: string;
  icon: string;
  href: string;
  color: string;
}

interface QuickActionsCardProps {
  actions: QuickAction[];
}

export default function QuickActionsCard({ actions }: QuickActionsCardProps) {
  return (
    <div className="bg-card rounded-lg shadow-md p-6 border border-border">
      <h2 className="text-lg font-headline font-bold text-foreground mb-4">Quick Actions</h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {actions.map((action) => (
          <Link
            key={action.id}
            href={action.href}
            className="flex items-start space-x-3 p-4 bg-surface rounded-lg hover:bg-surface/80 hover:shadow-sm transition-all group"
          >
            <div className={`flex-shrink-0 w-10 h-10 rounded-lg ${action.color} flex items-center justify-center`}>
              <Icon name={action.icon as any} size={20} className="text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-semibold text-foreground mb-1 group-hover:text-brand-primary transition-colors">
                {action.title}
              </h3>
              <p className="text-xs text-muted-foreground">{action.description}</p>
            </div>
            <Icon name="ChevronRightIcon" size={16} className="text-muted-foreground group-hover:text-brand-primary transition-colors flex-shrink-0 mt-1" />
          </Link>
        ))}
      </div>
    </div>
  );
}