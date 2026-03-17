'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Icon from '@/components/ui/AppIcon';
import { useAuth } from '@/contexts/AuthContext';
import { AdminService } from '@/services/AdminService';
import { toast } from 'sonner';

// ── Types ──────────────────────────────────────────────────────────────────────
interface AdminUser {
  id: number;
  username: string;
  email: string;
  date_joined: string;
  scans_count: number;
  profile: {
    role: string;
    tier: string;
    status: string;
    scans_used: number;
    points: number;
    streak: number;
  };
}

interface ThreatReport {
  id: number;
  title: string;
  description: string;
  threat_type: string;
  risk_level: string;
  evidence: string | null;
  status: string;
  username: string;
  created_at: string;
}

interface ScanRecord {
  id: number;
  username: string;
  type: string;
  content: string;
  threat_level: string;
  score: number;
  created_at: string;
}

interface SystemLog {
  id: number;
  level: string;
  message: string;
  created_at: string;
}

interface QuizQuestion {
  id: number;
  question: string;
  options: [string, string, string, string];
  correctAnswer: number;
  explanation: string;
}

interface AdminModule {
  id: number;
  title: string;
  description: string;
  type: string;
  difficulty: string;
  duration: string;
  points: number;
  icon: string;
  completions: number;
  has_content: boolean;
  content_data: { questions?: QuizQuestion[] };
}

interface AdminTrustSignal {
  id: number;
  type: 'certification' | 'award' | 'partnership';
  name: string;
  description: string;
  logo: string;
  alt: string;
}

interface AdminComment {
  threat_id: string;
  threat_title: string;
  comment_index: number;
  user: string;
  date: string;
  insight: string;
}

interface AdminBookmark {
  id: number;
  username: string;
  threat_id: string;
  threat_title: string;
  threat_type: string;
  threat_severity: string;
  created_at: string;
}

interface AdminAlert {
  id: number;
  username: string;
  title: string;
  keyword: string;
  threat_type: string;
  min_severity: string;
  active: boolean;
  created_at: string;
}

interface AdminThreatDB {
  id: number;
  threat_id: string;
  title: string;
  type: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  detected_date: string;
  affected_users: number;
  description: string;
  image: string;
  alt: string;
  origin: string;
  status: 'active' | 'mitigated' | 'archived';
  community_reports: number;
  detailed_analysis: string;
  prevention_tips: string[];
  real_world_examples: string[];
  related_threats: string[];
  community_insights: { user: string; comment: string; date: string }[];
}

// ── StatCard ───────────────────────────────────────────────────────────────────
const StatCard = ({ title, value, change, positive, icon, color }: any) => (
  <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
    <div className="flex items-center justify-between mb-4">
      <div className={`flex items-center justify-center w-12 h-12 rounded-lg ${color}`}>
        <Icon name={icon as any} size={24} className="text-white" />
      </div>
      <span className={`text-sm font-medium px-2 py-1 rounded-full ${
        positive
          ? 'text-green-600 bg-green-100 dark:bg-green-900/30'
          : 'text-red-500 bg-red-100 dark:bg-red-900/30'
      }`}>{change}</span>
    </div>
    <div className="text-2xl font-bold text-primary mb-1">
      {typeof value === 'number' ? value.toLocaleString() : value}
    </div>
    <div className="text-sm text-muted-foreground">{title}</div>
  </div>
);

// ── UserRow ────────────────────────────────────────────────────────────────────
const UserRow = ({ user, onUpdate, onRequestConfirm }: { user: AdminUser; onUpdate: () => void; onRequestConfirm: (title: string, message: string, onConfirm: () => void, danger?: boolean, confirmLabel?: string) => void }) => {
  const [tierOpen, setTierOpen] = useState(false);
  const tierRef = useRef<HTMLDivElement>(null);
  const { id, email, date_joined, scans_count, profile } = user;

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (tierRef.current && !tierRef.current.contains(e.target as Node)) setTierOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const statusColors: Record<string, string> = {
    active: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
    inactive: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400',
    suspended: 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400',
  };

  const tierColors: Record<string, string> = {
    free: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400',
    pro: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    enterprise: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  };

  const handleToggleStatus = async () => {
    const newStatus = profile.status === 'active' ? 'suspended' : 'active';
    await AdminService.updateUserStatus(id, newStatus, profile.role);
    toast.success(newStatus === 'active' ? 'User activated' : 'User suspended');
    onUpdate();
  };

  const handleToggleAdmin = () => {
    const newRole = profile.role === 'admin' ? 'user' : 'admin';
    if (newRole === 'admin') {
      onRequestConfirm(
        'Grant Admin Privileges',
        `Grant admin privileges to ${email}?`,
        async () => { await AdminService.updateUserStatus(id, profile.status, 'admin'); toast.success('Admin privileges granted'); onUpdate(); },
        false,
        'Grant Access',
      );
    } else {
      AdminService.updateUserStatus(id, profile.status, 'user').then(() => { toast.success('Admin privileges revoked'); onUpdate(); });
    }
  };

  const handleTierChange = async (tier: string) => {
    setTierOpen(false);
    await AdminService.changeTier(id, tier);
    toast.success(`User tier changed to ${tier}`);
    onUpdate();
  };

  const handleDelete = () => {
    onRequestConfirm(
      'Delete User',
      `Permanently delete ${email}? This cannot be undone.`,
      async () => { await AdminService.deleteUser(id); toast.success('User deleted'); onUpdate(); },
    );
  };

  return (
    <tr className="border-b border-border hover:bg-surface/50 transition-colors">
      <td className="px-4 py-3">
        <div className="flex items-center space-x-2">
          <div className="flex items-center justify-center w-8 h-8 bg-brand-primary/10 rounded-full flex-shrink-0">
            <Icon name="UserCircleIcon" size={18} className="text-brand-primary" />
          </div>
          <div>
            <p className="text-sm font-medium text-foreground">{email}</p>
            <p className="text-xs text-muted-foreground">@{user.username}</p>
          </div>
        </div>
      </td>
      <td className="px-4 py-3">
        <span className={`text-xs font-semibold px-2 py-1 rounded-full ${
          profile.role === 'admin'
            ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400'
            : 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
        }`}>{profile.role}</span>
      </td>
      <td className="px-4 py-3">
        <span className={`text-xs font-semibold px-2 py-1 rounded-full capitalize ${tierColors[profile.tier] || tierColors.free}`}>
          {profile.tier || 'free'}
        </span>
      </td>
      <td className="px-4 py-3">
        <span className={`text-xs font-semibold px-2 py-1 rounded-full ${statusColors[profile.status?.toLowerCase()] || statusColors.active}`}>
          {profile.status || 'active'}
        </span>
      </td>
      <td className="px-4 py-3 text-sm text-muted-foreground">
        {new Date(date_joined).toLocaleDateString()}
      </td>
      <td className="px-4 py-3 text-sm font-medium text-foreground">{scans_count.toLocaleString()}</td>
      <td className="px-4 py-3">
        <div className="flex items-center space-x-1">
          <button onClick={handleToggleStatus}
            title={profile.status === 'active' ? 'Suspend user' : 'Activate user'}
            className="p-1.5 text-muted-foreground hover:text-amber-500 hover:bg-surface rounded transition-colors">
            <Icon name={profile.status === 'active' ? 'NoSymbolIcon' : 'CheckCircleIcon'} size={15} />
          </button>
          <button onClick={handleToggleAdmin}
            title={profile.role === 'admin' ? 'Remove admin' : 'Make admin'}
            className={`p-1.5 rounded transition-colors ${
              profile.role === 'admin'
                ? 'text-purple-500 hover:bg-purple-50 dark:hover:bg-purple-900/20'
                : 'text-muted-foreground hover:text-purple-500 hover:bg-surface'
            }`}>
            <Icon name="LockClosedIcon" size={15} />
          </button>
          <div ref={tierRef} className="relative">
            <button onClick={() => setTierOpen(!tierOpen)} title="Change tier"
              className="p-1.5 text-muted-foreground hover:text-blue-500 hover:bg-surface rounded transition-colors">
              <Icon name="CreditCardIcon" size={15} />
            </button>
            {tierOpen && (
              <div className="absolute right-0 top-8 z-30 bg-card border border-border rounded-lg shadow-xl overflow-hidden min-w-[110px]">
                <p className="px-3 py-1.5 text-xs font-semibold text-muted-foreground uppercase border-b border-border">Change Tier</p>
                {(['free', 'pro', 'enterprise'] as const).map((t) => (
                  <button key={t} onClick={() => handleTierChange(t)}
                    className={`flex items-center w-full px-3 py-2 text-sm text-left hover:bg-surface transition-colors capitalize ${
                      profile.tier === t ? 'font-bold text-brand-primary' : 'text-foreground'
                    }`}>
                    {profile.tier === t && <Icon name="CheckIcon" size={12} className="mr-1.5" />}
                    {t}
                  </button>
                ))}
              </div>
            )}
          </div>
          <button onClick={handleDelete} title="Delete user"
            className="p-1.5 text-muted-foreground hover:text-red-600 hover:bg-surface rounded transition-colors">
            <Icon name="TrashIcon" size={15} />
          </button>
        </div>
      </td>
    </tr>
  );
};

// ── ReportRow ──────────────────────────────────────────────────────────────────
const riskColors: Record<string, string> = {
  critical: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  high: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
  medium: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
  low: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
};

const reportStatusColors: Record<string, string> = {
  pending: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400',
  approved: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  investigating: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
  resolved: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  rejected: 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400',
};

