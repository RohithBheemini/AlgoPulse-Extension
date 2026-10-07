'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Search,
  Filter,
  ChevronRight,
  Code2,
  Calendar,
  Zap,
  Award
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
        <h1 className="text-2xl font-extrabold text-white">Submissions Explorer</h1>
        <p className="text-xs text-slate-400 mt-1">
          Browse, filter, and inspect all problems evaluated and synced from the extension
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Search problems..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-950 border border-slate-700/80 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition"
          />
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          {/* Difficulty Filter */}
          <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800 text-xs">
            {['All', 'Easy', 'Medium', 'Hard'].map((diff) => (
              <button
                key={diff}
                onClick={() => setDifficultyFilter(diff)}
                className={`px-2.5 py-1 rounded-md font-medium transition ${
                  difficultyFilter === diff
                    ? 'bg-indigo-600 text-white'
                    : 'text-slate-400 hover:text-white'
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
            className="bg-slate-950 border border-slate-800 text-xs text-slate-300 rounded-lg px-3 py-2 focus:outline-none"
          >
            <option value="date">Latest First</option>
            <option value="score">Highest Score</option>
          </select>
        </div>
      </div>

      {/* Submissions List */}
      {loading ? (
        <div className="py-20 text-center text-slate-400 text-xs">
          Loading submissions...
        </div>
      ) : filtered.length === 0 ? (
        <div className="p-12 text-center rounded-2xl bg-slate-900/40 border border-dashed border-slate-800 text-slate-400 space-y-2">
          <Code2 className="w-8 h-8 mx-auto text-slate-600" />
          <p className="font-semibold text-white">No submissions match your filter</p>
          <p className="text-xs">Try adjusting your search query or submit code from LeetCode.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((sub) => (
            <Link
              key={sub.id}
              href={`/submissions/${sub.id}`}
              className="p-5 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-indigo-500/50 shadow-sm transition group flex flex-col justify-between space-y-4"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
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
                  <span
                    className={`font-bold px-2 py-0.5 rounded text-xs ${
                      sub.overall_score >= 80
                        ? 'text-emerald-400 bg-emerald-950/60'
                        : sub.overall_score >= 60
                        ? 'text-amber-400 bg-amber-950/60'
                        : 'text-rose-400 bg-rose-950/60'
                    }`}
                  >
                    {sub.overall_score}/100
                  </span>
                </div>

                <h3 className="font-bold text-sm text-white group-hover:text-indigo-400 transition">
                  {sub.problem_title}
                </h3>
                <p className="text-[11px] text-slate-400 font-mono mt-1">
                  Language: {sub.language}
                </p>
              </div>

              <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800/80 text-[11px] space-y-1">
                <div className="flex justify-between">
                  <span className="text-slate-500">Your Time:</span>
                  <span className="font-mono text-slate-300">{sub.user_time_complexity}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Optimal Time:</span>
                  <span className="font-mono text-indigo-400">{sub.optimal_time_complexity}</span>
                </div>
              </div>

              <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1 border-t border-slate-800/60">
                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" />
                  {new Date(sub.created_at).toLocaleDateString()}
                </span>
                <span className="text-indigo-400 font-medium flex items-center gap-0.5 group-hover:translate-x-1 transition">
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
