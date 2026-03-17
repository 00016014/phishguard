import Icon from '@/components/ui/AppIcon';

interface ErrorCode {
  code: number;
  name: string;
  description: string;
  solution: string;
}

interface ErrorCodeTableProps {
  errors: ErrorCode[];
}

export default function ErrorCodeTable({ errors }: ErrorCodeTableProps) {
  const getErrorIcon = (code: number) => {
    if (code >= 500) return { name: 'XCircleIcon', color: 'text-error' };
    if (code >= 400) return { name: 'ExclamationCircleIcon', color: 'text-warning' };
    return { name: 'InformationCircleIcon', color: 'text-brand-primary' };
  };

  return (
    <div className="bg-card border border-border rounded-lg p-6">
      <div className="flex items-center space-x-3 mb-6">
        <div className="w-10 h-10 bg-gradient-to-br from-error to-red-600 rounded-lg flex items-center justify-center">
          <Icon name="ExclamationTriangleIcon" size={20} className="text-white" variant="solid" />
        </div>
        <div>
          <h3 className="text-xl font-headline font-bold text-primary">Error Codes</h3>
          <p className="text-sm text-muted-foreground">Common API errors and solutions</p>
        </div>
      </div>

      <div className="space-y-4">
        {errors.map((error, index) => {
          const icon = getErrorIcon(error.code);
          return (
            <div key={index} className="border border-border rounded-lg p-4 hover:border-brand-primary/30 transition-colors">
              <div className="flex items-start space-x-3 mb-3">
                <Icon name={icon.name as any} size={20} className={`${icon.color} flex-shrink-0 mt-0.5`} />
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-1">
                    <span className="text-sm font-bold font-accent text-foreground">{error.code}</span>
                    <span className="text-sm font-semibold text-primary">{error.name}</span>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">{error.description}</p>
                  <div className="bg-surface border border-border rounded-md p-3">
                    <p className="text-xs font-semibold text-foreground mb-1">Solution:</p>
                    <p className="text-xs text-muted-foreground">{error.solution}</p>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}