'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  User as UserIcon,
  Key,
  Copy,
  Check,
  Shield,
  Award,
  Activity,
  Code2,
  Calendar,
  LogOut,
  Sparkles,
  ExternalLink,
  Flame,
  CheckCircle2,
  ArrowRight
} from 'lucide-react';
import { useAuth } from '@/components/AuthProvider';
import { AnalyticsSummary } from '@/lib/types';

export default function ProfilePage() {
  const { user, profile, loading, signOut } = useAuth();
  const [copied, setCopied] = useState(false);
  const [analytics, setAnalytics] = useState<AnalyticsSummary | null>(null);

  useEffect(() => {
    if (user?.id) {
      fetch(`/api/analytics?userId=${encodeURIComponent(user.id)}`)
        .then((res) => res.json())
        .then((data) => setAnalytics(data))
        .catch((err) => console.warn('Could not load profile analytics:', err));
    }
  }, [user?.id]);

  const token = profile?.extension_token || 'ap_sec_default';

  const copyToken = () => {
    navigator.clipboard.writeText(token);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return (
      <div className="py-24 text-center text-xs text-[#8b949e]">
        Loading your user profile...
      </div>
    );
  }

  if (!user) {
    return (
      <div className="max-w-md mx-auto my-16 p-8 rounded-2xl bg-[#161b22] border border-[#30363d] text-center space-y-4 shadow-xl">
        <div className="w-12 h-12 rounded-full bg-[#4285F4]/15 border border-[#4285F4]/30 text-[#4285F4] flex items-center justify-center mx-auto">
          <UserIcon className="w-6 h-6" />
        </div>
        <h1 className="text-xl font-bold text-[#f0f6fc]">Sign In to View Profile</h1>
        <p className="text-xs text-[#8b949e] leading-relaxed">
          Sign in or create an account to view your personal extension token, track your algorithmic submissions, and manage your profile.
        </p>
        <div className="flex gap-3 justify-center pt-2">
          <Link
            href="/login"
            className="px-4 py-2 rounded-xl bg-[#4285F4] hover:bg-[#3367D6] text-white text-xs font-semibold shadow-md transition"
          >
            Sign In
          </Link>
          <Link
            href="/signup"
            className="px-4 py-2 rounded-xl bg-[#21262d] hover:bg-[#30363d] text-[#f0f6fc] border border-[#30363d] text-xs font-semibold transition"
          >
            Create Account
          </Link>
        </div>
      </div>
    );
  }

  const displayName = profile?.display_name || user.email?.split('@')[0] || 'AlgoPulse Explorer';
  const joinedDate = user.created_at ? new Date(user.created_at).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' }) : 'Recently';

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in duration-300">
      {/* Profile Header Card with Google Ring Avatar */}
      <div className="p-6 sm:p-8 rounded-2xl bg-[#161b22] border border-[#30363d] relative overflow-hidden google-gradient-radial">
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            {/* Avatar with Google 4-color Ring */}
            <div className="p-[3px] rounded-full google-gradient-bar shadow-lg">
              <div className="w-16 h-16 rounded-full bg-[#0d1117] flex items-center justify-center text-[#f0f6fc] font-bold text-2xl border-2 border-[#161b22]">
                {displayName.charAt(0).toUpperCase()}
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-black text-[#f0f6fc] tracking-tight">
                  {displayName}
                </h1>
                <span className="px-2 py-0.5 rounded-full bg-[#34A853]/15 text-[#34A853] border border-[#34A853]/30 text-[10px] font-semibold">
                  Active Member
                </span>
              </div>
              <p className="text-xs text-[#8b949e] font-mono">{user.email}</p>
              <div className="flex items-center gap-2 text-[11px] text-[#6e7681]">
                <Calendar className="w-3.5 h-3.5 text-[#8b949e]" />
                <span>Joined {joinedDate}</span>
                <span>&bull;</span>
                <span className="truncate max-w-[150px]">UID: {user.id.slice(0, 8)}...</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/dashboard"
              className="px-4 py-2 rounded-xl bg-[#4285F4] hover:bg-[#3367D6] text-white text-xs font-semibold shadow-md shadow-[#4285F4]/20 transition flex items-center gap-1.5 cursor-pointer"
            >
              <Activity className="w-3.5 h-3.5" />
              <span>Dashboard</span>
            </Link>
            <button
              onClick={signOut}
              className="px-3.5 py-2 rounded-xl bg-[#21262d] hover:bg-[#EA4335]/20 text-[#8b949e] hover:text-[#EA4335] border border-[#30363d] text-xs font-medium transition flex items-center gap-1.5 cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </div>

      {/* Extension Token Card (Critical for Extension Syncing) */}
      <div className="p-6 rounded-2xl bg-[#161b22] border border-[#30363d] space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-[#FBBC05]/15 text-[#FBBC05] border border-[#FBBC05]/30">
              <Key className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-[#f0f6fc]">Personal Extension Sync Token</h2>
              <p className="text-xs text-[#8b949e]">
                Authenticates your Chrome Extension to link evaluations directly to your account
              </p>
            </div>
          </div>
          <span className="px-2.5 py-1 rounded-full bg-[#4285F4]/15 text-[#4285F4] border border-[#4285F4]/30 text-xs font-mono font-medium">
            Secret Key
          </span>
        </div>

        {/* Token Box with Copy */}
        <div className="p-4 rounded-xl bg-[#0d1117] border border-[#30363d] flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="font-mono text-xs text-[#f0f6fc] tracking-wider select-all break-all">
            {token}
          </div>
          <button
            onClick={copyToken}
            className="w-full sm:w-auto px-4 py-2 rounded-lg bg-[#21262d] hover:bg-[#30363d] text-[#f0f6fc] border border-[#30363d] text-xs font-semibold flex items-center justify-center gap-2 transition cursor-pointer"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-[#34A853]" />
                <span className="text-[#34A853]">Copied to Clipboard!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-[#8b949e]" />
                <span>Copy Token</span>
              </>
            )}
          </button>
        </div>

        {/* 3 Step Setup Guide */}
        <div className="p-4 rounded-xl bg-[#21262d]/40 border border-[#30363d]/60 text-xs space-y-2">
          <span className="font-bold text-[#c9d1d9] flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-[#FBBC05]" />
            How to use this token:
          </span>
          <ol className="list-decimal list-inside space-y-1 text-[#8b949e] pl-1">
            <li>Click the <strong className="text-[#c9d1d9]">AlgoPulse icon</strong> in your Chrome toolbar.</li>
            <li>Paste this token into the <strong className="text-[#c9d1d9]">Extension Token</strong> input field.</li>
            <li>Click <strong className="text-[#c9d1d9]">Save Settings</strong>. All future code evaluations on LeetCode/GFG/HackerRank will sync live to this profile!</li>
          </ol>
        </div>
      </div>

      {/* User Skill Intelligence Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-[#161b22] border border-[#30363d] space-y-2">
          <div className="flex items-center justify-between text-xs text-[#8b949e]">
            <span>Total Evaluated</span>
            <Code2 className="w-4 h-4 text-[#4285F4]" />
          </div>
          <div className="text-2xl font-bold text-[#f0f6fc]">
            {analytics?.totalSubmissions || 0}
          </div>
          <p className="text-[11px] text-[#8b949e]">Synchronized coding submissions</p>
        </div>

        <div className="p-5 rounded-2xl bg-[#161b22] border border-[#30363d] space-y-2">
          <div className="flex items-center justify-between text-xs text-[#8b949e]">
            <span>Average Score</span>
            <Award className="w-4 h-4 text-[#34A853]" />
          </div>
          <div className="text-2xl font-bold text-[#f0f6fc]">
            {analytics?.averageScore || 0} <span className="text-xs text-[#8b949e] font-normal">/ 100</span>
          </div>
          <p className="text-[11px] text-[#8b949e]">Across all platforms</p>
        </div>

        <div className="p-5 rounded-2xl bg-[#161b22] border border-[#30363d] space-y-2">
          <div className="flex items-center justify-between text-xs text-[#8b949e]">
            <span>Active Streak</span>
            <Flame className="w-4 h-4 text-[#EA4335]" />
          </div>
          <div className="text-2xl font-bold text-[#f0f6fc]">
            {analytics?.streaks?.currentStreak || 0} <span className="text-xs text-[#8b949e] font-normal">Days</span>
          </div>
          <p className="text-[11px] text-[#8b949e]">Longest: {analytics?.streaks?.longestStreak || 0} days</p>
        </div>
      </div>

      {/* Mastered Paradigms & Quick Actions */}
      <div className="p-6 rounded-2xl bg-[#161b22] border border-[#30363d] space-y-4">
        <h2 className="text-sm font-bold text-[#f0f6fc]">Mastered Algorithmic Paradigms</h2>
        {analytics?.topParadigms && analytics.topParadigms.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {analytics.topParadigms.map((p, idx) => (
              <div
                key={idx}
                className="px-3 py-1.5 rounded-xl bg-[#0d1117] border border-[#30363d] flex items-center gap-2 text-xs"
              >
                <CheckCircle2 className="w-3.5 h-3.5 text-[#34A853]" />
                <span className="text-[#f0f6fc] font-medium">{p.name}</span>
                <span className="px-1.5 py-0.2 rounded bg-[#21262d] text-[#4285F4] text-[10px] font-mono">
                  {p.count}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-[#8b949e]">
            Solve problems on LeetCode, GeeksforGeeks, or HackerRank using AlgoPulse to unlock your paradigm mastery profile.
          </p>
        )}
      </div>
    </div>
  );
}