const ReportRow = ({ report, onUpdate }: { report: ThreatReport; onUpdate: () => void }) => {
  const [expanded, setExpanded] = useState(false);

  const updateStatus = async (newStatus: string) => {
    await AdminService.updateReportStatus(report.id, newStatus);
    toast.success('Report status updated');
    onUpdate();
  };

  return (
    <>
      <tr
        className={`border-b border-border hover:bg-surface/30 transition-colors cursor-pointer ${expanded ? 'bg-surface/50' : ''}`}
        onClick={() => setExpanded(!expanded)}
      >
        <td className="px-4 py-3">
          <div className="flex items-center space-x-2">
            <Icon name={expanded ? 'ChevronDownIcon' : 'ChevronRightIcon'} size={14} className="text-muted-foreground flex-shrink-0" />
            <span className="text-sm font-medium text-foreground">{report.title}</span>
          </div>
        </td>
        <td className="px-4 py-3 text-sm text-muted-foreground">{report.threat_type}</td>
        <td className="px-4 py-3">
          <span className={`text-xs font-semibold px-2 py-1 rounded-full ${riskColors[report.risk_level?.toLowerCase()] || riskColors.medium}`}>
            {report.risk_level}
          </span>
        </td>
        <td className="px-4 py-3 text-sm text-muted-foreground">{report.username}</td>
        <td className="px-4 py-3 text-xs text-muted-foreground">{new Date(report.created_at).toLocaleDateString()}</td>
        <td className="px-4 py-3">
          <span className={`text-xs font-semibold px-2 py-1 rounded-full capitalize ${reportStatusColors[report.status?.toLowerCase()] || reportStatusColors.pending}`}>
            {report.status}
          </span>
        </td>
        <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
          <div className="flex space-x-1">
            {report.status === 'pending' && (
              <>
                <button onClick={() => updateStatus('approved')} title="Approve"
                  className="p-1.5 text-green-500 hover:bg-green-50 dark:hover:bg-green-900/20 rounded transition-colors">
                  <Icon name="CheckIcon" size={15} />
                </button>
                <button onClick={() => updateStatus('investigating')} title="Mark Investigating"
                  className="p-1.5 text-yellow-500 hover:bg-yellow-50 dark:hover:bg-yellow-900/20 rounded transition-colors">
                  <Icon name="MagnifyingGlassIcon" size={15} />
                </button>
                <button onClick={() => updateStatus('rejected')} title="Reject"
                  className="p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors">
                  <Icon name="XMarkIcon" size={15} />
                </button>
              </>
            )}
            {(report.status === 'investigating' || report.status === 'approved') && (
              <button onClick={() => updateStatus('resolved')} title="Mark Resolved"
                className="p-1.5 text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded transition-colors">
                <Icon name="ShieldCheckIcon" size={15} />
              </button>
            )}
          </div>
        </td>
      </tr>
      {expanded && (
        <tr className="border-b border-border bg-surface/20">
          <td colSpan={7} className="px-6 py-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-xs font-semibold uppercase text-muted-foreground mb-1">Description</p>
                <p className="text-sm text-foreground leading-relaxed">{report.description || 'No description provided.'}</p>
              </div>
              {report.evidence && (
                <div>
                  <p className="text-xs font-semibold uppercase text-muted-foreground mb-1">Evidence</p>
                  <p className="text-xs font-mono bg-card border border-border rounded-lg p-3 break-all text-foreground">{report.evidence}</p>
                </div>
              )}
            </div>
          </td>
        </tr>
      )}
    </>
  );
};

// ── Threat level colours ───────────────────────────────────────────────────────
const threatLevelColors: Record<string, string> = {
  safe: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  low: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  medium: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
  high: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
  critical: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
};

// ── FilterPills ────────────────────────────────────────────────────────────────
const FilterPills = ({
  options, active, onChange, badges,
}: { options: string[]; active: string; onChange: (v: string) => void; badges?: Record<string, number>; }) => (
  <div className="flex flex-wrap gap-2">
    {options.map((opt) => (
      <button key={opt} onClick={() => onChange(opt)}
        className={`px-3 py-1.5 text-xs font-semibold rounded-full capitalize transition-colors ${
          active === opt ? 'bg-brand-primary text-white' : 'bg-surface text-muted-foreground hover:text-foreground'
        }`}>
        {opt}
        {badges && badges[opt] != null && badges[opt] > 0 && (
          <span className="ml-1.5 bg-red-500 text-white text-xs font-bold px-1.5 py-0.5 rounded-full">
            {badges[opt]}
          </span>
        )}
      </button>
    ))}
  </div>
);

// ── ConfirmModal ──────────────────────────────────────────────────────────────
interface ConfirmModalProps {
  open: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  danger?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}
