'use client';

import { useState, useEffect } from 'react';
import Icon from '@/components/ui/AppIcon';
import { DashboardService } from '@/services/DashboardService';
import { invalidateCache } from '@/lib/apiFetch';
import { toast } from 'sonner';
import { useSubscription } from '@/contexts/SubscriptionContext';

interface Alert {
  id: string;
  dbId?: number;
  title: string;
  description: string;
  category: string;
  enabled: boolean;
  frequency: string;
}

interface CustomAlertsCardProps {
  alerts: Alert[];
  onCountChange?: (count: number) => void;
}

const THREAT_TYPES = ['', 'phishing', 'malware', 'ransomware', 'social_engineering', 'fraud'];
const SEVERITIES = ['', 'low', 'medium', 'high', 'critical'];

export default function CustomAlertsCard({ alerts: initialAlerts, onCountChange }: CustomAlertsCardProps) {
  const [alerts, setAlerts] = useState(initialAlerts);
  const { subscription } = useSubscription();
  const alertsAtLimit = subscription.alertsLimit !== 'unlimited' && alerts.length >= (subscription.alertsLimit as number);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => { onCountChange?.(alerts.length); }, [alerts.length]);
  const [saving, setSaving] = useState(false);
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [form, setForm] = useState({ title: '', keyword: '', threat_type: '', min_severity: '' });

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Threat': return 'ShieldExclamationIcon';
      case 'Learning': return 'AcademicCapIcon';
      case 'Community': return 'UserGroupIcon';
      default: return 'BellIcon';
    }
  };

  const handleToggle = async (alert: Alert) => {
    if (!alert.dbId || togglingId === alert.id) return;
    setTogglingId(alert.id);
    const newActive = !alert.enabled;
    // Optimistic update
    setAlerts(prev => prev.map(a => a.id === alert.id ? { ...a, enabled: newActive } : a));
    try {
      await DashboardService.updateAlert(alert.dbId, { active: newActive });
      invalidateCache('alerts');
      toast.success(newActive ? `Alert "${alert.title}" enabled` : `Alert "${alert.title}" disabled`);
    } catch {
      // Revert on failure
      setAlerts(prev => prev.map(a => a.id === alert.id ? { ...a, enabled: !newActive } : a));
      toast.error('Failed to update alert');
    } finally {
      setTogglingId(null);
    }
  };

  const handleDelete = async (alert: Alert) => {
    if (!alert.dbId || deletingId === alert.id) return;
    setDeletingId(alert.id);
    try {
      await DashboardService.deleteAlert(alert.dbId);
      invalidateCache('alerts');
      setAlerts(prev => prev.filter(a => a.id !== alert.id));
      toast.success(`Alert "${alert.title}" deleted`);
    } finally {
      setDeletingId(null);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim() || !form.keyword.trim()) {
      setError('Title and keyword are required.');
      return;
    }
    setSaving(true);
    setError('');
    try {
      const created = await DashboardService.createAlert({
        title: form.title.trim(),
        keyword: form.keyword.trim(),
        threat_type: form.threat_type,
        min_severity: form.min_severity,
      });
      invalidateCache('alerts');
      setAlerts(prev => [
        {
          id: String(created.id),
          dbId: created.id,
          title: created.title,
          description: `Keyword: ${created.keyword}`,
          category: 'Threat',
          enabled: created.active ?? true,
          frequency: 'Real-time',
        },
        ...prev,
      ]);
      setForm({ title: '', keyword: '', threat_type: '', min_severity: '' });
      setShowForm(false);
      toast.success(`Alert "${created.title}" created`);
    } catch (err: any) {
      setError(err.message || 'Failed to create alert.');
      toast.error(err.message || 'Failed to create alert');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-card rounded-lg shadow-md p-6 border border-border">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-headline font-bold text-foreground">Custom Alerts</h2>
        <button
          onClick={() => { if (!alertsAtLimit) { setShowForm(v => !v); setError(''); } }}
          disabled={alertsAtLimit && !showForm}
          title={alertsAtLimit && !showForm ? 'Alert limit reached — upgrade your plan' : undefined}
          className="flex items-center space-x-1 text-sm font-medium transition-colors disabled:opacity-40 disabled:cursor-not-allowed text-brand-primary hover:text-brand-primary/80"
        >
          <Icon name={showForm ? 'XMarkIcon' : 'PlusIcon'} size={16} />
          <span>{showForm ? 'Cancel' : 'New Alert'}</span>
        </button>
      </div>
      {alertsAtLimit && !showForm && (
        <div className="flex items-center gap-2 mb-3 px-3 py-2 bg-error/10 border border-error/20 rounded-lg text-xs text-error">
          <Icon name="ExclamationTriangleIcon" size={14} className="flex-shrink-0" />
          <span>Alert limit reached ({alerts.length}/{subscription.alertsLimit}). <a href="/pricing" className="underline font-semibold">Upgrade</a> to add more.</span>
        </div>
      )}

      {/* Create form */}
      {showForm && (
        <form onSubmit={handleCreate} className="mb-4 p-4 bg-surface rounded-lg border border-border space-y-3">
          <div>
            <label className="block text-xs font-semibold text-foreground mb-1">Alert Title *</label>
            <input
              type="text"
              value={form.title}
              onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
              placeholder="e.g. PayPal phishing"
              className="w-full px-3 py-2 text-sm bg-card border border-border rounded-md text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-brand-primary"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-foreground mb-1">Keyword *</label>
            <input
              type="text"
              value={form.keyword}
              onChange={e => setForm(f => ({ ...f, keyword: e.target.value }))}
              placeholder="e.g. paypal, account-verify"
              className="w-full px-3 py-2 text-sm bg-card border border-border rounded-md text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-brand-primary"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-foreground mb-1">Threat Type</label>
              <select
                value={form.threat_type}
                onChange={e => setForm(f => ({ ...f, threat_type: e.target.value }))}
                className="w-full px-3 py-2 text-sm bg-card border border-border rounded-md text-foreground focus:outline-none focus:ring-2 focus:ring-brand-primary"
              >
                {THREAT_TYPES.map(t => <option key={t} value={t}>{t || 'Any'}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-foreground mb-1">Min Severity</label>
              <select
                value={form.min_severity}
                onChange={e => setForm(f => ({ ...f, min_severity: e.target.value }))}
                className="w-full px-3 py-2 text-sm bg-card border border-border rounded-md text-foreground focus:outline-none focus:ring-2 focus:ring-brand-primary"
              >
                {SEVERITIES.map(s => <option key={s} value={s}>{s || 'Any'}</option>)}
              </select>
            </div>
          </div>
          {error && <p className="text-xs text-error">{error}</p>}
          <button
            type="submit"
            disabled={saving}
            className="w-full py-2 text-sm font-semibold bg-brand-primary text-white rounded-md hover:bg-brand-primary/90 disabled:opacity-60 transition-colors"
          >
            {saving ? 'Creating…' : 'Create Alert'}
          </button>
        </form>
      )}

      {/* Alert list */}
      <div className="space-y-3">
        {alerts.map((alert) => (
          <div
            key={alert.id}
            className="flex items-start justify-between p-4 bg-surface rounded-lg hover:bg-surface/80 transition-colors"
          >
            <div className="flex items-start space-x-3 flex-1 min-w-0">
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-brand-primary/10 flex items-center justify-center mt-0.5">
                <Icon name={getCategoryIcon(alert.category) as any} size={20} className="text-brand-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-semibold text-foreground mb-1 truncate">{alert.title}</h3>
                <p className="text-xs text-muted-foreground mb-2">{alert.description}</p>
                <div className="flex items-center space-x-3 text-xs text-muted-foreground">
                  <span className="flex items-center space-x-1">
                    <Icon name="TagIcon" size={14} />
                    <span>{alert.category}</span>
                  </span>
                  <span className="flex items-center space-x-1">
                    <Icon name="ClockIcon" size={14} />
                    <span>{alert.frequency}</span>
                  </span>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-2 flex-shrink-0 ml-3">
              {/* Toggle */}
              <button
                onClick={() => handleToggle(alert)}
                disabled={togglingId === alert.id}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors disabled:opacity-60 ${
                  alert.enabled ? 'bg-brand-accent' : 'bg-muted'
                }`}
                aria-label={`Toggle ${alert.title}`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    alert.enabled ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
              {/* Delete */}
              <button
                onClick={() => handleDelete(alert)}
                disabled={deletingId === alert.id}
                className="p-1.5 text-muted-foreground hover:text-error transition-colors disabled:opacity-40 rounded-md hover:bg-error/10"
                aria-label={`Delete ${alert.title}`}
              >
                {deletingId === alert.id
                  ? <Icon name="ArrowPathIcon" size={16} className="animate-spin" />
                  : <Icon name="TrashIcon" size={16} />
                }
              </button>
            </div>
          </div>
        ))}
      </div>

      {alerts.length === 0 && !showForm && (
        <div className="text-center py-8">
          <Icon name="BellSlashIcon" size={48} className="text-muted-foreground mx-auto mb-3" />
          <p className="text-sm text-muted-foreground mb-3">No alerts configured yet</p>
          <button
            onClick={() => setShowForm(true)}
            className="px-4 py-2 text-sm font-cta font-semibold text-brand-primary border border-brand-primary hover:bg-brand-primary hover:text-white rounded-md transition-colors"
          >
            Create First Alert
          </button>
        </div>
      )}
    </div>
  );
}
