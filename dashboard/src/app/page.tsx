import React from 'react';
import Link from 'next/link';
import {
  Award,
  Zap,
  TrendingUp,
  Clock,
  Code2,
  ChevronRight,
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
      {/* Top Banner / Welcome with GitHub Canvas and Google Radial Glow */}
      <div className="relative overflow-hidden rounded-xl bg-[#161b22] border border-[#30363d] p-6 sm:p-8 google-gradient-radial">
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#21262d] border border-[#30363d] text-[#4285F4] text-xs font-medium mb-3">
            <Sparkles className="w-3.5 h-3.5 text-[#FBBC05] fill-[#FBBC05]" />
            <span>Automated Skill Progression Engine</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#f0f6fc] tracking-tight">
            Algorithmic Performance Overview
          </h1>
          <p className="mt-2 text-sm text-[#8b949e] leading-relaxed">
            Every LeetCode solution you evaluate with the AlgoPulse extension is logged here with Big-O benchmarks, 4-pillar scoring, and optimal solutions.
          </p>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Evaluated (Google Blue) */}
        <div className="p-5 rounded-xl bg-[#161b22] border border-[#30363d] shadow-sm hover:border-[#8b949e]/50 transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#8b949e] uppercase tracking-wider">
              Total Evaluated
            </span>
            <div className="p-2 rounded-lg bg-[#4285F4]/15 text-[#4285F4] border border-[#4285F4]/30">
              <Code2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-bold text-[#f0f6fc]">
              {analytics.totalSubmissions}
            </span>
            <span className="text-xs text-[#8b949e]">submissions</span>
          </div>
          <p className="mt-1 text-[11px] text-[#34A853] flex items-center gap-1 font-medium">
            <TrendingUp className="w-3 h-3" />
            <span>Synced in real-time</span>
          </p>
        </div>

        {/* Card 2: Average Score (Google Green) */}
        <div className="p-5 rounded-xl bg-[#161b22] border border-[#30363d] shadow-sm hover:border-[#8b949e]/50 transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#8b949e] uppercase tracking-wider">
              Average Score
            </span>
            <div className="p-2 rounded-lg bg-[#34A853]/15 text-[#34A853] border border-[#34A853]/30">
              <Award className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-bold text-[#f0f6fc]">
              {analytics.averageScore}
            </span>
            <span className="text-xs text-[#8b949e]">/ 100</span>
          </div>
          <div className="mt-2 w-full bg-[#21262d] h-1.5 rounded-full overflow-hidden">
            <div
              className="bg-[#34A853] h-full rounded-full transition-all"
              style={{ width: `${analytics.averageScore}%` }}
            />
          </div>
        </div>

        {/* Card 3: Algorithmic Approach (Google Yellow) */}
        <div className="p-5 rounded-xl bg-[#161b22] border border-[#30363d] shadow-sm hover:border-[#8b949e]/50 transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#8b949e] uppercase tracking-wider">
              Algorithmic Approach
            </span>
            <div className="p-2 rounded-lg bg-[#FBBC05]/15 text-[#FBBC05] border border-[#FBBC05]/30">
              <Zap className="w-4 h-4 fill-[#FBBC05]/30" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-bold text-[#f0f6fc]">
              {analytics.averageOptimality}
            </span>
            <span className="text-xs text-[#8b949e]">/ 35 pts</span>
          </div>
          <p className="mt-1 text-[11px] text-[#8b949e]">
            {Math.round((analytics.averageOptimality / 35) * 100)}% paradigm selection score
          </p>
        </div>

        {/* Card 4: Approach Optimality (Google Red) */}
        <div className="p-5 rounded-xl bg-[#161b22] border border-[#30363d] shadow-sm hover:border-[#8b949e]/50 transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#8b949e] uppercase tracking-wider">
              Approach Optimality
            </span>
            <div className="p-2 rounded-lg bg-[#EA4335]/15 text-[#EA4335] border border-[#EA4335]/30">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-bold text-[#f0f6fc]">
              {analytics.averageTimeScore}
            </span>
            <span className="text-xs text-[#8b949e]">/ 25 pts</span>
          </div>
          <p className="mt-1 text-[11px] text-[#8b949e]">
            {Math.round((analytics.averageTimeScore / 25) * 100)}% strategy efficiency
          </p>
        </div>
      </div>

      {/* Analytics Charts & Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Score Progression Area Chart */}
        <div className="lg:col-span-2 p-6 rounded-xl bg-[#161b22] border border-[#30363d] space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-[#f0f6fc]">Score Progression Over Time</h2>
              <p className="text-xs text-[#8b949e]">Track how your solution scores improve problem-by-problem</p>
            </div>
          </div>
          <ScoreTrendChart data={analytics.recentTrend} />
        </div>

        {/* Right: Difficulty Breakdown */}
        <div className="p-6 rounded-xl bg-[#161b22] border border-[#30363d] space-y-6">
          <div>
            <h2 className="text-base font-bold text-[#f0f6fc]">Difficulty Breakdown</h2>
            <p className="text-xs text-[#8b949e]">Distribution of evaluated problems</p>
          </div>

          <div className="space-y-4">
            {/* Easy (Google Green) */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-medium">
                <span className="text-[#34A853]">Easy ({analytics.difficultyCounts.Easy})</span>
                <span className="text-[#8b949e]">{easyPct}%</span>
              </div>
              <div className="w-full bg-[#21262d] h-2 rounded-full overflow-hidden">
                <div className="bg-[#34A853] h-full rounded-full transition-all" style={{ width: `${easyPct}%` }} />
              </div>
            </div>

            {/* Medium (Google Yellow) */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-medium">
                <span className="text-[#FBBC05]">Medium ({analytics.difficultyCounts.Medium})</span>
                <span className="text-[#8b949e]">{medPct}%</span>
              </div>
              <div className="w-full bg-[#21262d] h-2 rounded-full overflow-hidden">
                <div className="bg-[#FBBC05] h-full rounded-full transition-all" style={{ width: `${medPct}%` }} />
              </div>
            </div>

            {/* Hard (Google Red) */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-medium">
                <span className="text-[#EA4335]">Hard ({analytics.difficultyCounts.Hard})</span>
                <span className="text-[#8b949e]">{hardPct}%</span>
              </div>
              <div className="w-full bg-[#21262d] h-2 rounded-full overflow-hidden">
                <div className="bg-[#EA4335] h-full rounded-full transition-all" style={{ width: `${hardPct}%` }} />
              </div>
            </div>
          </div>

          <div className="p-4 rounded-lg bg-[#0d1117] border border-[#30363d] text-xs space-y-2">
            <span className="font-semibold text-[#f0f6fc] flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-[#4285F4]" />
              Automated Skill Feedback
            </span>
            <p className="text-[#8b949e] text-[11px] leading-relaxed">
              Based on your recent scores, your time complexity ratings are strong. Focus on memory allocation and edge cases to push scores above 95.
            </p>
          </div>
        </div>
      </div>

      {/* Recent Submissions Table */}
      <div className="p-6 rounded-xl bg-[#161b22] border border-[#30363d] space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-[#f0f6fc]">Recent Submissions</h2>
            <p className="text-xs text-[#8b949e]">Latest problems evaluated and synced from LeetCode</p>
          </div>
          <Link
            href="/submissions"
            className="text-xs font-semibold text-[#4285F4] hover:text-[#3367D6] flex items-center gap-1 transition"
          >
            <span>View All ({submissions.length})</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-[#30363d] text-[#8b949e]">
                <th className="pb-3 font-semibold">Problem</th>
                <th className="pb-3 font-semibold">Difficulty</th>
                <th className="pb-3 font-semibold">Your Approach</th>
                <th className="pb-3 font-semibold">Optimal Approach</th>
                <th className="pb-3 font-semibold">Score</th>
                <th className="pb-3 font-semibold">Date</th>
                <th className="pb-3 font-semibold text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#30363d]/60">
              {recentSubmissions.map((sub) => (
                <tr key={sub.id} className="hover:bg-[#21262d]/50 transition group">
                  <td className="py-3.5 font-medium text-[#f0f6fc]">
                    <Link
                      href={`/submissions/${sub.id}`}
                      className="hover:text-[#4285F4] transition"
                    >
                      {sub.problem_title}
                    </Link>
                  </td>
                  <td className="py-3.5">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                        sub.difficulty === 'Easy'
                          ? 'bg-[#34A853]/15 text-[#34A853] border border-[#34A853]/30'
                          : sub.difficulty === 'Medium'
                          ? 'bg-[#FBBC05]/15 text-[#FBBC05] border border-[#FBBC05]/30'
                          : 'bg-[#EA4335]/15 text-[#EA4335] border border-[#EA4335]/30'
                      }`}
                    >
                      {sub.difficulty}
                    </span>
                  </td>
                  <td className="py-3.5 font-mono text-[#c9d1d9]">
                    {sub.user_time_complexity}
                  </td>
                  <td className="py-3.5 font-mono text-[#4285F4]">
                    {sub.optimal_time_complexity}
                  </td>
                  <td className="py-3.5">
                    <span
                      className={`font-bold px-2 py-0.5 rounded text-[11px] ${
                        sub.overall_score >= 80
                          ? 'text-[#34A853] bg-[#34A853]/15 border border-[#34A853]/25'
                          : sub.overall_score >= 60
                          ? 'text-[#FBBC05] bg-[#FBBC05]/15 border border-[#FBBC05]/25'
                          : 'text-[#EA4335] bg-[#EA4335]/15 border border-[#EA4335]/25'
                      }`}
                    >
                      {sub.overall_score}/100
                    </span>
                  </td>
                  <td className="py-3.5 text-[#8b949e]">
                    {new Date(sub.created_at).toLocaleDateString()}
                  </td>
                  <td className="py-3.5 text-right">
                    <Link
                      href={`/submissions/${sub.id}`}
                      className="inline-flex items-center gap-1 text-[11px] font-medium text-[#4285F4] hover:text-[#3367D6]"
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
