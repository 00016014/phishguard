import Icon from '@/components/ui/AppIcon';


interface SDKCardProps {
  name: string;
  language: string;
  description: string;
  icon: string;
  version: string;
  installCommand: string;
}

export default function SDKCard({ name, language, description, icon, version, installCommand }: SDKCardProps) {
  return (
    <div className="bg-card border border-border rounded-lg p-6 hover:shadow-md transition-shadow">
      <div className="flex items-start space-x-4 mb-4">
        <div className="flex-shrink-0 w-12 h-12 bg-surface rounded-lg flex items-center justify-center">
          <Icon name={icon as any} size={28} className="text-brand-primary" />
        </div>
        <div className="flex-1">
          <div className="flex items-center space-x-2 mb-1">
            <h3 className="text-lg font-headline font-bold text-primary">{name}</h3>
            <span className="px-2 py-0.5 bg-brand-accent/10 text-brand-accent text-xs font-semibold rounded">
              {version}
            </span>
          </div>
          <p className="text-sm text-muted-foreground mb-3">{description}</p>
          <div className="bg-surface border border-border rounded-md p-3">
            <code className="text-xs font-accent text-brand-secondary">{installCommand}</code>
          </div>
        </div>
      </div>
    </div>
  );
}