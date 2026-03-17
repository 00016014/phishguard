'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import SecurityScoreCard from './SecurityScoreCard';
import RecentScansCard from './RecentScansCard';
import LearningProgressCard from './LearningProgressCard';
import QuickActionsCard from './QuickActionsCard';
import ThreatTrendsCard from './ThreatTrendsCard';
import BookmarkedThreatsCard from './BookmarkedThreatsCard';
import CommunityActivityCard from './CommunityActivityCard';
import UpgradePromptCard from './UpgradePromptCard';
import SubscriptionBannerCard from './SubscriptionBannerCard';
import CustomAlertsCard from './CustomAlertsCard';
import UpcomingRecommendationsCard from './UpcomingRecommendationsCard';
import { DashboardService } from '@/services/DashboardService';
import { API_BASE_URL, cachedGet } from '@/lib/apiFetch';
import { useAuth } from '@/contexts/AuthContext';

export default function DashboardInteractive() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const [data, setData] = useState<any>(null);
  const [bookmarks, setBookmarks] = useState<any[]>([]);
  const [activity, setActivity] = useState<any[]>([]);
  const [alerts, setAlerts] = useState<any[]>([]);
  const [alertsCount, setAlertsCount] = useState(0);
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [learningModules, setLearningModules] = useState<any[]>([]);

  useEffect(() => {
    if (!loading && !user) router.push('/login');
  }, [loading, user]);

  useEffect(() => {
    if (!user) return; // don't fetch until auth resolves
    loadAll();
  }, [user]);

  const loadAll = async () => {
    try {
      const [dash, bm, act, al, rec, modules] = await Promise.allSettled([
        DashboardService.getDashboardData(),
        DashboardService.getBookmarks(),
        DashboardService.getActivity(),
        DashboardService.getAlerts(),
        DashboardService.getRecommendations(),
        cachedGet(`${API_BASE_URL}/learning-lab/`),
      ]);
      if (dash.status === 'fulfilled') setData(dash.value);
      if (bm.status === 'fulfilled') {
        const rawBm: any[] = Array.isArray(bm.value) ? bm.value : (bm.value?.results ?? []);
        setBookmarks(rawBm.map((b: any) => ({
          id: b.threat_id ?? String(b.id),
          dbId: b.id,
          title: b.threat_title ?? b.title ?? 'Unknown Threat',
          category: b.threat_type ?? b.category ?? 'Unknown',
          severity: b.threat_severity ?? b.severity ?? 'medium',
          dateAdded: b.created_at ? new Date(b.created_at).toLocaleDateString() : '',
        })));
      }
      if (act.status === 'fulfilled') {
        const raw: any[] = Array.isArray(act.value) ? act.value : (act.value?.results ?? []);
        setActivity(raw.map((item: any, i: number) => ({
          id: String(i),
          type: item.type === 'learning' ? 'comment' : item.type === 'scan' ? 'discussion' : 'report',
          title: item.description ?? 'Activity',
          author: 'You',
          authorAvatar: '',
          authorAvatarAlt: 'User avatar',
          timestamp: item.timestamp ? new Date(item.timestamp).toLocaleString() : '',
          link: item.type === 'learning'
            ? `/interactive-learning-lab?challenge=${item.ref_id}`
            : item.type === 'scan'
              ? '/scan-detect-hub'
              : `/threat-intelligence-database`,  // report
          ref_id: item.ref_id,
        })));
      }
      if (al.status === 'fulfilled') {
        const raw: any[] = Array.isArray(al.value) ? al.value : (al.value?.results ?? []);
        setAlerts(raw.map((a: any) => ({
          id: String(a.id),
          dbId: a.id,
          title: a.title,
          description: a.keyword ? `Keyword: ${a.keyword}` : (a.threat_type || 'Custom alert'),
          category: a.threat_type || 'Threat',
          enabled: a.active ?? true,
          frequency: 'Real-time',
        })));
        setAlertsCount(raw.length);
      }
      if (rec.status === 'fulfilled') {
        const raw: any[] = Array.isArray(rec.value) ? rec.value : (rec.value?.results ?? []);
        setRecommendations(raw.map((m: any) => ({
          id: String(m.id),
          type: m.type === 'Quiz' ? 'assessment' : m.type === 'Simulation' ? 'webinar' : 'course',
          title: m.title,
          description: m.description,
          date: '',
          duration: m.duration || '–',
          difficulty: m.difficulty || 'Beginner',
          challengeId: String(m.id),
        })));
      }
      if (modules.status === 'fulfilled') {
        const raw: any[] = Array.isArray(modules.value) ? modules.value : (modules.value?.results ?? []);
        setLearningModules(raw.slice(0, 4).map((m: any) => ({
          id: String(m.id),
          title: m.title,
          category: m.type || 'Cybersecurity',
          progress: m.completed ? 100 : 0,
          totalLessons: 1,
          completedLessons: m.completed ? 1 : 0,
        })));
      }
    } catch { /* ignore */ }
  };

  if (loading || !data) {
    return (
      <div className="animate-pulse space-y-8">
        <div className="h-32 bg-surface rounded-xl" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="h-64 bg-surface rounded-xl" />
          <div className="h-64 bg-surface rounded-xl" />
          <div className="h-64 bg-surface rounded-xl" />
        </div>
      </div>
    );
  }

  // Use real 7-day trend data from backend
  const liveTrends = (data.trendData || []).map((t: any) => ({
    month: t.date,
    threats: t.threats,
  }));

  // Compute trend direction from trendData
  const trendPoints = (data.trendData || []) as any[];
  const todayTotal = trendPoints.length > 0 ? trendPoints[trendPoints.length - 1].total : 0;
  const prevTotal = trendPoints.length > 1 ? trendPoints[trendPoints.length - 2].total : 0;
  const scoreTrend: 'up' | 'down' | 'stable' = todayTotal > prevTotal ? 'up' : todayTotal < prevTotal ? 'down' : 'stable';

  return (
    <div className="space-y-8">
      <SubscriptionBannerCard alertsCount={alertsCount} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 space-y-6">
          <SecurityScoreCard
            score={data.securityScore}
            trend={scoreTrend}
            lastUpdated={new Date().toLocaleDateString()}
          />
          <LearningProgressCard
            modules={learningModules}
            overallProgress={Math.round(
              (data.learningProgress.completed / (data.learningProgress.total || 1)) * 100
            )}
          />
          <UpgradePromptCard />
        </div>

        <div className="lg:col-span-2 space-y-6">
          <RecentScansCard
            scans={(data.recentScans || []).map((s: any) => ({
              id: String(s.id),
              url: s.content ?? '',
              result: (s.threat_level === 'safe' || s.threat_level === 'suspicious' || s.threat_level === 'dangerous') ? s.threat_level : 'suspicious',
              timestamp: s.created_at ? new Date(s.created_at).toLocaleString() : 'N/A',
              threatType: s.type ?? '',
            }))}
          />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <ThreatTrendsCard
              data={liveTrends}
            />
            <QuickActionsCard actions={[
              { id: '1', title: 'Scan URL', description: 'Check a suspicious link', icon: 'MagnifyingGlassIcon', href: '/scan-detect-hub', color: 'bg-brand-primary' },
              { id: '2', title: 'Continue Learning', description: 'Resume your course', icon: 'AcademicCapIcon', href: '/interactive-learning-lab', color: 'bg-brand-secondary' },
              { id: '3', title: 'Browse Threats', description: 'Explore threat database', icon: 'CircleStackIcon', href: '/threat-intelligence-database', color: 'bg-brand-accent' },
              { id: '4', title: 'API Docs', description: 'Integrate PhishGuard', icon: 'CodeBracketIcon', href: '/api-documentation', color: 'bg-brand-trust' },
            ]} />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <BookmarkedThreatsCard threats={bookmarks} />
        <CommunityActivityCard activities={activity} />
        <div className="space-y-6">
          <CustomAlertsCard alerts={alerts} onCountChange={setAlertsCount} />
          <UpcomingRecommendationsCard recommendations={recommendations} />
        </div>
      </div>
    </div>
  );
}
