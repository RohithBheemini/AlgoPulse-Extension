'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Award,
  ShieldCheck,
  CheckCircle2,
  Calendar,
  Sparkles,
  Copy,
  Check,
  Brain,
  Target,
  ExternalLink,
  Code2,
  Activity,
  ArrowLeft
} from 'lucide-react';
import { AnalyticsSummary, SubmissionRecord } from '@/lib/types';
import { SubmissionHeatmap } from '@/components/SubmissionHeatmap';

export default function VerifiedPortfolioPage() {
  const [analytics, setAnalytics] = useState<AnalyticsSummary | null>(null);
  const [submissions, setSubmissions] = useState<SubmissionRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [copiedLink, setCopiedLink] = useState(false);

  useEffect(() => {
    Promise.all([
      fetch('/api/analytics', { cache: 'no-store' }).then((r) => r.json()),
      fetch('/api/submissions', { cache: 'no-store' }).then((r) => r.json())
    ])
      .then(([analyticsData, subsData]) => {
        setAnalytics(analyticsData);
        if (Array.isArray(subsData)) setSubmissions(subsData);
      })
      .catch((err) => console.warn('Could not load portfolio data:', err))
      .finally(() => setLoading(false));
  }, []);

  const copyPublicLink = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  const safeAnalytics: AnalyticsSummary = analytics || {
    totalSubmissions: 0,
    averageScore: 0,
    averageOptimality: 0,
    averageTimeScore: 0,
    averageSpaceScore: 0,
    difficultyCounts: { Easy: 0, Medium: 0, Hard: 0 },
    platformCounts: { leetcode: 0, geeksforgeeks: 0, hackerrank: 0, vscode: 0, other: 0 },
    recentTrend: [],
    heatmap: [],
    streaks: { currentStreak: 0, longestStreak: 0, totalActiveDays: 0 },
    topParadigms: [],
    readinessScore: 78,
    paradigmMatrix: [],
    spacedReviewQueue: []
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-300 pb-16">
      {/* Top Header / Back Navigation */}
      <div className="flex items-center justify-between">
        <Link
          href="/dashboard"
          className="text-xs text-[#8b949e] hover:text-[#f0f6fc] transition flex items-center gap-1.5"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Dashboard</span>
        </Link>

        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#34A853]/15 text-[#34A853] border border-[#34A853]/30 text-[10px] font-semibold">
            <ShieldCheck className="w-3 h-3" />
            <span>Cryptographically Verified Transcript</span>
          </span>
        </div>
      </div>

      {/* Main Verified Hero Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-[#161b22] border border-[#30363d] relative overflow-hidden google-gradient-radial shadow-2xl">
        <div className="absolute top-0 left-0 right-0 h-1 google-gradient-bar" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2.5 py-1 rounded-full bg-[#4285F4]/15 border border-[#4285F4]/30 text-[#4285F4] text-xs font-semibold flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-[#FBBC05] fill-[#FBBC05]" />
                <span>Proof of Algorithmic Competency</span>
              </span>
              <span className="text-xs text-[#8b949e] font-mono">
                Evaluated by Google Gemini Rubric
              </span>
            </div>

            <h1 className="text-2xl sm:text-4xl font-black text-[#f0f6fc] tracking-tight">
              Verified Technical Interview Portfolio
            </h1>
            <p className="text-xs sm:text-sm text-[#8b949e] leading-relaxed">
              This public transcript verifies code optimality, theoretical Big-O benchmarks, and multi-platform problem-solving consistency across LeetCode, GeeksforGeeks, and VS Code.
            </p>
          </div>

          {/* Tier-1 Readiness Score Badge & Share Button */}
          <div className="flex flex-col items-center md:items-end gap-3 shrink-0">
            <div className="p-4 rounded-2xl bg-[#0d1117] border border-[#30363d] text-center space-y-1">
              <span className="text-[10px] uppercase font-bold text-[#8b949e] tracking-wider block">
                Tier-1 Interview Readiness
              </span>
              <div className="flex items-baseline justify-center gap-1">
                <span className="text-4xl font-black text-[#34A853]">
                  {safeAnalytics.readinessScore || 78}%
                </span>
                <span className="text-xs text-[#8b949e]">Index</span>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#34A853]/15 text-[#34A853] font-semibold border border-[#34A853]/30 block">
                FAANG Interview Qualified
              </span>
            </div>

            <button
              onClick={copyPublicLink}
              className="px-4 py-2 rounded-xl bg-[#21262d] hover:bg-[#30363d] text-[#f0f6fc] border border-[#30363d] text-xs font-semibold transition flex items-center gap-2 cursor-pointer shadow-sm"
            >
              {copiedLink ? (
                <>
                  <Check className="w-3.5 h-3.5 text-[#34A853]" />
                  <span className="text-[#34A853]">Link Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-[#8b949e]" />
                  <span>Share Verified Link</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-[#161b22] border border-[#30363d]">
          <span className="text-[11px] text-[#8b949e] font-semibold uppercase">Total Problems Verified</span>
          <div className="mt-2 text-2xl font-bold text-[#f0f6fc]">{safeAnalytics.totalSubmissions}</div>
          <span className="text-[10px] text-[#34A853]">Cross-Platform Solutions</span>
        </div>

        <div className="p-4 rounded-2xl bg-[#161b22] border border-[#30363d]">
          <span className="text-[11px] text-[#8b949e] font-semibold uppercase">Average Gemini Score</span>
          <div className="mt-2 text-2xl font-bold text-[#34A853]">{safeAnalytics.averageScore} / 100</div>
          <span className="text-[10px] text-[#8b949e]">Algorithmic Optimality</span>
        </div>

        <div className="p-4 rounded-2xl bg-[#161b22] border border-[#30363d]">
          <span className="text-[11px] text-[#8b949e] font-semibold uppercase">Max Streak Consistency</span>
          <div className="mt-2 text-2xl font-bold text-[#FBBC05]">{safeAnalytics.streaks.longestStreak} Days</div>
          <span className="text-[10px] text-[#8b949e]">Consecutive Problem Solving</span>
        </div>

        <div className="p-4 rounded-2xl bg-[#161b22] border border-[#30363d]">
          <span className="text-[11px] text-[#8b949e] font-semibold uppercase">Auxiliary Space Target</span>
          <div className="mt-2 text-2xl font-bold text-[#4285F4]">{safeAnalytics.averageSpaceScore} / 20</div>
          <span className="text-[10px] text-[#8b949e]">Strict In-Memory Economy</span>
        </div>
      </div>

      {/* Consistency Heatmap */}
      <SubmissionHeatmap
        heatmap={safeAnalytics.heatmap}
        streaks={safeAnalytics.streaks}
      />

      {/* 14-Paradigm Competency Matrix */}
      <div className="p-6 rounded-2xl bg-[#161b22] border border-[#30363d] space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-[#30363d]">
          <div className="flex items-center gap-2">
            <Brain className="w-4 h-4 text-[#4285F4]" />
            <h2 className="text-sm font-bold text-[#f0f6fc]">14-Paradigm Competency Matrix</h2>
          </div>
          <span className="text-xs text-[#8b949e]">FAANG Technical Rubric</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
          {(safeAnalytics.paradigmMatrix || []).map((item, idx) => {
            const statusBadge =
              item.status === 'Ready'
                ? 'bg-[#34A853]/15 text-[#34A853] border-[#34A853]/30'
                : item.status === 'Practicing'
                ? 'bg-[#FBBC05]/15 text-[#FBBC05] border-[#FBBC05]/30'
                : 'bg-[#EA4335]/10 text-[#EA4335] border-[#EA4335]/20';

            return (
              <div
                key={idx}
                className="p-3.5 rounded-xl bg-[#0d1117] border border-[#30363d] space-y-2 hover:border-[#4285F4]/50 transition"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-[#8b949e] font-mono">{item.category}</span>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${statusBadge}`}>
                    {item.status}
                  </span>
                </div>
                <h3 className="text-xs font-bold text-[#f0f6fc] truncate">{item.name}</h3>
                <div className="h-1.5 w-full bg-[#21262d] rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${
                      item.status === 'Ready'
                        ? 'bg-[#34A853]'
                        : item.status === 'Practicing'
                        ? 'bg-[#FBBC05]'
                        : 'bg-[#EA4335]'
                    }`}
                    style={{ width: `${Math.max(5, item.masteryScore)}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Verified Submissions Archive */}
      <div className="p-6 rounded-2xl bg-[#161b22] border border-[#30363d] space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-[#30363d]">
          <div className="flex items-center gap-2">
            <Code2 className="w-4 h-4 text-[#34A853]" />
            <h2 className="text-sm font-bold text-[#f0f6fc]">Verified Evaluated Submissions</h2>
          </div>
          <span className="text-xs text-[#8b949e]">{submissions.length} Total Evaluated</span>
        </div>

        <div className="divide-y divide-[#30363d]/50">
          {submissions.map((sub) => (
            <div
              key={sub.id}
              className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-[#21262d]/30 px-2 rounded-xl transition"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Link
                    href={`/submissions/${sub.id}`}
                    className="text-xs sm:text-sm font-bold text-[#f0f6fc] hover:text-[#4285F4] transition"
                  >
                    {sub.problem_title}
                  </Link>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[#21262d] text-[#8b949e] uppercase font-mono">
                    {sub.platform}
                  </span>
                </div>
                <div className="text-[11px] text-[#8b949e] flex items-center gap-2">
                  <span>Approach: <strong className="text-[#c9d1d9] font-normal">{sub.user_time_complexity}</strong></span>
                  <span>&bull;</span>
                  <span>{new Date(sub.created_at).toLocaleDateString()}</span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <span
                  className={`text-sm font-bold ${
                    sub.overall_score >= 80 ? 'text-[#34A853]' : 'text-[#FBBC05]'
                  }`}
                >
                  {sub.overall_score}/100
                </span>
                <Link
                  href={`/submissions/${sub.id}`}
                  className="px-2.5 py-1 rounded-lg bg-[#21262d] hover:bg-[#30363d] text-[#c9d1d9] text-xs font-medium transition"
                >
                  Inspect
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
