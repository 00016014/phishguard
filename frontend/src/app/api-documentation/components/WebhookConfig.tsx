import Icon from '@/components/ui/AppIcon';

interface WebhookEvent {
  name: string;
  description: string;
  payload: string;
}

interface WebhookConfigProps {
  events: WebhookEvent[];
}

export default function WebhookConfig({ events }: WebhookConfigProps) {
  return (
    <div className="bg-card border border-border rounded-lg p-6">
      <div className="flex items-center space-x-3 mb-6">
        <div className="w-10 h-10 bg-gradient-to-br from-brand-secondary to-brand-trust rounded-lg flex items-center justify-center">
          <Icon name="BoltIcon" size={20} className="text-white" variant="solid" />
        </div>
        <div>
          <h3 className="text-xl font-headline font-bold text-primary">Webhook Events</h3>
          <p className="text-sm text-muted-foreground">Real-time notifications for threat detection</p>
        </div>
      </div>

      <div className="space-y-4">
        {events.map((event, index) => (
          <div key={index} className="border border-border rounded-lg p-4 hover:border-brand-primary/30 transition-colors">
            <div className="flex items-start justify-between mb-2">
              <code className="text-sm font-accent text-brand-primary">{event.name}</code>
              <Icon name="ArrowTopRightOnSquareIcon" size={16} className="text-muted-foreground" />
            </div>
            <p className="text-sm text-muted-foreground mb-3">{event.description}</p>
            <div className="bg-surface rounded-md p-3">
              <p className="text-xs text-muted-foreground mb-1">Payload Structure:</p>
              <code className="text-xs font-accent text-foreground">{event.payload}</code>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}