'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Search,
  ChevronRight,
  Code2,
  Calendar
} from 'lucide-react';
import { SubmissionRecord } from '@/lib/types';

export default function SubmissionsPage() {
  const [submissions, setSubmissions] = useState<SubmissionRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [difficultyFilter, setDifficultyFilter] = useState<string>('All');
  const [sortBy, setSortBy] = useState<'date' | 'score'>('date');

  useEffect(() => {
    fetch('/api/submissions')
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setSubmissions(data);
        }
      })
      .finally(() => setLoading(false));
  }, []);

  const filtered = submissions.filter((sub) => {
    const matchesSearch = sub.problem_title.toLowerCase().includes(search.toLowerCase());
    const matchesDiff = difficultyFilter === 'All' || sub.difficulty === difficultyFilter;
    return matchesSearch && matchesDiff;
  }).sort((a, b) => {
    if (sortBy === 'score') {
      return b.overall_score - a.overall_score;
    }
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div>
        <h1 className="text-2xl font-extrabold text-[#f0f6fc]">Submissions Explorer</h1>
        <p className="text-xs text-[#8b949e] mt-1">
          Browse, filter, and inspect all problems evaluated and synced from the extension
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-xl bg-[#161b22] border border-[#30363d] flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-[#8b949e] absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Search problems..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-[#0d1117] border border-[#30363d] rounded-lg text-xs text-[#f0f6fc] placeholder-[#8b949e] focus:outline-none focus:border-[#4285F4] transition"
          />
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          {/* Difficulty Filter */}
          <div className="flex items-center gap-1 bg-[#0d1117] p-1 rounded-lg border border-[#30363d] text-xs">
            {['All', 'Easy', 'Medium', 'Hard'].map((diff) => (
              <button
                key={diff}
                onClick={() => setDifficultyFilter(diff)}
                className={`px-2.5 py-1 rounded-md font-medium transition cursor-pointer ${
                  difficultyFilter === diff
                    ? 'bg-[#4285F4] text-white shadow-sm'
                    : 'text-[#8b949e] hover:text-[#f0f6fc]'
                }`}
              >
                {diff}
              </button>
            ))}
          </div>

          {/* Sort By */}
          <select
            value={sortBy}
            onChange={(e: any) => setSortBy(e.target.value)}
            className="bg-[#0d1117] border border-[#30363d] text-xs text-[#c9d1d9] rounded-lg px-3 py-2 focus:outline-none focus:border-[#4285F4] cursor-pointer"
          >
            <option value="date">Latest First</option>
            <option value="score">Highest Score</option>
          </select>
        </div>
      </div>

      {/* Submissions List */}
      {loading ? (
        <div className="py-20 text-center text-[#8b949e] text-xs">
          Loading submissions...
        </div>
      ) : filtered.length === 0 ? (
        <div className="p-12 text-center rounded-xl bg-[#161b22]/50 border border-dashed border-[#30363d] text-[#8b949e] space-y-2">
          <Code2 className="w-8 h-8 mx-auto text-[#6e7681]" />
          <p className="font-semibold text-[#f0f6fc]">No submissions match your filter</p>
          <p className="text-xs text-[#8b949e]">Try adjusting your search query or submit code from LeetCode.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((sub) => (
            <Link
              key={sub.id}
              href={`/submissions/${sub.id}`}
              className="p-5 rounded-xl bg-[#161b22] border border-[#30363d] hover:border-[#4285F4]/60 shadow-sm transition group flex flex-col justify-between space-y-4"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
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
                  <span
                    className={`font-bold px-2 py-0.5 rounded text-xs ${
                      sub.overall_score >= 80
                        ? 'text-[#34A853] bg-[#34A853]/15 border border-[#34A853]/25'
                        : sub.overall_score >= 60
                        ? 'text-[#FBBC05] bg-[#FBBC05]/15 border border-[#FBBC05]/25'
                        : 'text-[#EA4335] bg-[#EA4335]/15 border border-[#EA4335]/25'
                    }`}
                  >
                    {sub.overall_score}/100
                  </span>
                </div>

                <h3 className="font-bold text-sm text-[#f0f6fc] group-hover:text-[#4285F4] transition">
                  {sub.problem_title}
                </h3>
                <p className="text-[11px] text-[#8b949e] font-mono mt-1">
                  Language: {sub.language}
                </p>
              </div>

              <div className="p-3 rounded-lg bg-[#0d1117] border border-[#30363d] text-[11px] space-y-1">
                <div className="flex justify-between">
                  <span className="text-[#8b949e]">Your Time:</span>
                  <span className="font-mono text-[#c9d1d9]">{sub.user_time_complexity}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#8b949e]">Optimal Time:</span>
                  <span className="font-mono text-[#4285F4] font-medium">{sub.optimal_time_complexity}</span>
                </div>
              </div>

              <div className="flex items-center justify-between text-[11px] text-[#8b949e] pt-1 border-t border-[#30363d]/60">
                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" />
                  {new Date(sub.created_at).toLocaleDateString()}
                </span>
                <span className="text-[#4285F4] font-medium flex items-center gap-0.5 group-hover:translate-x-1 transition">
                  Deep Review <ChevronRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
