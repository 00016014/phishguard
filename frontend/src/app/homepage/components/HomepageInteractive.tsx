'use client';

import { useState, useEffect } from 'react';
import Header from '@/components/common/Header';
import HeroSection from './HeroSection';
import TrustSignals from './TrustSignals';
import FeaturesGrid from './FeaturesGrid';
import ThreatIntelligence from './ThreatIntelligence';
import TestimonialsSection from './TestimonialsSection';
import LearningHighlights from './LearningHighlights';
import CTASection from './CTASection';
import Footer from './Footer';
import { ContentService } from '@/services/ContentService';
import type { PlatformStats } from '@/services/ContentService';
import { ScannerService } from '@/services/ScannerService';

interface LiveStats {
  threatsDetected: string;
  usersProtected: string;
  scansCompleted: string;
}

interface TrustSignal {
  id: number;
  type: 'certification' | 'award' | 'partnership';
  name: string;
  description: string;
  logo: string;
  alt: string;
}

interface Feature {
  id: number;
  icon: string;
  title: string;
  description: string;
  link: string;
  color: string;
}

interface ThreatReport {
  id: number;
  title: string;
  category: string;
  severity: 'critical' | 'high' | 'medium';
  date: string;
  description: string;
  affectedUsers: string;
  threat_link?: string;
}

interface Testimonial {
  id: number;
  name: string;
  role: string;
  company: string;
  image: string;
  alt: string;
  quote: string;
  rating: number;
}

interface LearningModule {
  id: number;
  title: string;
  description: string;
  duration: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  points: number;
  icon: string;
  completion_count: number;
  completed: boolean;
}

export default function HomepageInteractive() {
  const [liveStats, setLiveStats] = useState<LiveStats>({
    threatsDetected: '...',
    usersProtected: '...',
    scansCompleted: '...'
  });
  const [trustSignals, setTrustSignals] = useState<TrustSignal[]>([]);
  const [features, setFeatures] = useState<Feature[]>([]);
  const [threatReports, setThreatReports] = useState<ThreatReport[]>([]);
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [learningModules, setLearningModules] = useState<LearningModule[]>([]);
  const [platformStats, setPlatformStats] = useState<PlatformStats | null>(null);
  const [scanStats, setScanStats] = useState<{ threatsBlockedToday: string; totalScans: string; activeUsers: string; detectionRate: string } | null>(null);

  useEffect(() => {
    loadContent();
  }, []);

  const loadContent = async () => {
    const [stats, signals, feats, summaries, tests, modules, pStats, sStats] = await Promise.all([
      ContentService.getLiveStats(),
      ContentService.getTrustSignals(),
      ContentService.getFeatures(),
      ContentService.getThreatSummaries(),
      ContentService.getTestimonials(),
      ContentService.getModuleHighlights(),
      ContentService.getPlatformStats(),
      ScannerService.getScanStats().catch(() => null),
    ]);
    
    if (Object.keys(stats).length > 0) setLiveStats(stats as LiveStats);
    if (signals.length > 0) setTrustSignals(signals);
    if (feats.length > 0) setFeatures(feats);
    if (summaries.length > 0) setThreatReports(summaries);
    if (tests.length > 0) setTestimonials(tests);
    if (modules.length > 0) setLearningModules(modules);
    if (pStats) {
      setPlatformStats(pStats);
      setLiveStats({
        threatsDetected: pStats.threatsDetected,
        usersProtected: pStats.usersProtected,
        scansCompleted: pStats.scansCompleted,
      });
    }
    if (sStats) {
      setScanStats({
        threatsBlockedToday: String(sStats.threatsBlockedToday ?? sStats.threats_today ?? 0),
        totalScans: String(sStats.totalScans ?? sStats.total_scans ?? 0),
        activeUsers: String(sStats.activeScans ?? sStats.active_users ?? 0),
        detectionRate: String(sStats.detectionRate ?? sStats.detection_rate ?? 'N/A'),
      });
    }
  };



  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-16">
        <HeroSection liveStats={liveStats} />
        <TrustSignals signals={trustSignals} />
        <FeaturesGrid features={features} />
        <ThreatIntelligence reports={threatReports} />
        <LearningHighlights modules={learningModules} />
        <TestimonialsSection testimonials={testimonials} platformStats={platformStats} scanStats={scanStats} />
        <CTASection />
      </main>
      <Footer />
    </div>);

}