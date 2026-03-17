'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import ScanTypeSelector from './ScanTypeSelector';
import EmailScanner from './EmailScanner';
import URLScanner from './URLScanner';
import FileScanner from './FileScanner';
import QRScanner from './QRScanner';
import ThreatIndicator from './ThreatIndicator';
import ThreatDetails from './ThreatDetails';
import RecommendedActions from './RecommendedActions';
import ScanHistory from './ScanHistory';
import LiveThreatStats from './LiveThreatStats';
import ReportThreatModal from './ReportThreatModal';
import AiScanCommentary from './AiScanCommentary';
import { ScannerService, ScanResult as RealScanResult } from '@/services/ScannerService';
import { useAuth } from '@/contexts/AuthContext';
import { useSubscription } from '@/contexts/SubscriptionContext';
import { toast } from 'sonner';

interface ScanResult {
  threatLevel: 'safe' | 'low' | 'medium' | 'high' | 'critical';
  score: number;
  details: Array<{
    category: string;
    severity: 'safe' | 'warning' | 'danger';
    finding: string;
    explanation: string;
  }>;
  actions: Array<{
    title: string;
    description: string;
    icon: string;
    link: string;
    type: 'primary' | 'secondary';
  }>;
}

export default function ScanDetectInteractive() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const { subscription, isAtLimit } = useSubscription();
  const [selectedScanType, setSelectedScanType] = useState('email');
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState<ScanResult | null>(null);
  const [scanContent, setScanContent] = useState('');
  const [scanError, setScanError] = useState('');
  const [history, setHistory] = useState<any[]>([]);
  const [stats, setStats] = useState<any[]>([]);
  const [showReportModal, setShowReportModal] = useState(false);

  useEffect(() => {
    if (!loading && !user) router.push('/login');
  }, [loading, user]);

  useEffect(() => {
    if (!user) return; // wait for auth to resolve
    loadStats();
    loadHistory();
  }, [user]);

  const loadStats = async () => {
    try {
      const data = await ScannerService.getScanStats();
      if (!data) throw new Error('no data');
      setStats([
        {
          label: 'Threats Blocked Today',
          value: String(data.threatsBlockedToday ?? data.threats_today ?? 0),
          icon: 'ShieldCheckIcon',
          trend: '+live',
          trendUp: true,
        },
        {
          label: 'Total Scans',
          value: String(data.totalScans ?? data.total_scans ?? 0),
          icon: 'MagnifyingGlassIcon',
          trend: '+live',
          trendUp: true,
        },
        {
          label: 'Active Users',
          value: String(data.activeScans ?? data.active_users ?? 0),
          icon: 'UsersIcon',
          trend: '+live',
          trendUp: true,
        },
        {
          label: 'Detection Rate',
          value: data.detectionRate ?? data.detection_rate ?? 'N/A',
          icon: 'ChartBarIcon',
          trend: '+live',
          trendUp: true,
        },
      ]);
    } catch {
      setStats([
        { label: 'Threats Blocked Today', value: '--', icon: 'ShieldCheckIcon', trend: '', trendUp: true },
        { label: 'Total Scans', value: '--', icon: 'MagnifyingGlassIcon', trend: '', trendUp: true },
        { label: 'Active Users', value: '--', icon: 'UsersIcon', trend: '', trendUp: true },
        { label: 'Detection Rate', value: '--', icon: 'ChartBarIcon', trend: '', trendUp: true },
      ]);
    }
  };

  const loadHistory = async () => {
    if (!user) return;
    try {
      const data = await ScannerService.getRecentScans(user.id);
      const scans = Array.isArray(data) ? data : (data as any).results ?? [];
      setHistory(
        scans.map((s: any) => ({
          id: s.id,
          type: s.type,
          content: s.content,
          timestamp: new Date(s.created_at).toLocaleString(),
          threatLevel: s.threat_level,
          score: s.score,
          details: Array.isArray(s.details) ? s.details : [],
        }))
      );
    } catch { /* silently ignore */ }
  };

  const handleScan = async (content: string | File) => {
    if (typeof content !== 'string') return;
    if (isAtLimit('scans')) {
      setScanError('Scan limit reached. Upgrade your plan to continue scanning.');
      toast.error('Scan limit reached — upgrade your plan to continue.');
      return;
    }
    setIsScanning(true);
    setScanResult(null);
    setScanError('');
    setScanContent(content);

    try {
      const result = await ScannerService.performScan(selectedScanType as any, content);
      setScanResult(result as any);
      loadHistory();
      const level = (result as any).threatLevel;
      if (level === 'safe' || level === 'low') {
        toast.success('Scan complete — no significant threats detected');
      } else if (level === 'medium') {
        toast.warning('Scan complete — potential threats found');
      } else {
        toast.error(`Scan complete — ${level} threat detected`);
      }
    } catch (error: any) {
      setScanError(error.message || 'Scan failed. Please try again.');
      toast.error(error.message || 'Scan failed. Please try again.');
    } finally {
      setIsScanning(false);
    }
  };

  const handleViewDetails = (_id: string) => { /* handled inline in ScanHistory */ };

  if (loading || !user) {
    return (
      <div className="animate-pulse space-y-8">
        <div className="h-12 bg-surface rounded-lg w-1/3" />
        <div className="h-64 bg-surface rounded-lg" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <LiveThreatStats stats={stats} />

      <div className="bg-card border border-border rounded-lg p-6 lg:p-8">
        <div className="mb-6">
          <h2 className="text-2xl font-headline font-bold text-foreground mb-2">
            Select Scan Type
          </h2>
          <p className="text-muted-foreground">
            Choose what you want to scan for potential threats
          </p>
        </div>

        <ScanTypeSelector selectedType={selectedScanType} onScanTypeChange={setSelectedScanType} />

        {isAtLimit('scans') && (
          <div className="mt-6 flex items-start gap-3 p-4 bg-error/10 border border-error/30 rounded-lg">
            <svg className="flex-shrink-0 w-5 h-5 text-error mt-0.5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10A8 8 0 11 2 10a8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
            <div className="flex-1">
              <p className="text-sm font-semibold text-error">Scan limit reached</p>
              <p className="text-xs text-error/80 mt-0.5">
                You&apos;ve used {subscription.scansUsed}/{subscription.scansLimit} scans this month.
              </p>
            </div>
            <button
              onClick={() => router.push('/pricing')}
              className="flex-shrink-0 px-3 py-1.5 text-xs font-semibold bg-error text-white rounded-md hover:bg-error/90 transition-colors"
            >
              Upgrade
            </button>
          </div>
        )}

        {scanError && !isAtLimit('scans') && (
          <div className="mt-4 p-3 bg-error/10 border border-error/30 rounded-lg">
            <p className="text-sm text-error">{scanError}</p>
          </div>
        )}

        <div className="mt-8">
          {selectedScanType === 'email' && (
            <EmailScanner onScan={handleScan} isScanning={isScanning} disabled={isAtLimit('scans')} />
          )}
          {selectedScanType === 'url' && <URLScanner onScan={handleScan} isScanning={isScanning} disabled={isAtLimit('scans')} />}
          {selectedScanType === 'file' && (
            <FileScanner onScan={handleScan} isScanning={isScanning} disabled={isAtLimit('scans')} />
          )}
          {selectedScanType === 'qr' && <QRScanner onScan={handleScan} isScanning={isScanning} disabled={isAtLimit('scans')} />}
        </div>
      </div>

      {scanResult && (
        <div className="bg-card border border-border rounded-lg p-6 lg:p-8 space-y-8">
          <div>
            <h2 className="text-2xl font-headline font-bold text-foreground mb-6">Scan Results</h2>
            <ThreatIndicator level={scanResult.threatLevel} score={scanResult.score} />
          </div>

          <AiScanCommentary
            scanType={selectedScanType}
            content={scanContent}
            threatLevel={scanResult.threatLevel}
            score={scanResult.score}
            details={scanResult.details}
          />

          <ThreatDetails details={scanResult.details} />

          <RecommendedActions
            actions={scanResult.actions}
            onReportThreat={() => setShowReportModal(true)}
          />
        </div>
      )}

      <div className="bg-card border border-border rounded-lg p-6 lg:p-8">
        <ScanHistory history={history} onViewDetails={handleViewDetails} />
      </div>

      {showReportModal && scanResult && (
        <ReportThreatModal
          scanDetails={{
            scanType: selectedScanType,
            content: scanContent,
            threatLevel: scanResult.threatLevel,
            details: scanResult.details,
          }}
          onClose={() => setShowReportModal(false)}
        />
      )}
    </div>
  );
}
