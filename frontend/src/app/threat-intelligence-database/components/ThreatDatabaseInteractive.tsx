'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import Icon from '@/components/ui/AppIcon';
import ThreatCard from './ThreatCard';
import SearchFilters from './SearchFilters';
import ThreatStats from './ThreatStats';
import ThreatDetailModal from './ThreatDetailModal';
import CommunityReportForm from './CommunityReportForm';
import { ThreatService } from '@/services/ThreatService';
import { ContentService } from '@/services/ContentService';
import { DashboardService } from '@/services/DashboardService';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

const ThreatTrendChart = dynamic(() => import('./ThreatTrendChart'), {
  ssr: false,
  loading: () => <div className="h-48 animate-pulse bg-surface rounded-lg" />,
});

interface Threat {
  id: string;
  threat_id?: string; // Add this to map from backend
  title: string;
  type: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  detectedDate: string;
  detected_date?: string; // Add this to map from backend
  affectedUsers: number;
  affected_users?: number; // Add this to map from backend
  description: string;
  image: string;
  alt: string;
  origin: string;
  status: 'active' | 'mitigated' | 'archived';
  communityReports: number;
  community_reports?: number; // Add this to map from backend
  detailedAnalysis: string;
  detailed_analysis?: string; // Add this to map from backend
  preventionTips: string[];
  prevention_tips?: string[]; // Add this to map from backend
  realWorldExamples: string[];
  real_world_examples?: string[]; // Add this to map from backend
  relatedThreats: string[];
  related_threats?: string[]; // Add this to map from backend
  communityInsights: Array<{
    user: string;
    date: string;
    insight: string;
  }>;
  community_insights?: any[]; // Add this to map from backend
}

