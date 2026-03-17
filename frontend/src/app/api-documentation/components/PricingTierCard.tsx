import Icon from '@/components/ui/AppIcon';

interface PricingTierCardProps {
  name: string;
  price: string;
  description: string;
  features: string[];
  requestLimit: string;
  isPopular?: boolean;
}

export default function PricingTierCard({ 
  name, 
  price, 
  description, 
  features, 
  requestLimit,
  isPopular = false 
}: PricingTierCardProps) {
  return (
    <div className={`relative bg-card border rounded-lg p-6 ${isPopular ? 'border-brand-accent shadow-lg' : 'border-border'}`}>
      {isPopular && (
        <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
          <span className="px-4 py-1 bg-brand-accent text-white text-xs font-cta font-bold rounded-full shadow-sm">
            Most Popular
          </span>
        </div>
      )}
      
      <div className="text-center mb-6">
        <h3 className="text-xl font-headline font-bold text-primary mb-2">{name}</h3>
        <div className="flex items-baseline justify-center space-x-1 mb-2">
          <span className="text-4xl font-bold text-brand-primary">{price}</span>
          {price !== 'Custom' && <span className="text-muted-foreground">/month</span>}
        </div>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>

      <div className="mb-6 pb-6 border-b border-border">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">API Requests</span>
          <span className="font-semibold text-foreground">{requestLimit}</span>
        </div>
      </div>

      <ul className="space-y-3 mb-6">
        {features.map((feature, index) => (
          <li key={index} className="flex items-start space-x-3">
            <Icon name="CheckCircleIcon" size={20} className="text-brand-accent flex-shrink-0 mt-0.5" variant="solid" />
            <span className="text-sm text-foreground">{feature}</span>
          </li>
        ))}
      </ul>

      <button className={`w-full py-3 rounded-md font-cta font-semibold transition-colors ${
        isPopular 
          ? 'bg-brand-accent text-white hover:bg-brand-accent/90' :'bg-surface text-brand-primary hover:bg-brand-primary/10 border border-border'
      }`}>
        Get Started
      </button>
    </div>
  );
}