'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import {
  Award,
  TrendingUp,
  Clock,
  Code2,
  ChevronRight,
  ShieldCheck,
  Sparkles,
  RefreshCw,
  Activity,
  Layers,
  Cpu,
  ExternalLink,
  Flame,
  CheckCircle2
} from 'lucide-react';
import { AnalyticsSummary, SubmissionRecord } from '@/lib/types';
import { ScoreTrendChart } from '@/components/AnalyticsCharts';
import { SubmissionHeatmap } from '@/components/SubmissionHeatmap';
import { useAuth } from '@/components/AuthProvider';

export default function DedicatedDashboardPage() {
  const { user, profile } = useAuth();
  const [analytics, setAnalytics] = useState<AnalyticsSummary | null>(null);
  const [submissions, setSubmissions] = useState<SubmissionRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  const fetchData = useCallback(async (isManual = false) => {
    if (isManual) setIsRefreshing(true);
    try {
      const userParam = user?.id ? `?userId=${encodeURIComponent(user.id)}` : '';
      const [analyticsRes, subsRes] = await Promise.all([
        fetch(`/api/analytics${userParam}`, { cache: 'no-store' }),
        fetch(`/api/submissions${userParam}`, { cache: 'no-store' })
      ]);

      if (analyticsRes.ok) {
        const analyticsData = await analyticsRes.json();
        setAnalytics(analyticsData);
      }

      if (subsRes.ok) {
        const subsData = await subsRes.json();
        if (Array.isArray(subsData)) {
          setSubmissions(subsData);
        }
      }
      setLastUpdated(new Date());
    } catch (err) {
      console.warn('Dashboard fetch error:', err);
    } finally {
      setLoading(false);
      if (isManual) setIsRefreshing(false);
    }
  }, [user?.id]);

  useEffect(() => {
    fetchData();

    // Auto-polling every 5 seconds so submissions update live as user codes
    const interval = setInterval(() => {
      fetchData();
    }, 5000);

    return () => clearInterval(interval);
  }, [fetchData]);

  if (loading && !analytics) {
    return (
      <div className="py-24 text-center space-y-3">
        <RefreshCw className="w-6 h-6 text-[#4285F4] animate-spin mx-auto" />
        <p className="text-xs text-[#8b949e]">Loading your algorithmic intelligence data...</p>
      </div>
    );
  }

  const safeAnalytics: AnalyticsSummary = analytics || {
    totalSubmissions: 0,
    averageScore: 0,
    averageOptimality: 0,
    averageTimeScore: 0,
    averageSpaceScore: 0,
    difficultyCounts: { Easy: 0, Medium: 0, Hard: 0 },
    recentTrend: [],
    heatmap: [],
    streaks: { currentStreak: 0, longestStreak: 0, totalActiveDays: 0 },
    platformCounts: { leetcode: 0, geeksforgeeks: 0, hackerrank: 0, other: 0 },
    topParadigms: []
  };

  const chartData = (safeAnalytics.recentTrend || []).map((item) => ({
    date: item.date,
    score: item.score,
    problem: item.problem
  }));

  const recentSubmissions = submissions.slice(0, 6);
  const totalPlatforms =
    safeAnalytics.platformCounts.leetcode +
    safeAnalytics.platformCounts.geeksforgeeks +
    safeAnalytics.platformCounts.hackerrank +
    safeAnalytics.platformCounts.other || 1;

  const displayName = profile?.display_name || user?.email?.split('@')[0] || 'Developer';

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Top Banner with Realtime Sync Status & Greeting */}
      <div className="relative overflow-hidden rounded-2xl bg-[#161b22] border border-[#30363d] p-6 sm:p-8 google-gradient-radial">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#21262d] border border-[#30363d] text-[#4285F4] text-xs font-medium">
                <Sparkles className="w-3.5 h-3.5 text-[#FBBC05] fill-[#FBBC05]" />
                <span>Skill Intelligence Dashboard</span>
              </span>

              {/* Realtime Live Pulse Badge */}
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#34A853]/15 border border-[#34A853]/30 text-[#34A853] text-xs font-medium">
                <span className="flex h-2 w-2 rounded-full bg-[#34A853] animate-pulse" />
                <span>Live Polling Active</span>
              </div>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#f0f6fc] tracking-tight">
              Welcome back, {displayName}
            </h1>
            <p className="text-xs sm:text-sm text-[#8b949e] leading-relaxed">
              Tracking your algorithmic approach, Big-O benchmarks, and problem solving consistency across LeetCode, GeeksforGeeks, and HackerRank.
            </p>
          </div>

          {/* Action / Sync controls */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => fetchData(true)}
              disabled={isRefreshing}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#21262d] hover:bg-[#30363d] text-[#c9d1d9] hover:text-[#f0f6fc] border border-[#30363d] text-xs font-medium transition cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-[#4285F4]' : ''}`} />
              <span>Refresh Now</span>
            </button>

            <Link
              href="/profile"
              className="px-4 py-2 rounded-xl bg-[#4285F4] hover:bg-[#3367D6] text-white text-xs font-semibold shadow-md shadow-[#4285F4]/20 transition flex items-center gap-1.5"
            >
              <span>View Profile</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>

      {/* KPI Stats Grid (4 Google Colors) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Evaluated (Google Blue) */}
        <div className="p-5 rounded-2xl bg-[#161b22] border border-[#30363d] shadow-sm hover:border-[#4285F4]/60 transition group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#8b949e] uppercase tracking-wider">
              Total Evaluated
            </span>
            <div className="p-2 rounded-xl bg-[#4285F4]/15 text-[#4285F4] border border-[#4285F4]/30">
              <Code2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-bold text-[#f0f6fc]">
              {safeAnalytics.totalSubmissions}
            </span>
            <span className="text-xs text-[#8b949e]">problems</span>
          </div>
          <p className="mt-1 text-[11px] text-[#34A853] flex items-center gap-1 font-medium">
            <TrendingUp className="w-3 h-3" />
            <span>Synced in real-time</span>
          </p>
        </div>

        {/* Card 2: Average Score (Google Green) */}
        <div className="p-5 rounded-2xl bg-[#161b22] border border-[#30363d] shadow-sm hover:border-[#34A853]/60 transition group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#8b949e] uppercase tracking-wider">
              Average Score
            </span>
            <div className="p-2 rounded-xl bg-[#34A853]/15 text-[#34A853] border border-[#34A853]/30">
              <Award className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-bold text-[#f0f6fc]">
              {safeAnalytics.averageScore}
            </span>
            <span className="text-xs text-[#8b949e]">/ 100</span>
          </div>
          <div className="mt-2 w-full bg-[#21262d] h-1.5 rounded-full overflow-hidden">
            <div
              className="bg-[#34A853] h-full rounded-full transition-all duration-500"
              style={{ width: `${safeAnalytics.averageScore}%` }}
            />
          </div>
        </div>

        {/* Card 3: Algorithmic Approach Benchmark (Google Yellow) */}
        <div className="p-5 rounded-2xl bg-[#161b22] border border-[#30363d] shadow-sm hover:border-[#FBBC05]/60 transition group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#8b949e] uppercase tracking-wider">
              Approach Benchmark
            </span>
            <div className="p-2 rounded-xl bg-[#FBBC05]/15 text-[#FBBC05] border border-[#FBBC05]/30">
              <Cpu className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-bold text-[#f0f6fc]">
              {safeAnalytics.averageOptimality + safeAnalytics.averageTimeScore}
            </span>
            <span className="text-xs text-[#8b949e]">/ 60 pts</span>
          </div>
          <div className="mt-2 text-[11px] text-[#8b949e] flex justify-between">
            <span>Optimality: {safeAnalytics.averageOptimality}/35</span>
            <span>Time: {safeAnalytics.averageTimeScore}/25</span>
          </div>
        </div>

        {/* Card 4: Space Efficiency (Google Red) */}
        <div className="p-5 rounded-2xl bg-[#161b22] border border-[#30363d] shadow-sm hover:border-[#EA4335]/60 transition group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#8b949e] uppercase tracking-wider">
              Space Efficiency
            </span>
            <div className="p-2 rounded-xl bg-[#EA4335]/15 text-[#EA4335] border border-[#EA4335]/30">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-bold text-[#f0f6fc]">
              {safeAnalytics.averageSpaceScore}
            </span>
            <span className="text-xs text-[#8b949e]">/ 20 pts</span>
          </div>
          <div className="mt-2 text-[11px] text-[#8b949e] flex justify-between">
            <span>Auxiliary Space Score</span>
            <span>Target: O(1) or O(N)</span>
          </div>
        </div>
      </div>

      {/* SUBMISSION ACTIVITY HEATMAP COMPONENT */}
      <SubmissionHeatmap
        heatmap={safeAnalytics.heatmap}
        streaks={safeAnalytics.streaks}
      />

      {/* CHARTS & PLATFORM DISTRIBUTION ROW */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Score Progression Trend Chart */}
        <div className="lg:col-span-2 p-6 rounded-2xl bg-[#161b22] border border-[#30363d] space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-[#f0f6fc]">Score Progression Trend</h2>
              <p className="text-xs text-[#8b949e]">Overall score evolution across recent evaluations</p>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-[#4285F4]">
              <span className="w-2.5 h-2.5 rounded-full bg-[#4285F4]" />
              <span>Gemini Score</span>
            </div>
          </div>

          <ScoreTrendChart data={chartData} />
        </div>

        {/* Platform Breakdown & Paradigms */}
        <div className="space-y-6">
          {/* Multi-Platform Distribution */}
          <div className="p-6 rounded-2xl bg-[#161b22] border border-[#30363d] space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-[#f0f6fc]">Platform Activity</h2>
              <span className="text-xs text-[#8b949e]">Multi-Platform</span>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <div className="flex justify-between text-[#8b949e] mb-1">
                  <span className="text-[#f0f6fc] font-medium">LeetCode</span>
                  <span>{safeAnalytics.platformCounts.leetcode} ({Math.round((safeAnalytics.platformCounts.leetcode / totalPlatforms) * 100)}%)</span>
                </div>
                <div className="h-1.5 w-full bg-[#21262d] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#FBBC05] rounded-full"
                    style={{ width: `${(safeAnalytics.platformCounts.leetcode / totalPlatforms) * 100}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-[#8b949e] mb-1">
                  <span className="text-[#f0f6fc] font-medium">GeeksforGeeks</span>
                  <span>{safeAnalytics.platformCounts.geeksforgeeks} ({Math.round((safeAnalytics.platformCounts.geeksforgeeks / totalPlatforms) * 100)}%)</span>
                </div>
                <div className="h-1.5 w-full bg-[#21262d] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#34A853] rounded-full"
                    style={{ width: `${(safeAnalytics.platformCounts.geeksforgeeks / totalPlatforms) * 100}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-[#8b949e] mb-1">
                  <span className="text-[#f0f6fc] font-medium">HackerRank</span>
                  <span>{safeAnalytics.platformCounts.hackerrank} ({Math.round((safeAnalytics.platformCounts.hackerrank / totalPlatforms) * 100)}%)</span>
                </div>
                <div className="h-1.5 w-full bg-[#21262d] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#4285F4] rounded-full"
                    style={{ width: `${(safeAnalytics.platformCounts.hackerrank / totalPlatforms) * 100}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Mastered Paradigms */}
          <div className="p-6 rounded-2xl bg-[#161b22] border border-[#30363d] space-y-3">
            <h2 className="text-sm font-bold text-[#f0f6fc]">Top Mastered Paradigms</h2>
            {safeAnalytics.topParadigms && safeAnalytics.topParadigms.length > 0 ? (
              <div className="space-y-2">
                {safeAnalytics.topParadigms.map((p, idx) => (
                  <div key={idx} className="flex items-center justify-between text-xs py-1 border-b border-[#30363d]/40 last:border-0">
                    <span className="text-[#c9d1d9]">{p.name}</span>
                    <span className="px-2 py-0.5 rounded bg-[#21262d] text-[#4285F4] font-mono text-[11px]">
                      {p.count} solved
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-[#8b949e]">
                Evaluate more problems on LeetCode/GFG to uncover your dominant algorithmic patterns.
              </p>
            )}
          </div>
        </div>
      </div>

      {/* RECENT SUBMISSIONS SECTION */}
      <div className="p-6 rounded-2xl bg-[#161b22] border border-[#30363d] space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-[#f0f6fc]">Recent Evaluated Submissions</h2>
            <p className="text-xs text-[#8b949e]">Latest code solutions reviewed by Gemini</p>
          </div>
          <Link
            href="/submissions"
            className="text-xs font-semibold text-[#4285F4] hover:underline flex items-center gap-1"
          >
            <span>View All ({submissions.length})</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {recentSubmissions.length === 0 ? (
          <div className="py-12 text-center text-xs text-[#8b949e] border border-dashed border-[#30363d] rounded-xl space-y-2">
            <Code2 className="w-6 h-6 text-[#8b949e] mx-auto" />
            <p>No submissions recorded yet.</p>
            <p className="text-[11px]">Open LeetCode, GeeksforGeeks, or HackerRank and click &quot;Analyze Code&quot;!</p>
          </div>
        ) : (
          <div className="divide-y divide-[#30363d]/60">
            {recentSubmissions.map((sub) => {
              const diffColor =
                sub.difficulty === 'Easy'
                  ? 'text-[#34A853] bg-[#34A853]/15 border-[#34A853]/30'
                  : sub.difficulty === 'Hard'
                  ? 'text-[#EA4335] bg-[#EA4335]/15 border-[#EA4335]/30'
                  : 'text-[#FBBC05] bg-[#FBBC05]/15 border-[#FBBC05]/30';

              const platformLabel =
                sub.platform === 'geeksforgeeks'
                  ? 'GFG'
                  : sub.platform === 'hackerrank'
                  ? 'HackerRank'
                  : 'LeetCode';

              return (
                <div
                  key={sub.id}
                  className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-[#21262d]/40 px-2 rounded-xl transition"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Link
                        href={`/submissions/${sub.id}`}
                        className="text-xs sm:text-sm font-semibold text-[#f0f6fc] hover:text-[#4285F4] transition"
                      >
                        {sub.problem_title}
                      </Link>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium border ${diffColor}`}>
                        {sub.difficulty}
                      </span>
                      <span className="px-1.5 py-0.5 rounded bg-[#21262d] text-[#8b949e] text-[10px] font-mono uppercase">
                        {platformLabel}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-[11px] text-[#8b949e]">
                      <span>Approach: <strong className="text-[#c9d1d9] font-normal">{sub.user_time_complexity}</strong></span>
                      <span>&bull;</span>
                      <span>{new Date(sub.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <span
                        className={`text-sm font-bold ${
                          sub.overall_score >= 80
                            ? 'text-[#34A853]'
                            : sub.overall_score >= 50
                            ? 'text-[#FBBC05]'
                            : 'text-[#EA4335]'
                        }`}
                      >
                        {sub.overall_score}
                      </span>
                      <span className="text-[10px] text-[#8b949e]">/100</span>
                    </div>

                    <Link
                      href={`/submissions/${sub.id}`}
                      className="p-1.5 rounded-lg bg-[#21262d] text-[#c9d1d9] hover:text-[#f0f6fc] hover:bg-[#30363d] transition"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