const ConfirmModal = ({ open, title, message, confirmLabel = 'Delete', danger = true, onConfirm, onCancel }: ConfirmModalProps) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onCancel} />
      <div className="relative bg-card border border-border rounded-2xl shadow-2xl w-full max-w-md p-6 space-y-4">
        <div className="flex items-start space-x-3">
          <div className={`flex-shrink-0 flex items-center justify-center w-10 h-10 rounded-full ${
            danger ? 'bg-red-100 dark:bg-red-900/30' : 'bg-amber-100 dark:bg-amber-900/30'
          }`}>
            <Icon name="ExclamationTriangleIcon" size={20} className={danger ? 'text-red-500' : 'text-amber-500'} />
          </div>
          <div>
            <h3 className="text-base font-semibold text-foreground">{title}</h3>
            <p className="text-sm text-muted-foreground mt-1">{message}</p>
          </div>
        </div>
        <div className="flex items-center justify-end space-x-3 pt-2">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-sm font-medium text-foreground bg-surface border border-border rounded-lg hover:bg-card transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={() => { onConfirm(); onCancel(); }}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors text-white ${
              danger ? 'bg-red-500 hover:bg-red-600' : 'bg-amber-500 hover:bg-amber-600'
            }`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
};

type AdminTab = 'overview' | 'users' | 'threats' | 'scans' | 'modules' | 'comments' | 'bookmarks' | 'alerts' | 'partnerships' | 'database' | 'system';

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<AdminTab>('overview');
  const [overview, setOverview] = useState<any>(null);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [reports, setReports] = useState<ThreatReport[]>([]);
  const [scans, setScans] = useState<ScanRecord[]>([]);
  const [logs, setLogs] = useState<SystemLog[]>([]);
  const [logCounts, setLogCounts] = useState<Record<string, number>>({ INFO: 0, WARN: 0, ERROR: 0 });
  const [modules, setModules] = useState<AdminModule[]>([]);
  const [moduleForm, setModuleForm] = useState<Partial<AdminModule> | null>(null);
  const [moduleFormMode, setModuleFormMode] = useState<'create' | 'edit'>('create');
  const [comments, setComments] = useState<AdminComment[]>([]);
  const [bookmarks, setBookmarks] = useState<AdminBookmark[]>([]);
  const [alerts, setAlerts] = useState<AdminAlert[]>([]);
  const [learningStats, setLearningStats] = useState<any>(null);
  const [trustSignals, setTrustSignals] = useState<AdminTrustSignal[]>([]);
  const [tsForm, setTsForm] = useState<Partial<AdminTrustSignal> | null>(null);
  const [tsFormMode, setTsFormMode] = useState<'create' | 'edit'>('create');
  const [tsSearch, setTsSearch] = useState('');
  const [threatDB, setThreatDB] = useState<AdminThreatDB[]>([]);
  const [threatDBForm, setThreatDBForm] = useState<Partial<AdminThreatDB> | null>(null);
  const [threatDBFormMode, setThreatDBFormMode] = useState<'create' | 'edit'>('create');
  const [threatDBSearch, setThreatDBSearch] = useState('');
  const [threatDBTipInput, setThreatDBTipInput] = useState('');
  const [threatDBExInput, setThreatDBExInput] = useState('');
  const [loadingData, setLoadingData] = useState(true);
  const [userSearch, setUserSearch] = useState('');
  const [reportFilter, setReportFilter] = useState('all');
  const [scanFilter, setScanFilter] = useState('all');
  const [logFilter, setLogFilter] = useState('all');
  const [commentSearch, setCommentSearch] = useState('');
  const [bookmarkSearch, setBookmarkSearch] = useState('');
  const [alertSearch, setAlertSearch] = useState('');
  const [confirmModal, setConfirmModal] = useState<{ open: boolean; title: string; message: string; danger: boolean; confirmLabel?: string; onConfirm: () => void }>({
    open: false, title: '', message: '', danger: true, onConfirm: () => {},
  });
  const requestConfirm = (title: string, message: string, onConfirm: () => void, danger = true, confirmLabel?: string) =>
    setConfirmModal({ open: true, title, message, danger, confirmLabel, onConfirm });
  const closeConfirm = () => setConfirmModal((prev) => ({ ...prev, open: false }));

  const { user, signOut, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push('/login');
      } else if (user.profile?.role !== 'admin') {
        router.push('/homepage');
      } else {
        loadAllData();
      }
    }
  }, [user, loading]);

  const loadAllData = async () => {
    setLoadingData(true);
    const [ov, us, rep, sc, lg, mods, cmts, bms, als, ls, tss, tdb] = await Promise.all([
      AdminService.getOverview(),
      AdminService.getUsers(),
      AdminService.getReports(),
      AdminService.getScanHistory(),
      AdminService.getLogs(),
      AdminService.getModules(),
      AdminService.getComments(),
      AdminService.getAllBookmarks(),
      AdminService.getAllAlerts(),
      AdminService.getLearningStats(),
      AdminService.getTrustSignals(),
      AdminService.getThreatDB(),
    ]);
    setOverview(ov);
    setUsers(us ?? []);
    setReports(rep ?? []);
    setScans(sc ?? []);
    applyLogs(lg);
    setModules(mods ?? []);
    setComments(cmts ?? []);
    setBookmarks(bms ?? []);
    setAlerts(als ?? []);
    setLearningStats(ls);
    setTrustSignals(tss ?? []);
    setThreatDB(tdb ?? []);
    setLoadingData(false);
  };

  const applyLogs = (lg: any) => {
    if (lg && lg.logs) {
      setLogs(lg.logs);
      setLogCounts(lg.counts ?? { INFO: 0, WARN: 0, ERROR: 0 });
    } else if (Array.isArray(lg)) {
      setLogs(lg);
    }
  };

  const loadLogs = async (level?: string) => {
    const lg = await AdminService.getLogs(level === 'all' ? undefined : level);
    applyLogs(lg);
  };

  const filteredUsers = users.filter(
    (u) =>
      u.email.toLowerCase().includes(userSearch.toLowerCase()) ||
      u.username.toLowerCase().includes(userSearch.toLowerCase()),
  );

  const pendingCount = reports.filter((r) => r.status === 'pending').length;
  const filteredReports = reportFilter === 'all' ? reports : reports.filter((r) => r.status === reportFilter);
  const filteredScans = scanFilter === 'all' ? scans : scans.filter((s) => s.threat_level === scanFilter);

  const filteredComments = comments.filter(
    (c) =>
      c.insight.toLowerCase().includes(commentSearch.toLowerCase()) ||
      c.user.toLowerCase().includes(commentSearch.toLowerCase()) ||
      c.threat_title.toLowerCase().includes(commentSearch.toLowerCase()),
  );
  const filteredBookmarks = bookmarks.filter(
    (b) =>
      b.username.toLowerCase().includes(bookmarkSearch.toLowerCase()) ||
      b.threat_title.toLowerCase().includes(bookmarkSearch.toLowerCase()),
  );
  const filteredAlerts = alerts.filter(
    (a) =>
      a.username.toLowerCase().includes(alertSearch.toLowerCase()) ||
      a.title.toLowerCase().includes(alertSearch.toLowerCase()) ||
      a.keyword.toLowerCase().includes(alertSearch.toLowerCase()),
  );

  const filteredTrustSignals = trustSignals.filter(
    (ts) =>
      ts.name.toLowerCase().includes(tsSearch.toLowerCase()) ||
      ts.description.toLowerCase().includes(tsSearch.toLowerCase()) ||
      ts.type.toLowerCase().includes(tsSearch.toLowerCase()),
  );

  const tabs: { id: AdminTab; label: string; icon: string; badge?: number }[] = [
    { id: 'overview', label: 'Overview', icon: 'Squares2X2Icon' },
    { id: 'users', label: 'Users', icon: 'UsersIcon' },
    { id: 'threats', label: 'Reports', icon: 'ExclamationTriangleIcon', badge: pendingCount },
    { id: 'scans', label: 'Scans', icon: 'MagnifyingGlassIcon' },
    { id: 'modules', label: 'Modules', icon: 'AcademicCapIcon' },
    { id: 'comments', label: 'Comments', icon: 'ChatBubbleLeftEllipsisIcon', badge: comments.length },
    { id: 'bookmarks', label: 'Bookmarks', icon: 'BookmarkIcon' },
    { id: 'alerts', label: 'Alerts', icon: 'BellIcon' },
    { id: 'partnerships', label: 'Partnerships', icon: 'BuildingOffice2Icon' },
    { id: 'database', label: 'Threat DB', icon: 'ShieldExclamationIcon', badge: threatDB.length },
    { id: 'system', label: 'System', icon: 'ServerIcon', badge: logCounts['ERROR'] || 0 },
  ];

  if (loading || loadingData) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-brand-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-foreground font-medium">Loading Admin Panel…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-card border-b border-border shadow-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Link href="/homepage" className="flex items-center space-x-2 hover:opacity-80 transition-opacity">
                <div className="flex items-center justify-center w-9 h-9 bg-gradient-to-br from-brand-primary to-brand-secondary rounded-lg">
                  <Icon name="ShieldCheckIcon" size={20} className="text-white" variant="solid" />
                </div>
                <span className="text-lg font-headline font-bold text-primary">PhishGuard</span>
              </Link>
              <div className="hidden sm:flex items-center space-x-2 px-3 py-1 bg-purple-100 dark:bg-purple-900/30 rounded-full">
                <Icon name="LockClosedIcon" size={14} className="text-purple-600 dark:text-purple-400" />
                <span className="text-xs font-semibold text-purple-700 dark:text-purple-400">Admin Panel</span>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-2 px-3 py-1.5 bg-surface rounded-lg">
                <Icon name="UserCircleIcon" size={18} className="text-brand-primary" />
                <span className="text-sm font-medium text-foreground">{user?.username || 'Admin'}</span>
              </div>
              <button
                onClick={async () => { await signOut(); router.push('/homepage'); }}
                className="text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 px-3 py-1.5 rounded-lg transition-colors"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 lg:px-8 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-headline font-bold text-primary">Admin Dashboard</h1>
          <p className="text-muted-foreground mt-1">Full control over users, threat reports, scans, and system health.</p>
        </div>

        <div className="flex space-x-1 bg-surface rounded-xl p-1 mb-8 overflow-x-auto">
          {tabs.map((tab) => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              className={`relative flex items-center space-x-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
                activeTab === tab.id ? 'bg-card text-brand-primary shadow-sm' : 'text-muted-foreground hover:text-foreground'
              }`}>
              <Icon name={tab.icon as any} size={16} />
              <span>{tab.label}</span>
              {tab.badge != null && tab.badge > 0 && (
                <span className="bg-red-500 text-white text-xs font-bold px-1.5 py-0.5 rounded-full leading-none">
                  {tab.badge}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* ── Overview ── */}
        {activeTab === 'overview' && overview && (
          <div className="space-y-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {(overview.stats || []).map((s: any, i: number) => <StatCard key={i} {...s} />)}
            </div>
            {overview.todayStats && (
              <div>
                <h2 className="text-base font-semibold text-muted-foreground uppercase tracking-wider mb-3">Today at a Glance</h2>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  {[
                    { label: 'New Users', val: overview.todayStats.newUsers, color: 'text-blue-500' },
                    { label: 'Scans', val: overview.todayStats.scansToday, color: 'text-green-500' },
                    { label: 'Threats Found', val: overview.todayStats.threatsToday, color: 'text-red-500' },
                    { label: 'New Reports', val: overview.todayStats.newReports, color: 'text-purple-500' },
                  ].map((item, i) => (
                    <div key={i} className="bg-card border border-border rounded-xl p-4 text-center">
                      <p className={`text-4xl font-bold ${item.color}`}>{item.val}</p>
                      <p className="text-xs text-muted-foreground mt-2">{item.label}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
            <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-primary mb-4 flex items-center space-x-2">
                <Icon name="ClockIcon" size={20} className="text-brand-primary" />
                <span>Recent System Activity</span>
              </h2>
              <div className="divide-y divide-border">
                {(overview.recentActivity || []).length === 0 ? (
                  <p className="text-sm text-muted-foreground py-2">No recent activity.</p>
                ) : (overview.recentActivity || []).map((item: any, i: number) => (
                  <div key={i} className="flex items-start space-x-3 py-3">
                    <Icon name="CommandLineIcon" size={16} className="mt-0.5 flex-shrink-0 text-brand-primary" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-foreground">{item.message}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {item.created_at ? new Date(item.created_at).toLocaleString() : 'N/A'}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── Users ── */}
        {activeTab === 'users' && (
          <div className="space-y-4">
            <div className="flex items-center space-x-3 flex-wrap gap-2">
              <div className="relative flex-1 min-w-[220px] max-w-sm">
                <Icon name="MagnifyingGlassIcon" size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input value={userSearch} onChange={(e) => setUserSearch(e.target.value)}
                  placeholder="Search by email or username…"
                  className="w-full pl-9 pr-4 py-2 text-sm bg-card border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-brand-primary/30" />
              </div>
              <span className="text-sm text-muted-foreground">{filteredUsers.length} of {users.length} users</span>
            </div>
            <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-foreground">
                  <thead className="bg-surface">
                    <tr>
                      {['User', 'Role', 'Tier', 'Status', 'Joined', 'Scans', 'Actions'].map((h) => (
                        <th key={h} className="px-4 py-3 text-left text-xs font-semibold uppercase text-muted-foreground">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.length === 0 ? (
                      <tr><td colSpan={7} className="px-4 py-8 text-center text-muted-foreground">No users found.</td></tr>
                    ) : filteredUsers.map((u) => (
                      <UserRow key={u.id} user={u} onUpdate={loadAllData} onRequestConfirm={requestConfirm} />
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ── Threat Reports ── */}
        {activeTab === 'threats' && (
          <div className="space-y-4">
            <FilterPills
              options={['all', 'pending', 'approved', 'investigating', 'resolved', 'rejected']}
              active={reportFilter}
              onChange={setReportFilter}
              badges={{ pending: pendingCount }}
            />
            <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-foreground">
                  <thead className="bg-surface">
                    <tr>
                      {['Title', 'Type', 'Risk', 'Reported By', 'Date', 'Status', 'Actions'].map((h) => (
                        <th key={h} className="px-4 py-3 text-left text-xs font-semibold uppercase text-muted-foreground">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filteredReports.length === 0 ? (
                      <tr><td colSpan={7} className="px-4 py-8 text-center text-muted-foreground">No threat reports found.</td></tr>
                    ) : filteredReports.map((r) => (
                      <ReportRow key={r.id} report={r} onUpdate={loadAllData} />
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ── Scans ── */}
        {activeTab === 'scans' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-3">
              <FilterPills
                options={['all', 'safe', 'low', 'medium', 'high', 'critical']}
                active={scanFilter}
                onChange={setScanFilter}
              />
              <span className="text-sm text-muted-foreground">{filteredScans.length} of {scans.length} scans</span>
            </div>
            <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-foreground">
                  <thead className="bg-surface">
                    <tr>
                      {['User', 'Type', 'Content', 'Score', 'Threat Level', 'Date', 'Actions'].map((h) => (
                        <th key={h} className="px-4 py-3 text-left text-xs font-semibold uppercase text-muted-foreground">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filteredScans.length === 0 ? (
                      <tr><td colSpan={7} className="px-4 py-8 text-center text-muted-foreground">No scans found.</td></tr>
                    ) : filteredScans.map((s, i) => (
                      <tr key={i} className="border-b border-border hover:bg-surface/50 transition-colors">
                        <td className="px-4 py-3 text-sm font-medium">{s.username}</td>
                        <td className="px-4 py-3">
                          <span className="text-xs font-medium px-2 py-1 bg-surface rounded capitalize">{s.type}</span>
                        </td>
                        <td className="px-4 py-3 text-sm text-muted-foreground max-w-xs truncate" title={s.content}>{s.content}</td>
                        <td className="px-4 py-3">
                          <span className={`text-sm font-bold ${s.score >= 70 ? 'text-red-500' : s.score >= 40 ? 'text-yellow-500' : 'text-green-500'}`}>
                            {s.score}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`text-xs font-semibold px-2 py-1 rounded-full capitalize ${threatLevelColors[s.threat_level] || threatLevelColors.safe}`}>
                            {s.threat_level}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-xs text-muted-foreground">{new Date(s.created_at).toLocaleString()}</td>
                        <td className="px-4 py-3">
                          <button
                            onClick={() => requestConfirm(
                              'Delete Scan',
                              `Delete this ${s.type.toUpperCase()} scan by ${s.username}? This cannot be undone.`,
                              async () => { await AdminService.deleteScan(s.id); toast.success('Scan deleted'); loadAllData(); },
                            )}
                            title="Delete scan"
                            className="p-1.5 text-muted-foreground hover:text-red-500 hover:bg-surface rounded transition-colors"
                          >
                            <Icon name="TrashIcon" size={15} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ── Learning Modules ── */}
        {activeTab === 'modules' && (
          <div className="space-y-6">
            {/* Learning stats */}
            {learningStats && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-card border border-border rounded-xl p-5 text-center">
                  <p className="text-4xl font-bold text-brand-primary">{learningStats.total_completions ?? 0}</p>
                  <p className="text-xs text-muted-foreground mt-2">Total Completions</p>
                </div>
                <div className="bg-card border border-border rounded-xl p-5 text-center">
                  <p className="text-4xl font-bold text-green-500">{learningStats.active_learners ?? 0}</p>
                  <p className="text-xs text-muted-foreground mt-2">Active Learners</p>
                </div>
                <div className="bg-card border border-border rounded-xl p-5 text-center">
                  <p className="text-4xl font-bold text-purple-500">{modules.length}</p>
                  <p className="text-xs text-muted-foreground mt-2">Total Modules</p>
                </div>
              </div>
            )}

            {/* Create / Edit form */}
            {moduleForm !== null && (
              <div className="bg-card border border-brand-primary/30 rounded-xl p-6 shadow-sm">
                <h3 className="text-base font-semibold text-primary mb-4">
                  {moduleFormMode === 'create' ? 'Create New Module' : `Edit: ${moduleForm.title}`}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    { label: 'Title', key: 'title', placeholder: 'Module title' },
                    { label: 'Duration', key: 'duration', placeholder: '15 min' },
                  ].map(({ label, key, placeholder }) => (
                    <div key={key}>
                      <label className="text-xs font-semibold text-muted-foreground uppercase mb-1 block">{label}</label>
                      <input
                        value={(moduleForm as any)[key] ?? ''}
                        onChange={(e) => setModuleForm({ ...moduleForm, [key]: e.target.value })}
                        placeholder={placeholder}
                        className="w-full px-3 py-2 text-sm bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-brand-primary/30"
                      />
                    </div>
                  ))}
                  <div>
                    <label className="text-xs font-semibold text-muted-foreground uppercase mb-1 block">Type</label>
                    <select value={moduleForm.type ?? 'Quiz'} onChange={(e) => setModuleForm({ ...moduleForm, type: e.target.value })}
                      className="w-full px-3 py-2 text-sm bg-background border border-border rounded-lg text-foreground focus:outline-none">
                      {['Quiz', 'Simulation', 'Assessment'].map((v) => <option key={v}>{v}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-muted-foreground uppercase mb-1 block">Difficulty</label>
                    <select value={moduleForm.difficulty ?? 'Beginner'} onChange={(e) => setModuleForm({ ...moduleForm, difficulty: e.target.value })}
                      className="w-full px-3 py-2 text-sm bg-background border border-border rounded-lg text-foreground focus:outline-none">
                      {['Beginner', 'Intermediate', 'Advanced', 'Expert'].map((v) => <option key={v}>{v}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-muted-foreground uppercase mb-1 block">Points</label>
                    <input type="number" value={moduleForm.points ?? 100}
                      onChange={(e) => setModuleForm({ ...moduleForm, points: Number(e.target.value) })}
                      className="w-full px-3 py-2 text-sm bg-background border border-border rounded-lg text-foreground focus:outline-none" />
                  </div>
                  <div className="md:col-span-2">
                    <label className="text-xs font-semibold text-muted-foreground uppercase mb-1 block">Description</label>
                    <textarea rows={3} value={moduleForm.description ?? ''}
                      onChange={(e) => setModuleForm({ ...moduleForm, description: e.target.value })}
                      className="w-full px-3 py-2 text-sm bg-background border border-border rounded-lg text-foreground focus:outline-none resize-none" />
                  </div>
                </div>

                {/* ── Quiz / Assessment Question Editor ── */}
                {((moduleForm.type ?? 'Quiz') === 'Quiz' || (moduleForm.type ?? 'Quiz') === 'Assessment') && (() => {
                  const questions: QuizQuestion[] = moduleForm.content_data?.questions ?? [];
                  const isAssessment = (moduleForm.type ?? 'Quiz') === 'Assessment';
                  const updateQuestions = (updated: QuizQuestion[]) =>
                    setModuleForm({ ...moduleForm, content_data: { ...moduleForm.content_data, questions: updated } });
                  const updateQ = (qi: number, patch: Partial<QuizQuestion>) => {
                    const next = questions.map((q, i) => i === qi ? { ...q, ...patch } : q);
                    updateQuestions(next);
                  };
                  const updateOption = (qi: number, oi: number, val: string) => {
                    const opts = [...questions[qi].options] as [string, string, string, string];
                    opts[oi] = val;
                    updateQ(qi, { options: opts });
                  };
                  return (
                    <div className="mt-5 space-y-4">
                      <div className="flex items-center justify-between">
                        <h4 className="text-sm font-semibold text-foreground flex items-center space-x-2">
                          <Icon name="QuestionMarkCircleIcon" size={16} className="text-brand-primary" />
                          <span>{isAssessment ? 'Assessment Questions' : 'Quiz Questions'} ({questions.length})</span>
                        </h4>
                        <button
                          type="button"
                          onClick={() => updateQuestions([...questions, {
                            id: Date.now(),
                            question: '',
                            options: ['', '', '', ''],
                            correctAnswer: 0,
                            explanation: '',
                          }])}
                          className="flex items-center space-x-1 px-3 py-1.5 text-xs font-semibold bg-brand-primary/10 text-brand-primary rounded-lg hover:bg-brand-primary/20 transition-colors"
                        >
                          <Icon name="PlusIcon" size={13} />
                          <span>Add Question</span>
                        </button>
                      </div>

                      {questions.length === 0 && (
                        <p className="text-xs text-muted-foreground text-center py-4 bg-surface rounded-lg border border-dashed border-border">
                          No questions yet — click "Add Question" to get started.
                        </p>
                      )}

                      {questions.map((q, qi) => (
                        <div key={q.id} className="bg-background border border-border rounded-xl p-4 space-y-3">
                          <div className="flex items-start justify-between gap-3">
                            <span className="flex-shrink-0 text-xs font-bold bg-brand-primary/10 text-brand-primary rounded-full w-6 h-6 flex items-center justify-center mt-0.5">
                              {qi + 1}
                            </span>
                            <div className="flex-1">
                              <label className="text-xs font-semibold text-muted-foreground uppercase mb-1 block">Question</label>
                              <textarea
                                rows={2}
                                value={q.question}
                                onChange={(e) => updateQ(qi, { question: e.target.value })}
                                placeholder="Enter the question text…"
                                className="w-full px-3 py-2 text-sm bg-card border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-brand-primary/30 resize-none"
                              />
                            </div>
                            <button
                              type="button"
                              onClick={() => updateQuestions(questions.filter((_, i) => i !== qi))}
                              title="Remove question"
                              className="flex-shrink-0 p-1.5 text-muted-foreground hover:text-red-500 hover:bg-surface rounded transition-colors mt-4"
                            >
                              <Icon name="TrashIcon" size={14} />
                            </button>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {q.options.map((opt, oi) => (
                              <div key={oi} className="flex items-center space-x-2">
                                <input
                                  type="radio"
                                  name={`correct-${qi}`}
                                  checked={q.correctAnswer === oi}
                                  onChange={() => updateQ(qi, { correctAnswer: oi })}
                                  title="Mark as correct answer"
                                  className="w-4 h-4 accent-green-500 flex-shrink-0 cursor-pointer"
                                />
                                <input
                                  value={opt}
                                  onChange={(e) => updateOption(qi, oi, e.target.value)}
                                  placeholder={`Option ${oi + 1}${q.correctAnswer === oi ? ' (correct ✓)' : ''}`}
                                  className={`flex-1 px-3 py-1.5 text-sm bg-card border rounded-lg text-foreground focus:outline-none focus:ring-2 transition-colors ${
                                    q.correctAnswer === oi
                                      ? 'border-green-500/60 bg-green-50/30 dark:bg-green-900/10 focus:ring-green-500/30'
                                      : 'border-border focus:ring-brand-primary/30'
                                  }`}
                                />
                              </div>
                            ))}
                          </div>

                          <div>
                            <label className="text-xs font-semibold text-muted-foreground uppercase mb-1 block">Explanation (shown after answer)</label>
                            <textarea
                              rows={2}
                              value={q.explanation}
                              onChange={(e) => updateQ(qi, { explanation: e.target.value })}
                              placeholder="Explain why the correct answer is right…"
                              className="w-full px-3 py-2 text-sm bg-card border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-brand-primary/30 resize-none"
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  );
                })()}

                <div className="flex items-center space-x-3 mt-4">
                  <button
                    onClick={async () => {
                      if (moduleFormMode === 'create') {
                        await AdminService.createModule(moduleForm as any);
                        toast.success('Module created');
                      } else {
                        await AdminService.updateModule(moduleForm.id!, moduleForm as any);
                        toast.success('Module updated');
                      }
                      setModuleForm(null);
                      loadAllData();
                    }}
                    className="px-4 py-2 bg-brand-primary text-white text-sm font-semibold rounded-lg hover:opacity-90 transition-opacity"
                  >
                    {moduleFormMode === 'create' ? 'Create Module' : 'Save Changes'}
                  </button>
                  <button onClick={() => setModuleForm(null)}
                    className="px-4 py-2 bg-surface text-muted-foreground text-sm rounded-lg hover:text-foreground transition-colors">
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {/* Add button */}
            {moduleForm === null && (
              <div className="flex justify-end">
                <button
                  onClick={() => { setModuleFormMode('create'); setModuleForm({ title: '', description: '', type: 'Quiz', difficulty: 'Beginner', duration: '15 min', points: 100, content_data: { questions: [] } }); }}
                  className="flex items-center space-x-2 px-4 py-2 bg-brand-primary text-white text-sm font-semibold rounded-lg hover:opacity-90 transition-opacity"
                >
                  <Icon name="PlusIcon" size={16} />
                  <span>New Module</span>
                </button>
              </div>
            )}

            {/* Module list */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {modules.map((m) => (
                <div key={m.id} className="bg-card border border-border rounded-xl p-5 flex flex-col space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm font-semibold text-foreground">{m.title}</p>
                      <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{m.description}</p>
                    </div>
                    <span className={`text-xs font-bold px-2 py-1 rounded-full flex-shrink-0 ml-2 ${
                      m.type === 'Quiz' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                      : m.type === 'Simulation' ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400'
                      : 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
                    }`}>{m.type}</span>
                  </div>
                  <div className="flex items-center space-x-3 text-xs text-muted-foreground">
                    <span className="flex items-center space-x-1"><Icon name="AcademicCapIcon" size={12} /><span>{m.difficulty}</span></span>
                    <span className="flex items-center space-x-1"><Icon name="ClockIcon" size={12} /><span>{m.duration}</span></span>
                    <span className="flex items-center space-x-1"><Icon name="StarIcon" size={12} /><span>{m.points} pts</span></span>
                  </div>
                  <div className="flex items-center justify-between pt-1 border-t border-border">
                    <span className="text-xs text-muted-foreground">{m.completions} completions</span>
                    <div className="flex space-x-1">
                      <button onClick={() => { setModuleFormMode('edit'); setModuleForm({ ...m }); }}
                        title="Edit" className="p-1.5 text-muted-foreground hover:text-brand-primary hover:bg-surface rounded transition-colors">
                        <Icon name="PencilIcon" size={14} />
                      </button>
                      <button
                        onClick={() => requestConfirm(
                          'Delete Module',
                          `Delete module "${m.title}"?`,
                          async () => { await AdminService.deleteModule(m.id); toast.success('Module deleted'); loadAllData(); },
                        )}
                        title="Delete" className="p-1.5 text-muted-foreground hover:text-red-500 hover:bg-surface rounded transition-colors">
                        <Icon name="TrashIcon" size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── Community Comments ── */}
        {activeTab === 'comments' && (
          <div className="space-y-4">
            <div className="flex items-center space-x-3 flex-wrap gap-2">
              <div className="relative flex-1 min-w-[220px] max-w-sm">
                <Icon name="MagnifyingGlassIcon" size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input value={commentSearch} onChange={(e) => setCommentSearch(e.target.value)}
                  placeholder="Search by user, threat or content…"
                  className="w-full pl-9 pr-4 py-2 text-sm bg-card border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-brand-primary/30" />
              </div>
              <span className="text-sm text-muted-foreground">{filteredComments.length} of {comments.length} comments</span>
            </div>
            <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-foreground">
                  <thead className="bg-surface">
                    <tr>
                      {['Threat', 'User', 'Date', 'Comment', 'Action'].map((h) => (
                        <th key={h} className="px-4 py-3 text-left text-xs font-semibold uppercase text-muted-foreground">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filteredComments.length === 0 ? (
                      <tr><td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">No comments found.</td></tr>
                    ) : filteredComments.map((c, i) => (
                      <tr key={i} className="border-b border-border hover:bg-surface/30 transition-colors">
                        <td className="px-4 py-3 text-sm max-w-[180px] truncate" title={c.threat_title}>{c.threat_title}</td>
                        <td className="px-4 py-3">
                          <div className="flex items-center space-x-2">
                            <div className="w-6 h-6 rounded-full bg-brand-primary/10 flex items-center justify-center flex-shrink-0">
                              <Icon name="UserCircleIcon" size={14} className="text-brand-primary" />
                            </div>
                            <span className="text-sm text-foreground">{c.user}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-xs text-muted-foreground whitespace-nowrap">{c.date}</td>
                        <td className="px-4 py-3 text-sm text-foreground max-w-xs">
                          <p className="line-clamp-2" title={c.insight}>{c.insight}</p>
                        </td>
                        <td className="px-4 py-3">
                          <button
                            onClick={() => requestConfirm(
                              'Delete Comment',
                              'Delete this comment? This cannot be undone.',
                              async () => { await AdminService.deleteComment(c.threat_id, c.comment_index); toast.success('Comment deleted'); loadAllData(); },
                            )}
                            title="Delete comment"
                            className="p-1.5 text-muted-foreground hover:text-red-500 hover:bg-surface rounded transition-colors"
                          >
                            <Icon name="TrashIcon" size={15} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ── Bookmarks ── */}
        {activeTab === 'bookmarks' && (
          <div className="space-y-4">
            <div className="flex items-center space-x-3 flex-wrap gap-2">
              <div className="relative flex-1 min-w-[220px] max-w-sm">
                <Icon name="MagnifyingGlassIcon" size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input value={bookmarkSearch} onChange={(e) => setBookmarkSearch(e.target.value)}
                  placeholder="Search by user or threat title…"
                  className="w-full pl-9 pr-4 py-2 text-sm bg-card border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-brand-primary/30" />
              </div>
              <span className="text-sm text-muted-foreground">{filteredBookmarks.length} of {bookmarks.length} bookmarks</span>
            </div>
            <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-foreground">
                  <thead className="bg-surface">
                    <tr>
                      {['User', 'Threat', 'Type', 'Severity', 'Saved', 'Action'].map((h) => (
                        <th key={h} className="px-4 py-3 text-left text-xs font-semibold uppercase text-muted-foreground">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filteredBookmarks.length === 0 ? (
                      <tr><td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">No bookmarks found.</td></tr>
                    ) : filteredBookmarks.map((b) => (
                      <tr key={b.id} className="border-b border-border hover:bg-surface/30 transition-colors">
                        <td className="px-4 py-3">
                          <div className="flex items-center space-x-2">
                            <Icon name="UserCircleIcon" size={16} className="text-brand-primary flex-shrink-0" />
                            <span className="text-sm text-foreground">{b.username}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-sm text-foreground max-w-[200px] truncate" title={b.threat_title}>{b.threat_title}</td>
                        <td className="px-4 py-3 text-xs text-muted-foreground">{b.threat_type || '—'}</td>
                        <td className="px-4 py-3">
                          {b.threat_severity ? (
                            <span className={`text-xs font-semibold px-2 py-1 rounded-full capitalize ${riskColors[b.threat_severity?.toLowerCase()] || riskColors.medium}`}>
                              {b.threat_severity}
                            </span>
                          ) : <span className="text-xs text-muted-foreground">—</span>}
                        </td>
                        <td className="px-4 py-3 text-xs text-muted-foreground">{new Date(b.created_at).toLocaleDateString()}</td>
                        <td className="px-4 py-3">
                          <button
                            onClick={() => requestConfirm(
                              'Delete Bookmark',
                              `Delete bookmark "${b.threat_title}" for ${b.username}?`,
                              async () => { await AdminService.deleteBookmark(b.id); toast.success('Bookmark deleted'); loadAllData(); },
                            )}
                            title="Delete bookmark"
                            className="p-1.5 text-muted-foreground hover:text-red-500 hover:bg-surface rounded transition-colors"
                          >
                            <Icon name="TrashIcon" size={15} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ── Custom Alerts ── */}
        {activeTab === 'alerts' && (
          <div className="space-y-4">
            <div className="flex items-center space-x-3 flex-wrap gap-2">
              <div className="relative flex-1 min-w-[220px] max-w-sm">
                <Icon name="MagnifyingGlassIcon" size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input value={alertSearch} onChange={(e) => setAlertSearch(e.target.value)}
                  placeholder="Search by user, title or keyword…"
                  className="w-full pl-9 pr-4 py-2 text-sm bg-card border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-brand-primary/30" />
              </div>
              <span className="text-sm text-muted-foreground">{filteredAlerts.length} of {alerts.length} alerts</span>
            </div>
            <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-foreground">
                  <thead className="bg-surface">
                    <tr>
                      {['User', 'Title', 'Keyword', 'Type', 'Min Severity', 'Status', 'Actions'].map((h) => (
                        <th key={h} className="px-4 py-3 text-left text-xs font-semibold uppercase text-muted-foreground">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filteredAlerts.length === 0 ? (
                      <tr><td colSpan={7} className="px-4 py-8 text-center text-muted-foreground">No alerts found.</td></tr>
                    ) : filteredAlerts.map((a) => (
                      <tr key={a.id} className="border-b border-border hover:bg-surface/30 transition-colors">
                        <td className="px-4 py-3">
                          <div className="flex items-center space-x-2">
                            <Icon name="UserCircleIcon" size={16} className="text-brand-primary flex-shrink-0" />
                            <span className="text-sm text-foreground">{a.username}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-sm font-medium text-foreground">{a.title}</td>
                        <td className="px-4 py-3">
                          <span className="text-xs font-mono bg-surface px-2 py-1 rounded text-foreground">{a.keyword}</span>
                        </td>
                        <td className="px-4 py-3 text-xs text-muted-foreground">{a.threat_type || '—'}</td>
                        <td className="px-4 py-3 text-xs text-muted-foreground capitalize">{a.min_severity || 'any'}</td>
                        <td className="px-4 py-3">
                          <span className={`text-xs font-semibold px-2 py-1 rounded-full ${
                            a.active
                              ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                              : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
                          }`}>{a.active ? 'Active' : 'Paused'}</span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex space-x-1">
                            <button
                              onClick={async () => {
                                await AdminService.toggleAlert(a.id);
                                loadAllData();
                              }}
                              title={a.active ? 'Pause alert' : 'Activate alert'}
                              className="p-1.5 text-muted-foreground hover:text-amber-500 hover:bg-surface rounded transition-colors"
                            >
                              <Icon name={a.active ? 'PauseIcon' : 'PlayIcon'} size={14} />
                            </button>
                            <button
                              onClick={() => requestConfirm(
                                'Delete Alert',
                                `Delete alert "${a.title}" for ${a.username}?`,
                                async () => { await AdminService.deleteAlert(a.id); toast.success('Alert deleted'); loadAllData(); },
                              )}
                              title="Delete alert"
                              className="p-1.5 text-muted-foreground hover:text-red-500 hover:bg-surface rounded transition-colors"
                            >
                              <Icon name="TrashIcon" size={15} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ── Industry Recognition & Partnerships ── */}
        {activeTab === 'partnerships' && (
          <div className="space-y-6">
            {/* Summary cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {(['certification', 'award', 'partnership'] as const).map((t) => {
                const count = trustSignals.filter((ts) => ts.type === t).length;
                const colors: Record<string, string> = {
                  certification: 'text-blue-500',
                  award: 'text-amber-500',
                  partnership: 'text-purple-500',
                };
                const labels: Record<string, string> = {
                  certification: 'Certifications',
                  award: 'Awards',
                  partnership: 'Partnerships',
                };
                return (
                  <div key={t} className="bg-card border border-border rounded-xl p-5 text-center">
                    <p className={`text-4xl font-bold ${colors[t]}`}>{count}</p>
                    <p className="text-xs text-muted-foreground mt-2">{labels[t]}</p>
                  </div>
                );
              })}
            </div>

            {/* Create / Edit form */}
            {tsForm !== null && (
              <div className="bg-card border border-brand-primary/30 rounded-xl p-6 shadow-sm">
                <h3 className="text-base font-semibold text-primary mb-4">
                  {tsFormMode === 'create' ? 'Add Recognition / Partnership' : `Edit: ${tsForm.name}`}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-muted-foreground uppercase mb-1 block">Type</label>
                    <select value={tsForm.type ?? 'certification'}
                      onChange={(e) => setTsForm({ ...tsForm, type: e.target.value as any })}
                      className="w-full px-3 py-2 text-sm bg-background border border-border rounded-lg text-foreground focus:outline-none">
                      <option value="certification">Certification</option>
                      <option value="award">Award</option>
                      <option value="partnership">Partnership</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-muted-foreground uppercase mb-1 block">Name</label>
                    <input value={tsForm.name ?? ''}
                      onChange={(e) => setTsForm({ ...tsForm, name: e.target.value })}
                      placeholder="e.g. ISO 27001 Certified"
                      className="w-full px-3 py-2 text-sm bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-brand-primary/30" />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-muted-foreground uppercase mb-1 block">Logo URL</label>
                    <input value={tsForm.logo ?? ''}
                      onChange={(e) => setTsForm({ ...tsForm, logo: e.target.value })}
                      placeholder="https://..."
                      className="w-full px-3 py-2 text-sm bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-brand-primary/30" />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-muted-foreground uppercase mb-1 block">Alt Text</label>
                    <input value={tsForm.alt ?? ''}
                      onChange={(e) => setTsForm({ ...tsForm, alt: e.target.value })}
                      placeholder="Logo alt text"
                      className="w-full px-3 py-2 text-sm bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-brand-primary/30" />
                  </div>
                  <div className="md:col-span-2">
                    <label className="text-xs font-semibold text-muted-foreground uppercase mb-1 block">Description</label>
                    <textarea rows={2} value={tsForm.description ?? ''}
                      onChange={(e) => setTsForm({ ...tsForm, description: e.target.value })}
                      placeholder="Brief description of this recognition or partnership"
                      className="w-full px-3 py-2 text-sm bg-background border border-border rounded-lg text-foreground focus:outline-none resize-none" />
                  </div>
                </div>
                <div className="flex items-center space-x-3 mt-4">
                  <button
                    onClick={async () => {
                      if (tsFormMode === 'create') {
                        await AdminService.createTrustSignal(tsForm as any);
                        toast.success('Trust signal created');
                      } else {
                        await AdminService.updateTrustSignal(tsForm.id!, tsForm as any);
                        toast.success('Trust signal updated');
                      }
                      setTsForm(null);
                      loadAllData();
                    }}
                    className="px-4 py-2 bg-brand-primary text-white text-sm font-semibold rounded-lg hover:opacity-90 transition-opacity"
                  >
                    {tsFormMode === 'create' ? 'Add Entry' : 'Save Changes'}
                  </button>
                  <button onClick={() => setTsForm(null)}
                    className="px-4 py-2 bg-surface text-muted-foreground text-sm rounded-lg hover:text-foreground transition-colors">
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {/* Search + Add button */}
            <div className="flex items-center space-x-3 flex-wrap gap-2">
              <div className="relative flex-1 min-w-[220px] max-w-sm">
                <Icon name="MagnifyingGlassIcon" size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input value={tsSearch} onChange={(e) => setTsSearch(e.target.value)}
                  placeholder="Search by name, type or description…"
                  className="w-full pl-9 pr-4 py-2 text-sm bg-card border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-brand-primary/30" />
              </div>
              <span className="text-sm text-muted-foreground">{filteredTrustSignals.length} of {trustSignals.length}</span>
              {tsForm === null && (
                <button
                  onClick={() => { setTsFormMode('create'); setTsForm({ type: 'certification', name: '', description: '', logo: '', alt: '' }); }}
                  className="ml-auto flex items-center space-x-2 px-4 py-2 bg-brand-primary text-white text-sm font-semibold rounded-lg hover:opacity-90 transition-opacity"
                >
                  <Icon name="PlusIcon" size={16} />
                  <span>Add Entry</span>
                </button>
              )}
            </div>

            {/* Cards grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredTrustSignals.length === 0 && (
                <div className="sm:col-span-2 lg:col-span-3 text-center py-10 text-muted-foreground text-sm">
                  No entries found.
                </div>
              )}
              {filteredTrustSignals.map((ts) => {
                const typeConfig: Record<string, { label: string; color: string; bg: string }> = {
                  certification: { label: 'Certification', color: 'text-blue-700 dark:text-blue-400', bg: 'bg-blue-100 dark:bg-blue-900/30' },
                  award: { label: 'Award', color: 'text-amber-700 dark:text-amber-400', bg: 'bg-amber-100 dark:bg-amber-900/30' },
                  partnership: { label: 'Partnership', color: 'text-purple-700 dark:text-purple-400', bg: 'bg-purple-100 dark:bg-purple-900/30' },
                };
                const tc = typeConfig[ts.type] ?? typeConfig.certification;
                return (
                  <div key={ts.id} className="bg-card border border-border rounded-xl p-5 flex flex-col space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center space-x-3 min-w-0">
                        {ts.logo ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={ts.logo} alt={ts.alt} className="w-10 h-10 object-contain rounded flex-shrink-0" />
                        ) : (
                          <div className="w-10 h-10 rounded bg-surface flex items-center justify-center flex-shrink-0">
                            <Icon name="BuildingOffice2Icon" size={20} className="text-muted-foreground" />
                          </div>
                        )}
                        <p className="text-sm font-semibold text-foreground truncate">{ts.name}</p>
                      </div>
                      <span className={`text-xs font-bold px-2 py-1 rounded-full flex-shrink-0 ${tc.bg} ${tc.color}`}>
                        {tc.label}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground line-clamp-2">{ts.description}</p>
                    <div className="flex items-center justify-end space-x-1 pt-1 border-t border-border">
                      <button
                        onClick={() => { setTsFormMode('edit'); setTsForm({ ...ts }); }}
                        title="Edit" className="p-1.5 text-muted-foreground hover:text-brand-primary hover:bg-surface rounded transition-colors">
                        <Icon name="PencilIcon" size={14} />
                      </button>
                      <button
                        onClick={() => requestConfirm(
                          'Delete Trust Signal',
                          `Delete "${ts.name}"?`,
                          async () => { await AdminService.deleteTrustSignal(ts.id); toast.success('Trust signal deleted'); loadAllData(); },
                        )}
                        title="Delete" className="p-1.5 text-muted-foreground hover:text-red-500 hover:bg-surface rounded transition-colors">
                        <Icon name="TrashIcon" size={14} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ── Threat Intelligence Database ── */}
        {activeTab === 'database' && (
          <div className="space-y-6">
            {/* Summary Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: 'Total Entries', value: threatDB.length, color: 'text-brand-primary' },
                { label: 'Critical', value: threatDB.filter(t => t.severity === 'critical').length, color: 'text-red-500' },
                { label: 'Active', value: threatDB.filter(t => t.status === 'active').length, color: 'text-yellow-500' },
                { label: 'Mitigated', value: threatDB.filter(t => t.status === 'mitigated').length, color: 'text-green-500' },
              ].map(c => (
                <div key={c.label} className="bg-card border border-border rounded-xl p-5 text-center">
                  <p className={`text-3xl font-bold ${c.color}`}>{c.value}</p>
                  <p className="text-sm text-muted-foreground mt-1">{c.label}</p>
                </div>
              ))}
            </div>

            {/* Create / Edit Form */}
            {threatDBForm !== null ? (
              <div className="bg-card border border-border rounded-xl overflow-hidden">
                <div className="flex items-center justify-between p-5 border-b border-border">
                  <h3 className="font-semibold text-foreground">{threatDBFormMode === 'create' ? 'Create New Threat' : 'Edit Threat'}</h3>
                  <button onClick={() => setThreatDBForm(null)} className="text-muted-foreground hover:text-foreground">
                    <Icon name="XMarkIcon" size={20} />
                  </button>
                </div>

                {/* Live Preview */}
                {(threatDBForm.title || threatDBForm.image) && (
                  <div className="p-5 border-b border-border bg-surface">
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Preview</p>
                    <div className="flex items-start gap-4">
                      {threatDBForm.image && (
                        <div className="relative w-24 h-16 rounded-lg overflow-hidden flex-shrink-0 border border-border">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={threatDBForm.image} alt={threatDBForm.alt || ''} className="w-full h-full object-cover" />
                          {threatDBForm.severity && (
                            <span className={`absolute top-1 left-1 text-xs font-bold px-1.5 py-0.5 rounded ${
                              threatDBForm.severity === 'critical' ? 'bg-red-600 text-white' :
                              threatDBForm.severity === 'high' ? 'bg-orange-500 text-white' :
                              threatDBForm.severity === 'medium' ? 'bg-yellow-500 text-black' :
                              'bg-blue-500 text-white'
                            }`}>{threatDBForm.severity?.toUpperCase()}</span>
                          )}
                        </div>
                      )}
                      <div>
                        <p className="font-bold text-foreground">{threatDBForm.title || 'Untitled'}</p>
                        <div className="flex flex-wrap gap-3 mt-1 text-xs text-muted-foreground">
                          {threatDBForm.type && <span>Type: {threatDBForm.type}</span>}
                          {threatDBForm.origin && <span>Origin: {threatDBForm.origin}</span>}
                          {threatDBForm.detected_date && <span>Detected: {threatDBForm.detected_date}</span>}
                          {threatDBForm.affected_users !== undefined && <span>Affected: {Number(threatDBForm.affected_users).toLocaleString()}</span>}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                <div className="p-5 space-y-5">
                  {/* Row 1 */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-muted-foreground mb-1">Threat ID *</label>
                      <input value={threatDBForm.threat_id || ''} onChange={e => setThreatDBForm(f => ({ ...f!, threat_id: e.target.value }))}
                        placeholder="THR-2026-001"
                        className="w-full bg-surface border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-brand-primary" />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-muted-foreground mb-1">Title *</label>
                      <input value={threatDBForm.title || ''} onChange={e => setThreatDBForm(f => ({ ...f!, title: e.target.value }))}
                        placeholder="Credential Harvesting Campaign"
                        className="w-full bg-surface border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-brand-primary" />
                    </div>
                  </div>
                  {/* Row 2 */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-muted-foreground mb-1">Type *</label>
                      <input value={threatDBForm.type || ''} onChange={e => setThreatDBForm(f => ({ ...f!, type: e.target.value }))}
                        placeholder="Phishing"
                        className="w-full bg-surface border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-brand-primary" />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-muted-foreground mb-1">Severity *</label>
                      <select value={threatDBForm.severity || 'medium'} onChange={e => setThreatDBForm(f => ({ ...f!, severity: e.target.value as any }))}
                        className="w-full bg-surface border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-brand-primary">
                        <option value="critical">Critical</option>
                        <option value="high">High</option>
                        <option value="medium">Medium</option>
                        <option value="low">Low</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-muted-foreground mb-1">Status</label>
                      <select value={threatDBForm.status || 'active'} onChange={e => setThreatDBForm(f => ({ ...f!, status: e.target.value as any }))}
                        className="w-full bg-surface border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-brand-primary">
                        <option value="active">Active</option>
                        <option value="mitigated">Mitigated</option>
                        <option value="archived">Archived</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-muted-foreground mb-1">Detected Date</label>
                      <input type="date" value={threatDBForm.detected_date || ''} onChange={e => setThreatDBForm(f => ({ ...f!, detected_date: e.target.value }))}
                        className="w-full bg-surface border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-brand-primary" />
                    </div>
                  </div>
                  {/* Row 3 */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-muted-foreground mb-1">Origin</label>
                      <input value={threatDBForm.origin || ''} onChange={e => setThreatDBForm(f => ({ ...f!, origin: e.target.value }))}
                        placeholder="Eastern Europe"
                        className="w-full bg-surface border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-brand-primary" />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-muted-foreground mb-1">Affected Users</label>
                      <input type="number" value={threatDBForm.affected_users ?? ''} onChange={e => setThreatDBForm(f => ({ ...f!, affected_users: Number(e.target.value) }))}
                        placeholder="50000"
                        className="w-full bg-surface border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-brand-primary" />
                    </div>
                    <div className="col-span-2">
                      <label className="block text-xs font-semibold text-muted-foreground mb-1">Image URL</label>
                      <input value={threatDBForm.image || ''} onChange={e => setThreatDBForm(f => ({ ...f!, image: e.target.value }))}
                        placeholder="https://..."
                        className="w-full bg-surface border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-brand-primary" />
                    </div>
                  </div>
                  {/* Description */}
                  <div>
                    <label className="block text-xs font-semibold text-muted-foreground mb-1">Description *</label>
                    <textarea rows={3} value={threatDBForm.description || ''} onChange={e => setThreatDBForm(f => ({ ...f!, description: e.target.value }))}
                      placeholder="Brief overview of the threat..."
                      className="w-full bg-surface border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-brand-primary resize-none" />
                  </div>

                  {/* Detailed Analysis */}
                  <div className="bg-surface border border-border rounded-lg p-5">
                    <h4 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                      <Icon name="DocumentTextIcon" size={16} className="text-brand-primary" />
                      Detailed Analysis
                    </h4>
                    <textarea rows={5} value={threatDBForm.detailed_analysis || ''}
                      onChange={e => setThreatDBForm(f => ({ ...f!, detailed_analysis: e.target.value }))}
                      placeholder="In-depth technical analysis of the threat vector, attack chain, and impact..."
                      className="w-full bg-card border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-brand-primary resize-none" />
                  </div>

                  {/* Prevention Tips */}
                  <div className="bg-surface border border-border rounded-lg p-5">
                    <h4 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                      <Icon name="ShieldCheckIcon" size={16} className="text-green-500" />
                      Prevention Tips
                    </h4>
                    <div className="space-y-2 mb-3">
                      {(threatDBForm.prevention_tips || []).map((tip, i) => (
                        <div key={i} className="flex items-center gap-2 bg-card border border-border rounded-lg px-3 py-2">
                          <span className="w-5 h-5 flex-shrink-0 flex items-center justify-center bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-full text-xs font-bold">{i + 1}</span>
                          <span className="flex-1 text-sm text-foreground">{tip}</span>
                          <button onClick={() => setThreatDBForm(f => ({ ...f!, prevention_tips: (f!.prevention_tips || []).filter((_, j) => j !== i) }))}
                            className="text-red-400 hover:text-red-600">
                            <Icon name="TrashIcon" size={14} />
                          </button>
                        </div>
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <input value={threatDBTipInput} onChange={e => setThreatDBTipInput(e.target.value)}
                        onKeyDown={e => { if (e.key === 'Enter' && threatDBTipInput.trim()) { setThreatDBForm(f => ({ ...f!, prevention_tips: [...(f!.prevention_tips || []), threatDBTipInput.trim()] })); setThreatDBTipInput(''); }}}
                        placeholder="Add a prevention tip and press Enter…"
                        className="flex-1 bg-card border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-brand-primary" />
                      <button onClick={() => { if (threatDBTipInput.trim()) { setThreatDBForm(f => ({ ...f!, prevention_tips: [...(f!.prevention_tips || []), threatDBTipInput.trim()] })); setThreatDBTipInput(''); }}}
                        className="px-3 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg text-sm font-medium">
                        Add
                      </button>
                    </div>
                  </div>

                  {/* Real-World Examples */}
                  <div className="bg-surface border border-border rounded-lg p-5">
                    <h4 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                      <Icon name="NewspaperIcon" size={16} className="text-orange-500" />
                      Real-World Examples
                    </h4>
                    <div className="space-y-2 mb-3">
                      {(threatDBForm.real_world_examples || []).map((ex, i) => (
                        <div key={i} className="flex items-start gap-2 bg-card border border-border rounded-lg px-3 py-2">
                          <span className="w-5 h-5 flex-shrink-0 mt-0.5 flex items-center justify-center bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400 rounded-full text-xs font-bold">{i + 1}</span>
                          <span className="flex-1 text-sm text-foreground">{ex}</span>
                          <button onClick={() => setThreatDBForm(f => ({ ...f!, real_world_examples: (f!.real_world_examples || []).filter((_, j) => j !== i) }))}
                            className="text-red-400 hover:text-red-600 flex-shrink-0">
                            <Icon name="TrashIcon" size={14} />
                          </button>
                        </div>
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <input value={threatDBExInput} onChange={e => setThreatDBExInput(e.target.value)}
                        onKeyDown={e => { if (e.key === 'Enter' && threatDBExInput.trim()) { setThreatDBForm(f => ({ ...f!, real_world_examples: [...(f!.real_world_examples || []), threatDBExInput.trim()] })); setThreatDBExInput(''); }}}
                        placeholder="Add a real-world example and press Enter…"
                        className="flex-1 bg-card border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-brand-primary" />
                      <button onClick={() => { if (threatDBExInput.trim()) { setThreatDBForm(f => ({ ...f!, real_world_examples: [...(f!.real_world_examples || []), threatDBExInput.trim()] })); setThreatDBExInput(''); }}}
                        className="px-3 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg text-sm font-medium">
                        Add
                      </button>
                    </div>
                  </div>

                  {/* Save / Cancel */}
                  <div className="flex justify-end gap-3 pt-2">
                    <button onClick={() => setThreatDBForm(null)}
                      className="px-4 py-2 border border-border text-foreground rounded-lg text-sm hover:bg-surface">
                      Cancel
                    </button>
                    <button onClick={async () => {
                      if (!threatDBForm.threat_id || !threatDBForm.title || !threatDBForm.type || !threatDBForm.severity || !threatDBForm.description) {
                        alert('Please fill in all required fields (Threat ID, Title, Type, Severity, Description)');
                        return;
                      }
                      const payload = {
                        threat_id: threatDBForm.threat_id,
                        title: threatDBForm.title,
                        type: threatDBForm.type,
                        severity: threatDBForm.severity,
                        status: threatDBForm.status || 'active',
                        description: threatDBForm.description,
                        detected_date: threatDBForm.detected_date || new Date().toISOString().split('T')[0],
                        affected_users: threatDBForm.affected_users || 0,
                        image: threatDBForm.image || '',
                        alt: threatDBForm.alt || '',
                        origin: threatDBForm.origin || '',
                        community_reports: threatDBForm.community_reports || 0,
                        detailed_analysis: threatDBForm.detailed_analysis || '',
                        prevention_tips: threatDBForm.prevention_tips || [],
                        real_world_examples: threatDBForm.real_world_examples || [],
                        related_threats: threatDBForm.related_threats || [],
                        community_insights: threatDBForm.community_insights || [],
                      };
                      if (threatDBFormMode === 'create') {
                        await AdminService.createThreatDB(payload);
                        toast.success('Threat entry created');
                      } else {
                        await AdminService.updateThreatDB(threatDBForm.id!, payload);
                        toast.success('Threat entry updated');
                      }
                      setThreatDBForm(null);
                      const updated = await AdminService.getThreatDB(threatDBSearch || undefined);
                      setThreatDB(updated ?? []);
                    }} className="px-4 py-2 bg-brand-primary hover:bg-brand-secondary text-white rounded-lg text-sm font-medium">
                      {threatDBFormMode === 'create' ? 'Create Threat' : 'Save Changes'}
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex justify-end">
                <button onClick={() => { setThreatDBForm({ prevention_tips: [], real_world_examples: [], related_threats: [], community_insights: [] }); setThreatDBFormMode('create'); }}
                  className="flex items-center gap-2 px-4 py-2 bg-brand-primary hover:bg-brand-secondary text-white rounded-lg text-sm font-medium">
                  <Icon name="PlusIcon" size={16} />
                  New Threat Entry
                </button>
              </div>
            )}

            {/* Threat List */}
            {threatDBForm === null && (
              <div className="bg-card border border-border rounded-xl overflow-hidden">
                <div className="flex items-center justify-between p-5 border-b border-border">
                  <h3 className="font-semibold text-foreground">All Threats ({threatDB.length})</h3>
                  <input value={threatDBSearch} onChange={async e => {
                    setThreatDBSearch(e.target.value);
                    const res = await AdminService.getThreatDB(e.target.value || undefined);
                    setThreatDB(res ?? []);
                  }} placeholder="Search threats…"
                    className="bg-surface border border-border rounded-lg px-3 py-1.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-brand-primary w-56" />
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-surface border-b border-border">
                      <tr>
                        {['Threat ID', 'Title', 'Type', 'Severity', 'Status', 'Affected', 'Actions'].map(h => (
                          <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {threatDB.map(t => (
                        <tr key={t.id} className="hover:bg-surface/50 transition-colors">
                          <td className="px-4 py-3 font-mono text-xs text-brand-primary">{t.threat_id}</td>
                          <td className="px-4 py-3 font-medium text-foreground max-w-xs truncate">{t.title}</td>
                          <td className="px-4 py-3 text-muted-foreground">{t.type}</td>
                          <td className="px-4 py-3">
                            <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                              t.severity === 'critical' ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400' :
                              t.severity === 'high' ? 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400' :
                              t.severity === 'medium' ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400' :
                              'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400'
                            }`}>{t.severity.toUpperCase()}</span>
                          </td>
                          <td className="px-4 py-3">
                            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                              t.status === 'active' ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400' :
                              t.status === 'mitigated' ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' :
                              'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
                            }`}>{t.status}</span>
                          </td>
                          <td className="px-4 py-3 text-muted-foreground">{t.affected_users.toLocaleString()}</td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <button onClick={() => { setThreatDBForm({ ...t }); setThreatDBFormMode('edit'); }}
                                className="text-brand-primary hover:text-brand-secondary" title="Edit">
                                <Icon name="PencilSquareIcon" size={16} />
                              </button>
                              <button onClick={() => requestConfirm(
                                'Delete Threat',
                                `Delete "${t.title}"? This cannot be undone.`,
                                async () => { await AdminService.deleteThreatDB(t.id); toast.success('Threat entry deleted'); setThreatDB(prev => prev.filter(x => x.id !== t.id)); },
                              )} className="text-red-400 hover:text-red-600" title="Delete">
                                <Icon name="TrashIcon" size={16} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                      {threatDB.length === 0 && (
                        <tr><td colSpan={7} className="px-4 py-8 text-center text-muted-foreground">No threats found.</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── System ── */}
        {activeTab === 'system' && (
          <div className="space-y-6">
            <div className="grid grid-cols-3 gap-4">
              {[
                { level: 'INFO', color: 'text-green-500', bg: 'bg-green-50 dark:bg-green-900/20', border: 'border-green-200 dark:border-green-800' },
                { level: 'WARN', color: 'text-yellow-500', bg: 'bg-yellow-50 dark:bg-yellow-900/20', border: 'border-yellow-200 dark:border-yellow-800' },
                { level: 'ERROR', color: 'text-red-500', bg: 'bg-red-50 dark:bg-red-900/20', border: 'border-red-200 dark:border-red-800' },
              ].map(({ level, color, bg, border }) => (
                <div key={level} className={`${bg} border ${border} rounded-xl p-5 text-center`}>
                  <p className={`text-4xl font-bold ${color}`}>{logCounts[level] ?? 0}</p>
                  <p className="text-xs text-muted-foreground mt-2 font-semibold">{level} Logs</p>
                </div>
              ))}
            </div>
            <div className="flex items-center justify-between flex-wrap gap-3">
              <FilterPills
                options={['all', 'INFO', 'WARN', 'ERROR']}
                active={logFilter}
                onChange={(lvl) => { setLogFilter(lvl); loadLogs(lvl); }}
              />
              <button
                onClick={() => loadLogs(logFilter === 'all' ? undefined : logFilter)}
                className="flex items-center space-x-2 px-3 py-1.5 text-sm bg-surface text-muted-foreground hover:text-foreground rounded-lg border border-border transition-colors"
              >
                <Icon name="ArrowPathIcon" size={14} />
                <span>Refresh</span>
              </button>
            </div>
            <div className="bg-gray-900 rounded-xl p-4 font-mono text-xs max-h-[500px] overflow-y-auto space-y-0.5">
              {logs.length === 0 ? (
                <p className="text-gray-500">No logs to display.</p>
              ) : logs.map((log, i) => (
                <div key={i} className="flex space-x-3 hover:bg-white/5 px-1 py-0.5 rounded">
                  <span className="text-gray-500 flex-shrink-0 whitespace-nowrap">{new Date(log.created_at).toLocaleString()}</span>
                  <span className={`flex-shrink-0 font-bold w-10 ${
                    log.level === 'ERROR' ? 'text-red-400' : log.level === 'WARN' ? 'text-yellow-400' : 'text-green-400'
                  }`}>{log.level}</span>
                  <span className="text-gray-300 break-all">{log.message}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <ConfirmModal
        open={confirmModal.open}
        title={confirmModal.title}
        message={confirmModal.message}
        danger={confirmModal.danger}
        confirmLabel={confirmModal.confirmLabel}
        onConfirm={confirmModal.onConfirm}
        onCancel={closeConfirm}
      />
    </div>
  );
}
