

interface EndpointCardProps {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  endpoint: string;
  description: string;
  parameters?: { name: string; type: string; required: boolean; description: string }[];
}

export default function EndpointCard({ method, endpoint, description, parameters }: EndpointCardProps) {
  const methodColors = {
    GET: 'bg-blue-100 text-blue-700 border-blue-200',
    POST: 'bg-green-100 text-green-700 border-green-200',
    PUT: 'bg-amber-100 text-amber-700 border-amber-200',
    DELETE: 'bg-red-100 text-red-700 border-red-200',
  };

  return (
    <div className="bg-card border border-border rounded-lg p-6 hover:border-brand-primary/30 transition-colors">
      <div className="flex items-start space-x-4 mb-4">
        <span className={`px-3 py-1 rounded-md text-xs font-cta font-bold border ${methodColors[method]}`}>
          {method}
        </span>
        <div className="flex-1">
          <code className="text-sm font-accent text-brand-primary break-all">{endpoint}</code>
          <p className="text-sm text-muted-foreground mt-2">{description}</p>
        </div>
      </div>
      
      {parameters && parameters.length > 0 && (
        <div className="mt-4 pt-4 border-t border-border">
          <h4 className="text-sm font-semibold text-foreground mb-3">Parameters</h4>
          <div className="space-y-2">
            {parameters.map((param, index) => (
              <div key={index} className="flex items-start space-x-3 text-sm">
                <code className="font-accent text-brand-secondary">{param.name}</code>
                <span className="text-muted-foreground">({param.type})</span>
                {param.required && (
                  <span className="text-error text-xs font-semibold">Required</span>
                )}
                <span className="text-muted-foreground flex-1">{param.description}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}