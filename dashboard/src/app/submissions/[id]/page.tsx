import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import {
  ArrowLeft,
  Calendar,
  CheckCircle,
  Sparkles,
  Award
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
      <div className="flex items-center gap-2 text-xs text-[#8b949e]">
        <Link
          href="/submissions"
          className="hover:text-[#f0f6fc] transition flex items-center gap-1"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Submissions</span>
        </Link>
        <span>/</span>
        <span className="text-[#c9d1d9]">{submission.problem_title}</span>
      </div>

      {/* Header Banner */}
      <div className="p-6 rounded-xl bg-[#161b22] border border-[#30363d] flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-extrabold text-[#f0f6fc]">
              {submission.problem_title}
            </h1>
            <span
              className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                submission.difficulty === 'Easy'
                  ? 'bg-[#34A853]/15 text-[#34A853] border border-[#34A853]/30'
                  : submission.difficulty === 'Medium'
                  ? 'bg-[#FBBC05]/15 text-[#FBBC05] border border-[#FBBC05]/30'
                  : 'bg-[#EA4335]/15 text-[#EA4335] border border-[#EA4335]/30'
              }`}
            >
              {submission.difficulty}
            </span>
          </div>
          <div className="flex items-center gap-4 text-xs text-[#8b949e] mt-2">
            <span className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" />
              {new Date(submission.created_at).toLocaleString()}
            </span>
            <span>•</span>
            <span className="font-mono uppercase text-[#4285F4] font-semibold">
              {submission.language}
            </span>
            <span>•</span>
            <span className="capitalize">{submission.platform}</span>
          </div>
        </div>

        {/* Overall Score Badge */}
        <div className="flex items-center gap-3 bg-[#0d1117] p-3.5 rounded-xl border border-[#30363d] shrink-0">
          <div>
            <span className="text-[10px] uppercase font-bold text-[#8b949e] block">
              Overall Score
            </span>
            <div className="flex items-baseline gap-1 mt-0.5">
              <span className="text-3xl font-black text-[#f0f6fc]">
                {submission.overall_score}
              </span>
              <span className="text-xs text-[#8b949e]">/ 100</span>
            </div>
          </div>
          <div className="p-2.5 rounded-lg bg-[#4285F4]/15 text-[#4285F4] border border-[#4285F4]/30">
            <Award className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* 4-Pillar Score Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="p-4 rounded-xl bg-[#161b22] border border-[#30363d]">
          <span className="text-[11px] text-[#8b949e] font-semibold uppercase">
            Algorithmic Approach
          </span>
          <div className="mt-1 text-xl font-bold text-[#f0f6fc]">
            {submission.optimality_score} <span className="text-xs text-[#6e7681] font-normal">/ 35</span>
          </div>
        </div>
        <div className="p-4 rounded-xl bg-[#161b22] border border-[#30363d]">
          <span className="text-[11px] text-[#8b949e] font-semibold uppercase">
            Approach Optimality
          </span>
          <div className="mt-1 text-xl font-bold text-[#f0f6fc]">
            {submission.time_score} <span className="text-xs text-[#6e7681] font-normal">/ 25</span>
          </div>
        </div>
        <div className="p-4 rounded-xl bg-[#161b22] border border-[#30363d]">
          <span className="text-[11px] text-[#8b949e] font-semibold uppercase">
            Space Complexity
          </span>
          <div className="mt-1 text-xl font-bold text-[#f0f6fc]">
            {submission.space_score} <span className="text-xs text-[#6e7681] font-normal">/ 20</span>
          </div>
        </div>
        <div className="p-4 rounded-xl bg-[#161b22] border border-[#30363d]">
          <span className="text-[11px] text-[#8b949e] font-semibold uppercase">
            Code Cleanliness
          </span>
          <div className="mt-1 text-xl font-bold text-[#f0f6fc]">
            {submission.cleanliness_score} <span className="text-xs text-[#6e7681] font-normal">/ 20</span>
          </div>
        </div>
      </div>

      {/* Side-by-Side Code Comparison */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: User's Submitted Code */}
        <div className="rounded-xl bg-[#161b22] border border-[#30363d] overflow-hidden flex flex-col">
          <div className="p-4 border-b border-[#30363d] bg-[#161b22] flex items-center justify-between">
            <div>
              <h2 className="text-xs font-bold text-[#f0f6fc] uppercase tracking-wider">
                Your Solution Approach
              </h2>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-[11px] font-mono text-[#8b949e]">
                  Approach: <span className="text-[#c9d1d9] font-medium">{submission.user_time_complexity}</span>
                </span>
                <span className="text-[#6e7681]">•</span>
                <span className="text-[11px] font-mono text-[#8b949e]">
                  Space: <span className="text-[#c9d1d9]">{submission.user_space_complexity}</span>
                </span>
              </div>
            </div>
            <span className="text-[10px] px-2 py-0.5 rounded bg-[#21262d] text-[#c9d1d9] font-mono border border-[#30363d]">
              {submission.language}
            </span>
          </div>
          <div className="p-4 flex-1 bg-[#0d1117] font-mono text-xs overflow-x-auto text-[#c9d1d9] leading-relaxed">
            <pre>
              <code>{submission.user_code}</code>
            </pre>
          </div>
        </div>

        {/* Right: Optimal Reference Code */}
        <div className="rounded-xl bg-[#161b22] border border-[#30363d] overflow-hidden flex flex-col">
          <div className="p-4 border-b border-[#30363d] bg-[#161b22] flex items-center justify-between">
            <div>
              <h2 className="text-xs font-bold text-[#4285F4] uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-[#FBBC05] fill-[#FBBC05]" />
                Optimal Benchmark Approach
              </h2>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-[11px] font-mono text-[#8b949e]">
                  Approach: <span className="text-[#4285F4] font-medium">{submission.optimal_time_complexity}</span>
                </span>
                <span className="text-[#6e7681]">•</span>
                <span className="text-[11px] font-mono text-[#8b949e]">
                  Space: <span className="text-[#4285F4] font-medium">{submission.optimal_space_complexity}</span>
                </span>
              </div>
            </div>
            <span className="text-[10px] px-2 py-0.5 rounded bg-[#34A853]/15 text-[#34A853] font-mono border border-[#34A853]/30">
              Optimal
            </span>
          </div>
          <div className="p-4 flex-1 bg-[#0d1117] font-mono text-xs overflow-x-auto text-[#34A853] leading-relaxed">
            <pre>
              <code>{submission.optimal_code || '// No optimal code recorded'}</code>
            </pre>
          </div>
        </div>
      </div>

      {/* AI Qualitative Feedback & Suggestions */}
      <div className="p-6 rounded-xl bg-[#161b22] border border-[#30363d] space-y-4">
        <div>
          <h2 className="text-sm font-bold text-[#f0f6fc] flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-[#4285F4]" />
            AI Algorithmic Critique & Approach Recommendations
          </h2>
          {submission.why_suboptimal && (
            <div className="mt-3 p-3 rounded-lg bg-[#0d1117] border border-[#30363d] text-xs space-y-1">
              <span className="text-[10px] font-semibold text-[#FBBC05] uppercase tracking-wider block">
                Approach Critique & Paradigm Shift
              </span>
              <p className="text-[#c9d1d9] leading-relaxed">
                {submission.why_suboptimal}
              </p>
            </div>
          )}
          <p className="text-xs text-[#c9d1d9] mt-3 leading-relaxed">
            {submission.summary_feedback}
          </p>
        </div>

        {submission.improvements && submission.improvements.length > 0 && (
          <div className="pt-3 border-t border-[#30363d]">
            <h3 className="text-xs font-semibold text-[#f0f6fc] mb-2">
              Specific Optimization Suggestions:
            </h3>
            <ul className="space-y-1.5">
              {submission.improvements.map((item, idx) => (
                <li
                  key={idx}
                  className="flex items-start gap-2 text-xs text-[#8b949e]"
                >
                  <CheckCircle className="w-3.5 h-3.5 text-[#34A853] shrink-0 mt-0.5" />
                  <span className="text-[#c9d1d9]">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
