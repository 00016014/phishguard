import Icon from '@/components/ui/AppIcon';

interface QuickStartCardProps {
  title: string;
  description: string;
  icon: string;
  steps: string[];
}

export default function QuickStartCard({ title, description, icon, steps }: QuickStartCardProps) {
  return (
    <div className="bg-card border border-border rounded-lg p-6 hover:shadow-md transition-shadow">
      <div className="flex items-start space-x-4 mb-4">
        <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-brand-primary to-brand-secondary rounded-lg flex items-center justify-center">
          <Icon name={icon as any} size={24} className="text-white" variant="solid" />
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-headline font-bold text-primary mb-2">{title}</h3>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
      </div>
      <div className="space-y-2">
        {steps.map((step, index) => (
          <div key={index} className="flex items-start space-x-3">
            <span className="flex-shrink-0 w-6 h-6 bg-brand-accent/10 text-brand-accent rounded-full flex items-center justify-center text-xs font-semibold">
              {index + 1}
            </span>
            <p className="text-sm text-foreground pt-0.5">{step}</p>
          </div>
        ))}
      </div>
    </div>
  );
}