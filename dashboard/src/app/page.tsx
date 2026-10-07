import React from 'react';
import Link from 'next/link';
import {
  Award,
  Zap,
  TrendingUp,
  Clock,
  HardDrive,
  Code2,
  ChevronRight,
  ExternalLink,
  ShieldCheck,
  Sparkles
} from 'lucide-react';
import { getAnalyticsSummary, getAllSubmissions } from '@/lib/storage';
import { ScoreTrendChart } from '@/components/AnalyticsCharts';

// Revalidate page data
export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
  const analytics = await getAnalyticsSummary();
  const submissions = await getAllSubmissions();
  const recentSubmissions = submissions.slice(0, 5);

  const totalDiff = analytics.difficultyCounts.Easy + analytics.difficultyCounts.Medium + analytics.difficultyCounts.Hard || 1;
  const easyPct = Math.round((analytics.difficultyCounts.Easy / totalDiff) * 100);
  const medPct = Math.round((analytics.difficultyCounts.Medium / totalDiff) * 100);
  const hardPct = Math.round((analytics.difficultyCounts.Hard / totalDiff) * 100);

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Top Banner / Welcome */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-indigo-900/40 via-purple-900/30 to-slate-900 border border-indigo-500/20 p-6 sm:p-8">
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 text-xs font-medium mb-3">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>Automated Skill Progression Engine</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Algorithmic Performance Overview
          </h1>
          <p className="mt-2 text-sm text-slate-300 leading-relaxed">
            Every LeetCode solution you evaluate with the AlgoPulse extension is logged here with Big-O benchmarks, 4-pillar scoring, and optimal solutions.
          </p>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Evaluated */}
        <div className="p-5 rounded-xl bg-slate-900/80 border border-slate-800 shadow-sm hover:border-slate-700 transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Total Evaluated
            </span>
            <div className="p-2 rounded-lg bg-indigo-600/20 text-indigo-400">
              <Code2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-black text-white">
              {analytics.totalSubmissions}
            </span>
            <span className="text-xs text-slate-400">submissions</span>
          </div>
          <p className="mt-1 text-[11px] text-emerald-400 flex items-center gap-1">
            <TrendingUp className="w-3 h-3" />
            <span>Synced in real-time</span>
          </p>
        </div>

        {/* Card 2: Average Score */}
        <div className="p-5 rounded-xl bg-slate-900/80 border border-slate-800 shadow-sm hover:border-slate-700 transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Average Score
            </span>
            <div className="p-2 rounded-lg bg-amber-600/20 text-amber-400">
              <Award className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-black text-white">
              {analytics.averageScore}
            </span>
            <span className="text-xs text-slate-400">/ 100</span>
          </div>
          <div className="mt-2 w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
            <div
              className="bg-indigo-500 h-full rounded-full"
              style={{ width: `${analytics.averageScore}%` }}
            />
          </div>
        </div>

        {/* Card 3: Algorithmic Optimality */}
        <div className="p-5 rounded-xl bg-slate-900/80 border border-slate-800 shadow-sm hover:border-slate-700 transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Algorithmic Optimality
            </span>
            <div className="p-2 rounded-lg bg-emerald-600/20 text-emerald-400">
              <Zap className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-black text-white">
              {analytics.averageOptimality}
            </span>
            <span className="text-xs text-slate-400">/ 35 pts</span>
          </div>
          <p className="mt-1 text-[11px] text-slate-400">
            {Math.round((analytics.averageOptimality / 35) * 100)}% optimal paradigm choice
          </p>
        </div>

        {/* Card 4: Time Complexity Efficiency */}
        <div className="p-5 rounded-xl bg-slate-900/80 border border-slate-800 shadow-sm hover:border-slate-700 transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Time Efficiency
            </span>
            <div className="p-2 rounded-lg bg-purple-600/20 text-purple-400">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-black text-white">
              {analytics.averageTimeScore}
            </span>
            <span className="text-xs text-slate-400">/ 25 pts</span>
          </div>
          <p className="mt-1 text-[11px] text-slate-400">
            {Math.round((analytics.averageTimeScore / 25) * 100)}% Big-O time efficiency
          </p>
        </div>
      </div>

      {/* Analytics Charts & Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Score Progression Area Chart */}
        <div className="lg:col-span-2 p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-white">Score Progression Over Time</h2>
              <p className="text-xs text-slate-400">Track how your solution scores improve problem-by-problem</p>
            </div>
          </div>
          <ScoreTrendChart data={analytics.recentTrend} />
        </div>

        {/* Right: Difficulty Breakdown */}
        <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-6">
          <div>
            <h2 className="text-base font-bold text-white">Difficulty Breakdown</h2>
            <p className="text-xs text-slate-400">Distribution of evaluated problems</p>
          </div>

          <div className="space-y-4">
            {/* Easy */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-medium">
                <span className="text-emerald-400">Easy ({analytics.difficultyCounts.Easy})</span>
                <span className="text-slate-400">{easyPct}%</span>
              </div>
              <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${easyPct}%` }} />
              </div>
            </div>

            {/* Medium */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-medium">
                <span className="text-amber-400">Medium ({analytics.difficultyCounts.Medium})</span>
                <span className="text-slate-400">{medPct}%</span>
              </div>
              <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                <div className="bg-amber-500 h-full rounded-full" style={{ width: `${medPct}%` }} />
              </div>
            </div>

            {/* Hard */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-medium">
                <span className="text-rose-400">Hard ({analytics.difficultyCounts.Hard})</span>
                <span className="text-slate-400">{hardPct}%</span>
              </div>
              <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                <div className="bg-rose-500 h-full rounded-full" style={{ width: `${hardPct}%` }} />
              </div>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/80 text-xs space-y-2">
            <span className="font-semibold text-slate-300 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-indigo-400" />
              Automated Skill Feedback
            </span>
            <p className="text-slate-400 text-[11px] leading-relaxed">
              Based on your recent scores, your time complexity ratings are strong. Focus on memory allocation and edge cases to push scores above 95.
            </p>
          </div>
        </div>
      </div>

      {/* Recent Submissions Table */}
      <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-white">Recent Submissions</h2>
            <p className="text-xs text-slate-400">Latest problems evaluated and synced from LeetCode</p>
          </div>
          <Link
            href="/submissions"
            className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
          >
            <span>View All ({submissions.length})</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400">
                <th className="pb-3 font-semibold">Problem</th>
                <th className="pb-3 font-semibold">Difficulty</th>
                <th className="pb-3 font-semibold">Your Complexity</th>
                <th className="pb-3 font-semibold">Optimal Complexity</th>
                <th className="pb-3 font-semibold">Score</th>
                <th className="pb-3 font-semibold">Date</th>
                <th className="pb-3 font-semibold text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {recentSubmissions.map((sub) => (
                <tr key={sub.id} className="hover:bg-slate-800/30 transition group">
                  <td className="py-3.5 font-medium text-white">
                    <Link
                      href={`/submissions/${sub.id}`}
                      className="hover:text-indigo-400 transition"
                    >
                      {sub.problem_title}
                    </Link>
                  </td>
                  <td className="py-3.5">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                        sub.difficulty === 'Easy'
                          ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                          : sub.difficulty === 'Medium'
                          ? 'bg-amber-950 text-amber-300 border border-amber-800'
                          : 'bg-rose-950 text-rose-300 border border-rose-800'
                      }`}
                    >
                      {sub.difficulty}
                    </span>
                  </td>
                  <td className="py-3.5 font-mono text-slate-300">
                    {sub.user_time_complexity}
                  </td>
                  <td className="py-3.5 font-mono text-indigo-400">
                    {sub.optimal_time_complexity}
                  </td>
                  <td className="py-3.5">
                    <span
                      className={`font-bold px-2 py-0.5 rounded text-[11px] ${
                        sub.overall_score >= 80
                          ? 'text-emerald-400 bg-emerald-950/60'
                          : sub.overall_score >= 60
                          ? 'text-amber-400 bg-amber-950/60'
                          : 'text-rose-400 bg-rose-950/60'
                      }`}
                    >
                      {sub.overall_score}/100
                    </span>
                  </td>
                  <td className="py-3.5 text-slate-400">
                    {new Date(sub.created_at).toLocaleDateString()}
                  </td>
                  <td className="py-3.5 text-right">
                    <Link
                      href={`/submissions/${sub.id}`}
                      className="inline-flex items-center gap-1 text-[11px] font-medium text-indigo-400 hover:text-indigo-300"
                    >
                      <span>Review</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