const ThreatDatabaseInteractive = ({ initialThreatId }: { initialThreatId?: string } = {}) => {
  const router = useRouter();
  const { user } = useAuth();
  const initialOpenedRef = useRef(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState('All Types');
  const [selectedSeverity, setSelectedSeverity] = useState('All Severities');
  const [selectedStatus, setSelectedStatus] = useState('All Status');
  const [selectedOrigin, setSelectedOrigin] = useState('All Origins');
  const [selectedThreat, setSelectedThreat] = useState<Threat | null>(null);
  const [showReportForm, setShowReportForm] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [threats, setThreats] = useState<Threat[]>([]);
  const [loading, setLoading] = useState(true);
  const [threatStats, setThreatStats] = useState<{ totalThreats: number; activeThreats: number; mitigatedThreats: number; communityReports: number } | null>(null);
  const [trendData, setTrendData] = useState<Array<{ month: string; detected: number; mitigated: number }>>([]);
  const [bookmarkedIds, setBookmarkedIds] = useState<Set<string>>(new Set());
  const [bookmarkDbIds, setBookmarkDbIds] = useState<Map<string, number>>(new Map());
  const [mitigatedIds, setMitigatedIds] = useState<Set<string>>(new Set());
  const [mitigatedDbIds, setMitigatedDbIds] = useState<Map<string, number>>(new Map());
  const [mitigatedRecords, setMitigatedRecords] = useState<any[]>([]);
  const threatsPerPage = 9;

  useEffect(() => {
    loadStats();
  }, []);

  useEffect(() => {
    if (user) loadBookmarks();
  }, [user]);

  useEffect(() => {
    if (user) loadMitigated();
  }, [user]);

  const loadBookmarks = async () => {
    const data = await DashboardService.getBookmarks();
    const ids = new Set<string>();
    const dbIds = new Map<string, number>();
    (data ?? []).forEach((b: any) => {
      ids.add(b.threat_id);
      dbIds.set(b.threat_id, b.id);
    });
    setBookmarkedIds(ids);
    setBookmarkDbIds(dbIds);
  };

  const handleToggleBookmark = async (threat: Threat) => {
    if (!user) return;
    const tid = threat.id;
    if (bookmarkedIds.has(tid)) {
      const dbId = bookmarkDbIds.get(tid);
      if (dbId) await DashboardService.removeBookmark(dbId);
      setBookmarkedIds(prev => { const s = new Set(prev); s.delete(tid); return s; });
      setBookmarkDbIds(prev => { const m = new Map(prev); m.delete(tid); return m; });
      toast.success('Bookmark removed');
    } else {
      const result = await DashboardService.addBookmark({
        threat_id: tid,
        threat_title: threat.title,
        threat_type: threat.type,
        threat_severity: threat.severity,
      });
      if (result?.id) {
        setBookmarkedIds(prev => new Set(prev).add(tid));
        setBookmarkDbIds(prev => new Map(prev).set(tid, result.id));
        toast.success('Threat bookmarked');
      }
    }
  };

  const loadMitigated = async () => {
    const data = await DashboardService.getMitigatedThreats();
    const ids = new Set<string>();
    const dbIds = new Map<string, number>();
    (data ?? []).forEach((m: any) => {
      ids.add(m.threat_id);
      dbIds.set(m.threat_id, m.id);
    });
    setMitigatedIds(ids);
    setMitigatedDbIds(dbIds);
    setMitigatedRecords(data ?? []);
  };

  const handleToggleMitigate = async (threat: Threat) => {
    if (!user) return;
    const tid = threat.id;
    if (mitigatedIds.has(tid)) {
      const dbId = mitigatedDbIds.get(tid);
      if (dbId) await DashboardService.removeMitigatedThreat(dbId);
      setMitigatedIds(prev => { const s = new Set(prev); s.delete(tid); return s; });
      setMitigatedDbIds(prev => { const m = new Map(prev); m.delete(tid); return m; });
      setMitigatedRecords(prev => prev.filter(r => r.threat_id !== tid));
      toast.success('Mitigation mark removed');
    } else {
      const result = await DashboardService.addMitigatedThreat({
        threat_id: tid,
        threat_title: threat.title,
        threat_type: threat.type,
        threat_severity: threat.severity,
      });
      if (result?.id) {
        setMitigatedIds(prev => new Set(prev).add(tid));
        setMitigatedDbIds(prev => new Map(prev).set(tid, result.id));
        setMitigatedRecords(prev => [...prev, result]);
        toast.success('Threat marked as mitigated');
      }
    }
  };

  const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const displayTrendData = useMemo(() => {
    if (!user || mitigatedRecords.length === 0) return trendData;
    const monthCounts: Record<string, number> = {};
    mitigatedRecords.forEach((m: any) => {
      if (m.created_at) {
        const d = new Date(m.created_at);
        const label = `${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
        monthCounts[label] = (monthCounts[label] || 0) + 1;
      }
    });
    return trendData.map(entry => ({
      ...entry,
      mitigated: monthCounts[entry.month] ?? 0,
    }));
  }, [trendData, mitigatedRecords, user]);

  useEffect(() => {
    loadThreats();
  }, [searchQuery, selectedType, selectedSeverity, selectedStatus, selectedOrigin]);

  const loadStats = async () => {
    const data = await ContentService.getThreatStats();
    if (data) {
      setThreatStats({
        totalThreats: data.totalThreats,
        activeThreats: data.activeThreats,
        mitigatedThreats: data.mitigatedThreats,
        communityReports: data.communityReports,
      });
      setTrendData(data.monthlyTrend || []);
    }
  };

  const loadThreats = async () => {
    setLoading(true);
    const data = await ContentService.getThreatIntelligence({
      search: searchQuery,
      type: selectedType,
      severity: selectedSeverity,
      status: selectedStatus,
      origin: selectedOrigin
    });
    
    // Map backend snake_case to frontend camelCase
    const mappedThreats = data.map((t: any) => ({
      ...t,
      id: t.threat_id,
      detectedDate: t.detected_date,
      affectedUsers: t.affected_users,
      communityReports: t.community_reports,
      detailedAnalysis: t.detailed_analysis,
      preventionTips: t.prevention_tips,
      realWorldExamples: t.real_world_examples,
      relatedThreats: t.related_threats,
      communityInsights: t.community_insights
    }));
    
    setThreats(mappedThreats);
    setLoading(false);
  };

  // Auto-open modal when coming from a direct link
  useEffect(() => {
    if (initialThreatId && threats.length > 0 && !initialOpenedRef.current) {
      const match = threats.find((t) => t.id === initialThreatId);
      if (match) {
        initialOpenedRef.current = true;
        setSelectedThreat(match);
      }
    }
  }, [initialThreatId, threats]);

  const filteredThreats = threats; // Backend handles filtering
  const totalPages = Math.ceil(filteredThreats.length / threatsPerPage);
  const startIndex = (currentPage - 1) * threatsPerPage;
  const endIndex = startIndex + threatsPerPage;
  const currentThreats = filteredThreats.slice(startIndex, endIndex);

  const handleViewDetails = (id: string) => {
    const threat = threats.find((t) => t.id === id);
    if (threat) {
      setSelectedThreat(threat);
    }
  };

  const handleCloseModal = () => {
    setSelectedThreat(null);
    if (initialThreatId) {
      router.push('/threat-intelligence-database');
    }
  };

  const handleClearFilters = () => {
    setSearchQuery('');
    setSelectedType('All Types');
    setSelectedSeverity('All Severities');
    setSelectedStatus('All Status');
    setSelectedOrigin('All Origins');
    setCurrentPage(1);
  };

  const handleReportSubmit = async (report: any) => {
    const result = await ThreatService.submitReport(report);
    if (result && (result.id || result.title)) {
      toast.success('Threat report submitted — thank you!');
      return;
    }
    const msg = result?.detail || result?.error || result?.non_field_errors?.[0] || 'Submission failed. Please try again.';
    toast.error(msg);
    throw new Error(msg);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-4xl font-headline font-bold text-foreground mb-2">
            Threat Intelligence Database
          </h1>
          <p className="text-lg text-muted-foreground">
            Comprehensive repository of known threats with community-driven insights
          </p>
        </div>
        <button
          onClick={() => setShowReportForm(true)}
          className="px-6 py-3 bg-brand-accent text-white font-cta font-semibold rounded-md hover:bg-brand-accent/90 transition-colors flex items-center justify-center space-x-2 shadow-md"
        >
          <Icon name="FlagIcon" size={20} />
          <span>Report New Threat</span>
        </button>
      </div>

      {threatStats && (
        <ThreatStats
          stats={user ? { ...threatStats, mitigatedThreats: mitigatedIds.size } : threatStats}
        />
      )}

      {trendData.length > 0 && <ThreatTrendChart data={displayTrendData} />}

      <SearchFilters
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        selectedType={selectedType}
        onTypeChange={setSelectedType}
        selectedSeverity={selectedSeverity}
        onSeverityChange={setSelectedSeverity}
        selectedStatus={selectedStatus}
        onStatusChange={setSelectedStatus}
        selectedOrigin={selectedOrigin}
        onOriginChange={setSelectedOrigin}
        onClearFilters={handleClearFilters}
      />

      <div className="bg-card border border-border rounded-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-headline font-bold text-foreground">
            Threat Catalog ({filteredThreats.length} results)
          </h2>
          <div className="text-sm text-muted-foreground">
            Showing {startIndex + 1}-{Math.min(endIndex, filteredThreats.length)} of{' '}
            {filteredThreats.length}
          </div>
        </div>

        {currentThreats.length > 0 ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {currentThreats.map((threat) => (
                <ThreatCard
                  key={threat.id}
                  threat={threat}
                  onViewDetails={handleViewDetails}
                  isBookmarked={bookmarkedIds.has(threat.id)}
                  onBookmark={() => handleToggleBookmark(threat)}
                  isMitigated={mitigatedIds.has(threat.id)}
                  onMitigate={() => handleToggleMitigate(threat)}
                />
              ))}
            </div>

            {totalPages > 1 && (
              <div className="flex items-center justify-center space-x-2 mt-8 pt-6 border-t border-border">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="px-4 py-2 bg-surface text-foreground rounded-md hover:bg-muted transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                >
                  <Icon name="ChevronLeftIcon" size={20} />
                  <span>Previous</span>
                </button>

                <div className="flex items-center space-x-2">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <button
                      key={page}
                      onClick={() => handlePageChange(page)}
                      className={`w-10 h-10 rounded-md font-semibold transition-colors ${
                        currentPage === page
                          ? 'bg-brand-primary text-white'
                          : 'bg-surface text-foreground hover:bg-muted'
                      }`}
                    >
                      {page}
                    </button>
                  ))}
                </div>

                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 bg-surface text-foreground rounded-md hover:bg-muted transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                >
                  <span>Next</span>
                  <Icon name="ChevronRightIcon" size={20} />
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-16">
            <Icon
              name="MagnifyingGlassIcon"
              size={64}
              className="mx-auto text-muted-foreground mb-4"
            />
            <h3 className="text-xl font-headline font-bold text-foreground mb-2">
              No threats found
            </h3>
            <p className="text-muted-foreground mb-6">
              Try adjusting your search criteria or filters
            </p>
            <button
              onClick={handleClearFilters}
              className="px-6 py-2.5 bg-brand-primary text-white font-cta font-semibold rounded-md hover:bg-brand-primary/90 transition-colors"
            >
              Clear All Filters
            </button>
          </div>
        )}
      </div>

      {selectedThreat && (
        <ThreatDetailModal
          threat={selectedThreat}
          onClose={handleCloseModal}
          isBookmarked={bookmarkedIds.has(selectedThreat.id)}
          onBookmark={() => handleToggleBookmark(selectedThreat)}
          isMitigated={mitigatedIds.has(selectedThreat.id)}
          onMitigate={() => handleToggleMitigate(selectedThreat)}
        />
      )}

      {showReportForm && (
        <CommunityReportForm
          onSubmit={handleReportSubmit}
          onClose={() => setShowReportForm(false)}
        />
      )}
    </div>
  );
};

export default ThreatDatabaseInteractive;
