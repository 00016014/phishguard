'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import dynamic from 'next/dynamic';
import Icon from '@/components/ui/AppIcon';
import LearningStats from './LearningStats';
import ChallengeCard from './ChallengeCard';
import LeaderboardSection from './LeaderboardSection';
import { LearningLabService } from '@/services/LearningLabService';
import { invalidateCache } from '@/lib/apiFetch';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

const SimulationModal = dynamic(() => import('./SimulationModal'), { ssr: false });
const QuizModal = dynamic(() => import('./QuizModal'), { ssr: false });

interface Challenge {
  id: number;
  title: string;
  description: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert';
  type: 'Quiz' | 'Simulation' | 'Assessment';
  duration: string;
  points: number;
  completed: boolean;
  icon: string;
}

export default function LearningLabInteractive() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const [activeFilter, setActiveFilter] = useState<'All' | 'Quiz' | 'Simulation' | 'Assessment'>(
    'All'
  );
  const [activeDifficulty, setActiveDifficulty] = useState<
    'All' | 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert'
  >('All');
  const [selectedSimulation, setSelectedSimulation] = useState<any | null>(null);
  const [selectedQuiz, setSelectedQuiz] = useState<any | null>(null);
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [moduleBanner, setModuleBanner] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && !user) router.push('/login');
  }, [loading, user]);

  useEffect(() => {
    if (!user) return; // wait for auth to resolve
    loadData();
  }, [user]);

  const searchParams = useSearchParams();
  const autoOpenedRef = useRef(false);

  const loadData = async () => {
    const [challengesData, statsData, leaderboardData] = await Promise.all([
      LearningLabService.getChallenges(),
      LearningLabService.getStats(),
      LearningLabService.getLeaderboard(),
    ]);
    setChallenges(challengesData);
    setStats(statsData);
    setLeaderboard(leaderboardData);
    // Auto-filter by module from URL param (e.g. ?module=phishing-fundamentals)
    const moduleParam = searchParams?.get('module');
    const moduleDifficultyMap: Record<string, { difficulty: typeof activeDifficulty; label: string }> = {
      'phishing-fundamentals': { difficulty: 'Beginner', label: 'Phishing Fundamentals' },
      'advanced-threat-detection': { difficulty: 'Intermediate', label: 'Advanced Threat Detection' },
      'security-response-protocols': { difficulty: 'Advanced', label: 'Security Response Protocols' },
    };
    if (moduleParam && moduleDifficultyMap[moduleParam]) {
      const { difficulty, label } = moduleDifficultyMap[moduleParam];
      setActiveDifficulty(difficulty);
      setModuleBanner(label);
    }
    // Auto-open challenge from URL param (e.g. ?challenge=3)
    const challengeParam = searchParams?.get('challenge');
    if (challengeParam && !autoOpenedRef.current) {
      const target = challengesData.find((c: any) => String(c.id) === challengeParam);
      if (target) {
        autoOpenedRef.current = true;
        if (target.type === 'Simulation') {
          setSelectedSimulation({ ...target.content_data, id: target.id });
        } else if (target.type === 'Quiz' || target.type === 'Assessment') {
          setSelectedQuiz({ ...target.content_data, id: target.id, title: target.title });
        }
      }
    }
  };

  const handleStartChallenge = (id: number) => {
    const challenge = challenges.find((c) => c.id === id) as any;
    if (!challenge) return;

    if (challenge.type === 'Simulation') {
      setSelectedSimulation({
        ...challenge.content_data,
        id: challenge.id,
      });
    } else if (challenge.type === 'Quiz' || challenge.type === 'Assessment') {
      setSelectedQuiz({
        ...challenge.content_data,
        id: challenge.id,
        title: challenge.title,
      });
    }
  };

  const handleSimulationSubmit = async (isPhishing: boolean) => {
    if (!selectedSimulation) return;
    const score = isPhishing === selectedSimulation.isPhishing ? 100 : 0;
    await LearningLabService.completeChallenge(selectedSimulation.id, score);
    if (score === 100) {
      toast.success('Correct! Simulation completed.');
    } else {
      toast.error('Incorrect — the simulation has been recorded.');
    }
    invalidateCache('learning-lab');
    loadData();
  };

  const handleQuizComplete = async (score: number): Promise<{ passed: boolean; score: number; message?: string }> => {
    if (!selectedQuiz) return { passed: false, score: 0, message: 'Quiz not found.' };
    const finalScore = (score / selectedQuiz.questions.length) * 100;
    const result = await LearningLabService.completeChallenge(selectedQuiz.id, Math.round(finalScore));
    if (result?.passed) {
      toast.success(`Quiz passed! Score: ${Math.round(finalScore)}%`);
      invalidateCache('learning-lab');
      loadData();
    } else {
      toast.error(`Quiz not passed. Score: ${Math.round(finalScore)}% — try again!`);
    }
    return result ?? { passed: false, score: Math.round(finalScore) };
  };

  const filteredChallenges = challenges.filter((challenge) => {
    const typeMatch = activeFilter === 'All' || challenge.type === activeFilter;
    const difficultyMatch = activeDifficulty === 'All' || challenge.difficulty === activeDifficulty;
    return typeMatch && difficultyMatch;
  });

  if (loading || !user || !stats) {
    return (
      <div className="min-h-screen bg-background">
        <div className="h-16" />
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse space-y-8">
            <div className="h-32 bg-surface rounded-lg" />
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-32 bg-surface rounded-lg" />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="container mx-auto px-4 py-8 space-y-8">
        <div className="bg-gradient-to-r from-brand-primary to-brand-secondary rounded-lg p-8 text-white">
          <div className="flex items-center space-x-3 mb-4">
            <Icon name="AcademicCapIcon" size={40} variant="solid" />
            <div>
              <h1 className="text-3xl lg:text-4xl font-headline font-bold">
                Interactive Learning Lab
              </h1>
              <p className="text-white/90 mt-2">
                Master cybersecurity through hands-on practice and gamified challenges
              </p>
            </div>
          </div>
        </div>

        <LearningStats stats={stats} />

        {moduleBanner && (
          <div className="flex items-center justify-between bg-brand-primary/10 border border-brand-primary/30 rounded-lg px-5 py-3">
            <div className="flex items-center gap-3">
              <Icon name="AcademicCapIcon" size={20} className="text-brand-primary" variant="solid" />
              <div>
                <p className="text-sm font-semibold text-brand-primary">Continuing from Homepage</p>
                <p className="text-xs text-muted-foreground">Showing challenges for: <span className="font-medium text-foreground">{moduleBanner}</span></p>
              </div>
            </div>
            <button onClick={() => { setModuleBanner(null); setActiveDifficulty('All'); }}
              className="text-muted-foreground hover:text-foreground transition-colors">
              <Icon name="XMarkIcon" size={18} />
            </button>
          </div>
        )}

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-card rounded-lg border border-border p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-headline font-bold text-foreground">
                  Available Challenges
                </h2>
                <div className="flex items-center space-x-2">
                  <Icon name="FunnelIcon" size={20} className="text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Filters</span>
                </div>
              </div>

              <div className="space-y-4 mb-6">
                <div>
                  <div className="text-sm font-medium text-foreground mb-2">Challenge Type</div>
                  <div className="flex flex-wrap gap-2">
                    {(['All', 'Quiz', 'Simulation', 'Assessment'] as const).map((filter) => (
                      <button
                        key={filter}
                        onClick={() => setActiveFilter(filter)}
                        className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                          activeFilter === filter
                            ? 'bg-brand-accent text-white'
                            : 'bg-surface text-foreground hover:bg-muted'
                        }`}
                      >
                        {filter}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <div className="text-sm font-medium text-foreground mb-2">Difficulty Level</div>
                  <div className="flex flex-wrap gap-2">
                    {(['All', 'Beginner', 'Intermediate', 'Advanced', 'Expert'] as const).map(
                      (difficulty) => (
                        <button
                          key={difficulty}
                          onClick={() => setActiveDifficulty(difficulty)}
                          className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                            activeDifficulty === difficulty
                              ? 'bg-brand-primary text-white'
                              : 'bg-surface text-foreground hover:bg-muted'
                          }`}
                        >
                          {difficulty}
                        </button>
                      )
                    )}
                  </div>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                {filteredChallenges.map((challenge) => (
                  <ChallengeCard
                    key={challenge.id}
                    challenge={challenge}
                    onStart={handleStartChallenge}
                  />
                ))}
              </div>

              {filteredChallenges.length === 0 && (
                <div className="text-center py-12">
                  <Icon
                    name="MagnifyingGlassIcon"
                    size={48}
                    className="mx-auto text-muted-foreground mb-4"
                  />
                  <p className="text-muted-foreground">No challenges match your filters</p>
                </div>
              )}
            </div>
          </div>

          <div className="space-y-6">
            <LeaderboardSection
              entries={leaderboard}
              currentUserRank={leaderboard.findIndex((e) => e.name === user?.username) + 1 || 5}
            />

            <div className="bg-card rounded-lg border border-border p-6">
              <h3 className="text-lg font-headline font-bold text-foreground mb-4">
                Your Progress
              </h3>
              {(() => {
                const streak = stats?.currentStreak ?? 0;
                const completed = stats?.completedChallenges ?? 0;
                const total = stats?.totalChallenges ?? 0;
                const score = stats?.securityScore ?? 0;
                const pct = total > 0 ? Math.round((completed / total) * 100) : 0;
                const nextChallenge = challenges.find((c) => !c.completed);
                const userRankIndex = leaderboard.findIndex((e) => e.name === user?.username);
                const userRank = userRankIndex >= 0 ? userRankIndex + 1 : null;
                const userScore = userRankIndex >= 0 ? leaderboard[userRankIndex].score : null;
                const aboveEntry = userRankIndex > 0 ? leaderboard[userRankIndex - 1] : null;
                const ptsDiff = aboveEntry && userScore != null ? aboveEntry.score - userScore : null;

                return (
                  <div className="space-y-3">
                    {/* Streak */}
                    <div className={`flex items-start space-x-3 p-3 rounded-lg ${
                      streak > 0 ? 'bg-warning/10 border border-warning/20' : 'bg-surface'
                    }`}>
                      <Icon name="FireIcon" size={20} className={`flex-shrink-0 mt-0.5 ${streak > 0 ? 'text-warning' : 'text-muted-foreground'}`} />
                      <div>
                        <h4 className="font-semibold text-foreground text-sm">
                          {streak > 0 ? `${streak}-Day Streak` : 'No Active Streak'}
                        </h4>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {streak === 0
                            ? 'Complete a challenge today to start your streak.'
                            : streak >= 7
                            ? `Amazing! ${streak} days consistent — you're unstoppable.`
                            : `${7 - streak} more day${7 - streak > 1 ? 's' : ''} to hit a 7-day streak!`}
                        </p>
                      </div>
                    </div>

                    {/* Progress */}
                    <div className="p-3 rounded-lg bg-surface space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <Icon name="ChartBarIcon" size={18} className="text-brand-primary" />
                          <h4 className="font-semibold text-foreground text-sm">{completed}/{total} Completed</h4>
                        </div>
                        <span className="text-xs font-bold text-brand-primary">{pct}%</span>
                      </div>
                      <div className="w-full bg-border rounded-full h-1.5">
                        <div
                          className="bg-brand-primary h-1.5 rounded-full transition-all duration-500"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <p className="text-xs text-muted-foreground">Security score: <span className="font-semibold text-foreground">{score}</span> pts</p>
                    </div>

                    {/* Next challenge */}
                    {nextChallenge ? (
                      <div className="flex items-start space-x-3 p-3 rounded-lg bg-brand-primary/5 border border-brand-primary/20">
                        <Icon name="LightBulbIcon" size={20} className="text-brand-primary flex-shrink-0 mt-0.5" />
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold text-foreground text-sm">Up Next</h4>
                          <p className="text-xs text-muted-foreground mt-0.5 truncate">{nextChallenge.title}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-xs text-muted-foreground">{nextChallenge.difficulty} · {nextChallenge.points} pts</span>
                          </div>
                          <button
                            onClick={() => handleStartChallenge(nextChallenge.id)}
                            className="mt-2 text-xs font-semibold text-brand-primary hover:text-brand-secondary transition-colors"
                          >
                            Start now →
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-start space-x-3 p-3 rounded-lg bg-success/10 border border-success/20">
                        <Icon name="CheckBadgeIcon" size={20} className="text-success flex-shrink-0 mt-0.5" />
                        <div>
                          <h4 className="font-semibold text-foreground text-sm">All Caught Up!</h4>
                          <p className="text-xs text-muted-foreground mt-0.5">You've completed every available challenge.</p>
                        </div>
                      </div>
                    )}

                    {/* Leaderboard rank */}
                    {userRank ? (
                      <div className="flex items-center justify-between p-3 rounded-lg bg-surface">
                        <div className="flex items-center space-x-2">
                          <Icon name="TrophyIcon" size={20} className="text-amber-500" />
                          <div>
                            <h4 className="font-semibold text-foreground text-sm">Rank #{userRank}</h4>
                            <p className="text-xs text-muted-foreground">of {leaderboard.length} users</p>
                          </div>
                        </div>
                        {ptsDiff != null && ptsDiff > 0 && (
                          <span className="text-xs text-muted-foreground text-right">
                            +{ptsDiff} pts<br />to #{userRank - 1}
                          </span>
                        )}
                        {userRank === 1 && (
                          <span className="text-xs font-semibold text-amber-500">🥇 Top!</span>
                        )}
                      </div>
                    ) : (
                      <div className="flex items-center space-x-2 p-3 rounded-lg bg-surface">
                        <Icon name="TrophyIcon" size={20} className="text-muted-foreground" />
                        <p className="text-xs text-muted-foreground">Complete challenges to appear on the leaderboard.</p>
                      </div>
                    )}
                  </div>
                );
              })()}
            </div>
          </div>
        </div>
      </div>

      {selectedSimulation && (
        <SimulationModal
          scenario={selectedSimulation}
          onClose={() => setSelectedSimulation(null)}
          onSubmit={handleSimulationSubmit}
        />
      )}

      {selectedQuiz && (
        <QuizModal
          quiz={selectedQuiz}
          onClose={() => setSelectedQuiz(null)}
          onComplete={handleQuizComplete}
        />
      )}
    </>
  );
}
