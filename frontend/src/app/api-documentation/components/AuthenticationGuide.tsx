import Icon from '@/components/ui/AppIcon';

interface AuthStep {
  title: string;
  description: string;
  code?: string;
}

interface AuthenticationGuideProps {
  steps: AuthStep[];
}

export default function AuthenticationGuide({ steps }: AuthenticationGuideProps) {
  return (
    <div className="bg-card border border-border rounded-lg p-6">
      <div className="flex items-center space-x-3 mb-6">
        <div className="w-10 h-10 bg-gradient-to-br from-brand-primary to-brand-secondary rounded-lg flex items-center justify-center">
          <Icon name="KeyIcon" size={20} className="text-white" variant="solid" />
        </div>
        <h3 className="text-xl font-headline font-bold text-primary">Authentication Process</h3>
      </div>

      <div className="space-y-6">
        {steps.map((step, index) => (
          <div key={index} className="relative pl-8">
            <div className="absolute left-0 top-0 w-6 h-6 bg-brand-accent text-white rounded-full flex items-center justify-center text-xs font-bold">
              {index + 1}
            </div>
            {index < steps.length - 1 && (
              <div className="absolute left-3 top-6 bottom-0 w-0.5 bg-border" />
            )}
            <div className="pb-6">
              <h4 className="text-base font-semibold text-foreground mb-2">{step.title}</h4>
              <p className="text-sm text-muted-foreground mb-3">{step.description}</p>
              {step.code && (
                <div className="bg-surface border border-border rounded-md p-3">
                  <code className="text-xs font-accent text-brand-secondary break-all">{step.code}</code>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}