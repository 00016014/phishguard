interface ThreatIndicatorProps {
  level: 'safe' | 'low' | 'medium' | 'high' | 'critical';
  score: number;
}

export default function ThreatIndicator({ level, score }: ThreatIndicatorProps) {
  const getIndicatorConfig = () => {
    switch (level) {
      case 'safe':
        return {
          color: 'bg-success',
          textColor: 'text-success',
          label: 'Safe',
          description: 'No threats detected'
        };
      case 'low':
        return {
          color: 'bg-brand-accent',
          textColor: 'text-brand-accent',
          label: 'Low Risk',
          description: 'Minor concerns identified'
        };
      case 'medium':
        return {
          color: 'bg-warning',
          textColor: 'text-warning',
          label: 'Medium Risk',
          description: 'Suspicious patterns detected'
        };
      case 'high':
        return {
          color: 'bg-error',
          textColor: 'text-error',
          label: 'High Risk',
          description: 'Likely phishing attempt'
        };
      case 'critical':
        return {
          color: 'bg-brand-cta',
          textColor: 'text-brand-cta',
          label: 'Critical Threat',
          description: 'Confirmed malicious content'
        };
    }
  };

  const config = getIndicatorConfig();

  return (
    <div className="flex items-center space-x-4">
      <div className="relative w-24 h-24">
        <svg className="transform -rotate-90 w-24 h-24">
          <circle
            cx="48"
            cy="48"
            r="40"
            stroke="currentColor"
            strokeWidth="8"
            fill="transparent"
            className="text-surface"
          />
          <circle
            cx="48"
            cy="48"
            r="40"
            stroke="currentColor"
            strokeWidth="8"
            fill="transparent"
            strokeDasharray={`${2 * Math.PI * 40}`}
            strokeDashoffset={`${2 * Math.PI * 40 * (1 - score / 100)}`}
            className={config.textColor}
            strokeLinecap="round"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className={`text-2xl font-bold ${config.textColor}`}>
            {score}
          </span>
        </div>
      </div>
      <div>
        <h3 className={`text-xl font-headline font-bold ${config.textColor}`}>
          {config.label}
        </h3>
        <p className="text-sm text-muted-foreground mt-1">
          {config.description}
        </p>
      </div>
    </div>
  );
}