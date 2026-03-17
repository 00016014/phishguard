'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Header from '@/components/common/Header';
import Icon from '@/components/ui/AppIcon';
import { useAuth } from '@/contexts/AuthContext';
import { useSubscription } from '@/contexts/SubscriptionContext';
import { apiFetch, API_BASE_URL } from '@/lib/apiFetch';
import { toast } from 'sonner';

interface CheckinData {
  checked_in_today: boolean;
  just_checked_in: boolean;
  points_earned_today: number;
  streak: number;
  total_points: number;
  checkin_dates: string[];
}

export default function ProfilePage() {
  const router = useRouter();
  const { user, loading, refreshUser } = useAuth();
  const { subscription, getTierLabel, getTierBadgeColor } = useSubscription();

  const [profileForm, setProfileForm] = useState({ first_name: '', last_name: '' });
  const [pwForm, setPwForm] = useState({ old_password: '', new_password: '', confirm_password: '' });
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPw, setSavingPw] = useState(false);
  const [pwError, setPwError] = useState('');
  const [activity, setActivity] = useState<any[]>([]);
  const [checkinData, setCheckinData] = useState<CheckinData | null>(null);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const avatarInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!loading && !user) router.push('/login');
  }, [loading, user]);

  useEffect(() => {
    if (!user) return;
    setProfileForm({
      first_name: user.first_name || '',
      last_name: user.last_name || '',
    });
    loadActivity();
    loadCheckinData();
  }, [user]);

  const loadActivity = async () => {
    try {
      const res = await apiFetch(`${API_BASE_URL}/users/activity/`);
      if (!res.ok) return;
      const data = await res.json();
      const raw: any[] = Array.isArray(data) ? data : (data.results ?? []);
      setActivity(raw.slice(0, 5));
    } catch { /* ignore */ }
  };

  const loadCheckinData = async () => {
    try {
      const res = await apiFetch(`${API_BASE_URL}/users/checkin_history/`);
      if (!res.ok) return;
      const data = await res.json();
      setCheckinData(data);
    } catch { /* ignore */ }
  };

  const handleDailyCheckin = async () => {
    try {
      const res = await apiFetch(`${API_BASE_URL}/users/daily_checkin/`, { method: 'POST' });
      if (!res.ok) return;
      const data = await res.json();
      setCheckinData(data);
      if (data.just_checked_in) {
        toast.success(`+${data.points_earned_today} points! Daily check-in complete 🔥`);
        await refreshUser();
      }
    } catch { /* ignore */ }
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      toast.error('Image must be smaller than 2MB');
      return;
    }
    setUploadingAvatar(true);
    try {
      const base64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
      const res = await apiFetch(`${API_BASE_URL}/users/upload_avatar/`, {
        method: 'PATCH',
        body: JSON.stringify({ avatar: base64 }),
      });
      if (!res.ok) throw new Error('Upload failed');
      await refreshUser();
      toast.success('Avatar updated');
    } catch {
      toast.error('Failed to upload avatar');
    } finally {
      setUploadingAvatar(false);
      if (avatarInputRef.current) avatarInputRef.current.value = '';
    }
  };

  const getInitials = () => {
    const fn = user?.first_name?.trim();
    const ln = user?.last_name?.trim();
    if (fn && ln) return `${fn[0]}${ln[0]}`.toUpperCase();
    return (user?.username?.slice(0, 2) ?? '??').toUpperCase();
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingProfile(true);
    try {
      const res = await apiFetch(`${API_BASE_URL}/users/update_profile/`, {
        method: 'PATCH',
        body: JSON.stringify(profileForm),
      });
      if (!res.ok) throw new Error('Update failed');
      await refreshUser();
      toast.success('Profile updated');
    } catch {
      toast.error('Failed to update profile');
    } finally {
      setSavingProfile(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPwError('');
    if (pwForm.new_password !== pwForm.confirm_password) {
      setPwError('Passwords do not match');
      return;
    }
    setSavingPw(true);
    try {
      const res = await apiFetch(`${API_BASE_URL}/users/change_password/`, {
        method: 'POST',
        body: JSON.stringify({ old_password: pwForm.old_password, new_password: pwForm.new_password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update password');
      setPwForm({ old_password: '', new_password: '', confirm_password: '' });
      toast.success('Password changed successfully');
    } catch (err: any) {
      setPwError(err.message);
      toast.error(err.message);
    } finally {
      setSavingPw(false);
    }
  };

  if (loading || !user) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="pt-24 container mx-auto px-4 py-8">
          <div className="animate-pulse space-y-6">
            <div className="h-40 bg-surface rounded-xl" />
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[1, 2, 3, 4].map(i => <div key={i} className="h-24 bg-surface rounded-xl" />)}
            </div>
            <div className="grid lg:grid-cols-2 gap-6">
              <div className="h-72 bg-surface rounded-xl" />
              <div className="h-72 bg-surface rounded-xl" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  const joinedDate = user.date_joined
    ? new Date(user.date_joined).toLocaleDateString('en-US', { year: 'numeric', month: 'long' })
    : null;

  const displayName =
    user.first_name && user.last_name
      ? `${user.first_name} ${user.last_name}`
      : user.username;

  const stats = [
    { label: 'Points', value: user.profile?.points ?? 0, icon: 'StarIcon', color: 'text-amber-500', bg: 'bg-amber-500/10' },
    { label: 'Streak', value: `${user.profile?.streak ?? 0}d`, icon: 'FireIcon', color: 'text-orange-500', bg: 'bg-orange-500/10' },
    { label: 'Scans Used', value: user.profile?.scans_used ?? 0, icon: 'MagnifyingGlassIcon', color: 'text-brand-primary', bg: 'bg-brand-primary/10' },
    { label: 'Status', value: user.profile?.status ?? 'active', icon: 'ShieldCheckIcon', color: 'text-success', bg: 'bg-success/10' },
  ];

  const activityConfig: Record<string, { icon: string; color: string; bg: string }> = {
    scan:     { icon: 'MagnifyingGlassIcon', color: 'text-brand-primary',  bg: 'bg-brand-primary/10' },
    learning: { icon: 'AcademicCapIcon',     color: 'text-brand-accent',   bg: 'bg-brand-accent/10' },
    report:   { icon: 'FlagIcon',            color: 'text-warning',        bg: 'bg-warning/10' },
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-24 pb-16 px-4 lg:px-8">
        <div className="max-w-4xl mx-auto space-y-6">

          {/* ── Hero card ── */}
          <div className="bg-card border border-border rounded-xl p-6 flex flex-col sm:flex-row items-start sm:items-center gap-5">
            {/* Avatar */}
            <div
              className="relative flex-shrink-0 w-20 h-20 group cursor-pointer"
              onClick={() => avatarInputRef.current?.click()}
              title="Click to change avatar"
            >
              {user.profile?.avatar ? (
                <img
                  src={user.profile.avatar}
                  alt="Avatar"
                  className="w-20 h-20 rounded-full object-cover ring-2 ring-brand-primary/30"
                />
              ) : (
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-brand-primary to-brand-secondary flex items-center justify-center text-white text-2xl font-bold select-none">
                  {getInitials()}
                </div>
              )}
              <div className="absolute inset-0 rounded-full bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                {uploadingAvatar ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Icon name="CameraIcon" size={22} className="text-white" />
                )}
              </div>
              <input
                ref={avatarInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleAvatarUpload}
              />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-2xl font-headline font-bold text-foreground">{displayName}</h1>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${getTierBadgeColor()}`}>
                  {getTierLabel()}
                </span>
                {user.profile?.role === 'admin' && (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400 border border-purple-200 dark:border-purple-800">
                    Admin
                  </span>
                )}
              </div>
              <p className="text-sm text-muted-foreground mt-0.5">@{user.username}</p>
              <p className="text-sm text-muted-foreground">{user.email}</p>
              {joinedDate && (
                <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                  <Icon name="CalendarIcon" size={12} />
                  Member since {joinedDate}
                </p>
              )}
            </div>
            <div className="flex flex-wrap gap-2 self-start sm:self-center">
              <Link
                href="/personal-dashboard"
                className="flex items-center gap-2 px-4 py-2 bg-brand-primary hover:bg-brand-primary/90 text-white text-sm font-semibold rounded-lg transition-colors"
              >
                <Icon name="ChartBarIcon" size={16} />
                Dashboard
              </Link>
              {user.profile?.role === 'admin' && (
                <Link
                  href="/admin"
                  className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white text-sm font-semibold rounded-lg transition-colors"
                >
                  <Icon name="LockClosedIcon" size={16} />
                  Admin Panel
                </Link>
              )}
            </div>
          </div>

          {/* ── Stats row ── */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {stats.map(s => (
              <div key={s.label} className="bg-card border border-border rounded-xl p-4 flex items-center gap-3">
                <div className={`w-10 h-10 rounded-lg ${s.bg} flex items-center justify-center flex-shrink-0`}>
                  <Icon name={s.icon as any} size={20} className={s.color} variant="solid" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">{s.label}</p>
                  <p className="text-lg font-bold text-foreground capitalize">{s.value}</p>
                </div>
              </div>
            ))}
          </div>

          {/* ── Daily Check-in & Streak Calendar ── */}
          <div className="bg-card border border-border rounded-xl p-6">
            <div className="flex flex-wrap items-center justify-between gap-4 mb-5">
              <h2 className="text-lg font-headline font-bold text-foreground flex items-center gap-2">
                <Icon name="FireIcon" size={20} className="text-orange-500" variant="solid" />
                Daily Streak &amp; Check-in
              </h2>
              <div className="flex items-center gap-4">
                <div className="text-center">
                  <p className="text-2xl font-bold text-orange-500">{checkinData?.streak ?? user.profile?.streak ?? 0}</p>
                  <p className="text-xs text-muted-foreground">day streak</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-amber-500">{checkinData?.total_points ?? user.profile?.points ?? 0}</p>
                  <p className="text-xs text-muted-foreground">total points</p>
                </div>
                <button
                  onClick={handleDailyCheckin}
                  disabled={checkinData?.checked_in_today}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                    checkinData?.checked_in_today
                      ? 'bg-success/10 text-success border border-success/30 cursor-default'
                      : 'bg-orange-500 hover:bg-orange-600 text-white shadow-sm'
                  }`}
                >
                  <Icon name={checkinData?.checked_in_today ? 'CheckCircleIcon' : 'FireIcon'} size={16} variant="solid" />
                  {checkinData?.checked_in_today ? 'Checked In Today' : 'Check In (+5 pts)'}
                </button>
              </div>
            </div>

            {/* 30-day calendar */}
            <div>
              <p className="text-xs text-muted-foreground mb-2">Last 30 days</p>
              <div className="flex flex-wrap gap-1">
                {Array.from({ length: 30 }, (_, i) => {
                  const d = new Date();
                  d.setDate(d.getDate() - (29 - i));
                  const dateStr = d.toISOString().split('T')[0];
                  const active = checkinData?.checkin_dates?.includes(dateStr) ?? false;
                  const isToday = i === 29;
                  return (
                    <div
                      key={dateStr}
                      title={dateStr}
                      className={`w-6 h-6 rounded-sm transition-colors ${
                        active
                          ? 'bg-orange-500'
                          : isToday
                          ? 'bg-surface border-2 border-orange-300/50'
                          : 'bg-surface'
                      }`}
                    />
                  );
                })}
              </div>
              <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                <div className="w-3 h-3 rounded-sm bg-surface border border-border" />
                <span>No activity</span>
                <div className="w-3 h-3 rounded-sm bg-orange-500 ml-2" />
                <span>Checked in</span>
              </div>
            </div>
          </div>

          {/* ── Subscription row ── */}
          <div className="bg-card border border-border rounded-xl p-4 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-brand-primary/10 flex items-center justify-center">
                <Icon name="CreditCardIcon" size={20} className="text-brand-primary" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Plan</p>
                <p className="text-sm font-semibold text-foreground capitalize">{subscription.tier}</p>
              </div>
            </div>
            <div className="flex items-center gap-6 text-sm">
              <span className="text-muted-foreground">
                Scans: <span className="font-semibold text-foreground">
                  {subscription.scansUsed}/{subscription.scansLimit === 'unlimited' ? '∞' : subscription.scansLimit}
                </span>
              </span>
              <span className="text-muted-foreground">
                Alerts: <span className="font-semibold text-foreground">
                  {subscription.alertsUsed}/{subscription.alertsLimit === 'unlimited' ? '∞' : subscription.alertsLimit}
                </span>
              </span>
              <span className="text-muted-foreground">
                API: <span className="font-semibold text-foreground">
                  {subscription.apiCallsUsed}/{subscription.apiCallsLimit === 'unlimited' ? '∞' : subscription.apiCallsLimit}
                </span>
              </span>
            </div>
            <Link href="/pricing" className="text-sm font-semibold text-brand-primary hover:text-brand-primary/80 transition-colors flex items-center gap-1">
              {subscription.tier === 'free' ? 'Upgrade Plan' : 'Manage Plan'}
              <Icon name="ArrowRightIcon" size={14} />
            </Link>
          </div>

          {/* ── Edit profile + Change password ── */}
          <div className="grid lg:grid-cols-2 gap-6">
            <div className="bg-card border border-border rounded-xl p-6">
              <h2 className="text-lg font-headline font-bold text-foreground mb-5 flex items-center gap-2">
                <Icon name="UserCircleIcon" size={20} className="text-brand-primary" />
                Edit Profile
              </h2>
              <form onSubmit={handleSaveProfile} className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-foreground mb-1">First Name</label>
                    <input
                      type="text"
                      value={profileForm.first_name}
                      onChange={e => setProfileForm(f => ({ ...f, first_name: e.target.value }))}
                      className="w-full px-3 py-2 text-sm bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-brand-primary"
                      placeholder="First name"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-foreground mb-1">Last Name</label>
                    <input
                      type="text"
                      value={profileForm.last_name}
                      onChange={e => setProfileForm(f => ({ ...f, last_name: e.target.value }))}
                      className="w-full px-3 py-2 text-sm bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-brand-primary"
                      placeholder="Last name"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1">Username</label>
                  <input
                    type="text"
                    value={user.username}
                    disabled
                    className="w-full px-3 py-2 text-sm bg-surface border border-border rounded-lg text-muted-foreground cursor-not-allowed"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1">Email</label>
                  <input
                    type="email"
                    value={user.email}
                    disabled
                    className="w-full px-3 py-2 text-sm bg-surface border border-border rounded-lg text-muted-foreground cursor-not-allowed"
                  />
                </div>
                <button
                  type="submit"
                  disabled={savingProfile}
                  className="w-full py-2 text-sm font-semibold bg-brand-primary text-white rounded-lg hover:bg-brand-primary/90 disabled:opacity-60 transition-colors"
                >
                  {savingProfile ? 'Saving…' : 'Save Changes'}
                </button>
              </form>
            </div>

            <div className="bg-card border border-border rounded-xl p-6">
              <h2 className="text-lg font-headline font-bold text-foreground mb-5 flex items-center gap-2">
                <Icon name="LockClosedIcon" size={20} className="text-brand-primary" />
                Change Password
              </h2>
              <form onSubmit={handleChangePassword} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1">Current Password</label>
                  <input
                    type="password"
                    value={pwForm.old_password}
                    onChange={e => setPwForm(f => ({ ...f, old_password: e.target.value }))}
                    className="w-full px-3 py-2 text-sm bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-brand-primary"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1">New Password</label>
                  <input
                    type="password"
                    value={pwForm.new_password}
                    onChange={e => setPwForm(f => ({ ...f, new_password: e.target.value }))}
                    className="w-full px-3 py-2 text-sm bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-brand-primary"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1">Confirm New Password</label>
                  <input
                    type="password"
                    value={pwForm.confirm_password}
                    onChange={e => setPwForm(f => ({ ...f, confirm_password: e.target.value }))}
                    className="w-full px-3 py-2 text-sm bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-brand-primary"
                  />
                </div>
                {pwError && (
                  <p className="text-xs text-error flex items-center gap-1">
                    <Icon name="ExclamationCircleIcon" size={13} />
                    {pwError}
                  </p>
                )}
                <button
                  type="submit"
                  disabled={savingPw}
                  className="w-full py-2 text-sm font-semibold bg-brand-primary text-white rounded-lg hover:bg-brand-primary/90 disabled:opacity-60 transition-colors"
                >
                  {savingPw ? 'Updating…' : 'Update Password'}
                </button>
              </form>
            </div>
          </div>

          {/* ── Recent Activity ── */}
          {activity.length > 0 && (
            <div className="bg-card border border-border rounded-xl p-6">
              <h2 className="text-lg font-headline font-bold text-foreground mb-4 flex items-center gap-2">
                <Icon name="ClockIcon" size={20} className="text-brand-primary" />
                Recent Activity
              </h2>
              <div className="divide-y divide-border/50">
                {activity.map((item, i) => {
                  const cfg = activityConfig[item.type] ?? { icon: 'BellIcon', color: 'text-muted-foreground', bg: 'bg-surface' };
                  return (
                    <div key={i} className="flex items-start gap-3 py-3 first:pt-0 last:pb-0">
                      <div className={`flex-shrink-0 w-8 h-8 rounded-full ${cfg.bg} flex items-center justify-center mt-0.5`}>
                        <Icon name={cfg.icon as any} size={14} className={cfg.color} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-foreground truncate">{item.description}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {item.timestamp ? new Date(item.timestamp).toLocaleString() : ''}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ── Quick links ── */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { href: '/personal-dashboard',           icon: 'ChartBarIcon',           label: 'Dashboard' },
              { href: '/scan-detect-hub',               icon: 'ShieldCheckIcon',        label: 'Scan & Detect' },
              { href: '/interactive-learning-lab',      icon: 'AcademicCapIcon',        label: 'Learning Lab' },
              { href: '/threat-intelligence-database',  icon: 'CircleStackIcon',        label: 'Threat DB' },
            ].map(link => (
              <Link
                key={link.href}
                href={link.href}
                className="flex items-center gap-2 p-3 bg-card border border-border rounded-xl hover:border-brand-primary/50 hover:bg-brand-primary/5 transition-all text-sm font-medium text-foreground group"
              >
                <Icon name={link.icon as any} size={18} className="text-brand-primary group-hover:scale-110 transition-transform" />
                <span className="truncate">{link.label}</span>
              </Link>
            ))}
          </div>

        </div>
      </main>

      <footer className="bg-card border-t border-border py-6 px-4 text-center">
        <p className="text-sm text-muted-foreground">
          &copy; {new Date().getFullYear()} PhishGuard. All rights reserved.
        </p>
      </footer>
    </div>
  );
}
