import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import {
  ArrowLeft,
  Calendar,
  CheckCircle,
  Code2,
  ExternalLink,
  Sparkles,
  Zap,
  Award,
  Clock,
  HardDrive,
  Copy
} from 'lucide-react';
import { getSubmissionById } from '@/lib/storage';

export const dynamic = 'force-dynamic';

export default async function SubmissionDetailPage({
  params
}: {
  params: { id: string };
}) {
  const submission = await getSubmissionById(params.id);

  if (!submission) {
    notFound();
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Breadcrumb Navigation */}
      <div className="flex items-center gap-2 text-xs text-slate-400">
        <Link
          href="/submissions"
          className="hover:text-white transition flex items-center gap-1"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Submissions</span>
        </Link>
        <span>/</span>
        <span className="text-slate-200">{submission.problem_title}</span>
      </div>

      {/* Header Banner */}
      <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-extrabold text-white">
              {submission.problem_title}
            </h1>
            <span
              className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                submission.difficulty === 'Easy'
                  ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                  : submission.difficulty === 'Medium'
                  ? 'bg-amber-950 text-amber-300 border border-amber-800'
                  : 'bg-rose-950 text-rose-300 border border-rose-800'
              }`}
            >
              {submission.difficulty}
            </span>
          </div>
          <div className="flex items-center gap-4 text-xs text-slate-400 mt-2">
            <span className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" />
              {new Date(submission.created_at).toLocaleString()}
            </span>
            <span>•</span>
            <span className="font-mono uppercase text-indigo-400">
              {submission.language}
            </span>
            <span>•</span>
            <span className="capitalize">{submission.platform}</span>
          </div>
        </div>

        {/* Overall Score Badge */}
        <div className="flex items-center gap-3 bg-slate-950 p-3.5 rounded-xl border border-slate-800 shrink-0">
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 block">
              Overall Score
            </span>
            <div className="flex items-baseline gap-1 mt-0.5">
              <span className="text-3xl font-black text-white">
                {submission.overall_score}
              </span>
              <span className="text-xs text-slate-400">/ 100</span>
            </div>
          </div>
          <div className="p-2.5 rounded-xl bg-indigo-600/20 text-indigo-400">
            <Award className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* 4-Pillar Score Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
          <span className="text-[11px] text-slate-400 font-semibold uppercase">
            Optimality
          </span>
          <div className="mt-1 text-xl font-bold text-white">
            {submission.optimality_score} <span className="text-xs text-slate-500 font-normal">/ 35</span>
          </div>
        </div>
        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
          <span className="text-[11px] text-slate-400 font-semibold uppercase">
            Time Complexity
          </span>
          <div className="mt-1 text-xl font-bold text-white">
            {submission.time_score} <span className="text-xs text-slate-500 font-normal">/ 25</span>
          </div>
        </div>
        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
          <span className="text-[11px] text-slate-400 font-semibold uppercase">
            Space Complexity
          </span>
          <div className="mt-1 text-xl font-bold text-white">
            {submission.space_score} <span className="text-xs text-slate-500 font-normal">/ 20</span>
          </div>
        </div>
        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
          <span className="text-[11px] text-slate-400 font-semibold uppercase">
            Code Cleanliness
          </span>
          <div className="mt-1 text-xl font-bold text-white">
            {submission.cleanliness_score} <span className="text-xs text-slate-500 font-normal">/ 20</span>
          </div>
        </div>
      </div>

      {/* Side-by-Side Code Comparison */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: User's Submitted Code */}
        <div className="rounded-2xl bg-slate-900/90 border border-slate-800 overflow-hidden flex flex-col">
          <div className="p-4 border-b border-slate-800 bg-slate-950/70 flex items-center justify-between">
            <div>
              <h2 className="text-xs font-bold text-white uppercase tracking-wider">
                Your Submitted Solution
              </h2>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-[11px] font-mono text-slate-300">
                  Time: {submission.user_time_complexity}
                </span>
                <span className="text-slate-600">•</span>
                <span className="text-[11px] font-mono text-slate-300">
                  Space: {submission.user_space_complexity}
                </span>
              </div>
            </div>
            <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-mono">
              {submission.language}
            </span>
          </div>
          <div className="p-4 flex-1 bg-slate-950 font-mono text-xs overflow-x-auto text-slate-200 leading-relaxed">
            <pre>
              <code>{submission.user_code}</code>
            </pre>
          </div>
        </div>

        {/* Right: Optimal Reference Code */}
        <div className="rounded-2xl bg-slate-900/90 border border-indigo-950/80 overflow-hidden flex flex-col">
          <div className="p-4 border-b border-indigo-950 bg-indigo-950/30 flex items-center justify-between">
            <div>
              <h2 className="text-xs font-bold text-indigo-300 uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                Optimal Solution Benchmark
              </h2>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-[11px] font-mono text-indigo-300">
                  Time: {submission.optimal_time_complexity}
                </span>
                <span className="text-slate-600">•</span>
                <span className="text-[11px] font-mono text-indigo-300">
                  Space: {submission.optimal_space_complexity}
                </span>
              </div>
            </div>
            <span className="text-[10px] px-2 py-0.5 rounded bg-indigo-900/50 text-indigo-300 font-mono">
              Optimal
            </span>
          </div>
          <div className="p-4 flex-1 bg-slate-950 font-mono text-xs overflow-x-auto text-emerald-300/90 leading-relaxed">
            <pre>
              <code>{submission.optimal_code || '// No optimal code recorded'}</code>
            </pre>
          </div>
        </div>
      </div>

      {/* AI Qualitative Feedback & Suggestions */}
      <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4">
        <div>
          <h2 className="text-sm font-bold text-white flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-indigo-400" />
            AI Algorithmic Critique & Recommendations
          </h2>
          <p className="text-xs text-slate-300 mt-2 leading-relaxed">
            {submission.summary_feedback}
          </p>
        </div>

        {submission.improvements && submission.improvements.length > 0 && (
          <div className="pt-3 border-t border-slate-800">
            <h3 className="text-xs font-semibold text-slate-300 mb-2">
              Specific Optimization Suggestions:
            </h3>
            <ul className="space-y-1.5">
              {submission.improvements.map((item, idx) => (
                <li
                  key={idx}
                  className="flex items-start gap-2 text-xs text-slate-400"
                >
                  <CheckCircle className="w-3.5 h-3.5 text-indigo-400 shrink-0 mt-0.5" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
