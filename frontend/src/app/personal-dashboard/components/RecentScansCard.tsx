'use client';
import { useRouter } from 'next/navigation';
import Icon from '@/components/ui/AppIcon';

interface Scan {
  id: string;
  url: string;
  result: 'safe' | 'suspicious' | 'dangerous';
  timestamp: string;
  threatType?: string;
}

interface RecentScansCardProps {
  scans: Scan[];
}

export default function RecentScansCard({ scans }: RecentScansCardProps) {
  const router = useRouter();
  const getResultIcon = (result: string) => {
    if (result === 'safe') return 'CheckCircleIcon';
    if (result === 'suspicious') return 'ExclamationTriangleIcon';
    return 'XCircleIcon';
  };

  const getResultColor = (result: string) => {
    if (result === 'safe') return 'text-success';
    if (result === 'suspicious') return 'text-warning';
    return 'text-error';
  };

  const getResultBg = (result: string) => {
    if (result === 'safe') return 'bg-success/10';
    if (result === 'suspicious') return 'bg-warning/10';
    return 'bg-error/10';
  };

  return (
    <div className="bg-card rounded-lg shadow-md p-6 border border-border">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-headline font-bold text-foreground">Recent Scans</h2>
        <button
          onClick={() => router.push('/scan-detect-hub')}
          className="text-sm text-brand-primary hover:text-brand-primary/80 font-medium transition-colors"
        >
          View All
        </button>
      </div>

      <div className="space-y-3">
        {scans.map((scan) => (
          <div
            key={scan.id}
            onClick={() => router.push('/scan-detect-hub')}
            className="flex items-center justify-between p-3 bg-surface rounded-lg hover:bg-surface/80 transition-colors cursor-pointer"
          >
            <div className="flex items-center space-x-3 flex-1 min-w-0">
              <div className={`flex-shrink-0 w-10 h-10 rounded-full ${getResultBg(scan.result)} flex items-center justify-center`}>
                <Icon name={getResultIcon(scan.result) as any} size={20} className={getResultColor(scan.result)} variant="solid" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-foreground truncate">{scan.url}</div>
                <div className="text-xs text-muted-foreground">{scan.timestamp}</div>
              </div>
            </div>
            <div className="flex-shrink-0 ml-3">
              <span className={`text-xs font-semibold ${getResultColor(scan.result)} capitalize`}>
                {scan.result}
              </span>
            </div>
          </div>
        ))}
      </div>

      {scans.length === 0 && (
        <div className="text-center py-8">
          <Icon name="MagnifyingGlassIcon" size={48} className="text-muted-foreground mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">No scans yet. Start protecting yourself!</p>
        </div>
      )}
    </div>
  );
}