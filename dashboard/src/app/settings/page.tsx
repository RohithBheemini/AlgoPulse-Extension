'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Key,
  Copy,
  CheckCircle,
  RefreshCw,
  Database,
  ShieldCheck,
  ExternalLink,
  LogIn,
  User,
  Layers,
  Sparkles
} from 'lucide-react';
import { useAuth } from '@/components/AuthProvider';
import { createClient } from '@/lib/supabase/client';

export default function SettingsPage() {
  const { user, profile, refreshProfile } = useAuth();
  const [token, setToken] = useState('ap_sec_9a7b3e1f0c4d2e8');
  const [copiedToken, setCopiedToken] = useState(false);
  const [copiedSql, setCopiedSql] = useState(false);
  const [regenerating, setRegenerating] = useState(false);

  const supabase = createClient();

  useEffect(() => {
    if (profile?.extension_token) {
      setToken(profile.extension_token);
    } else {
      const saved = localStorage.getItem('algopulse_token');
      if (saved) {
        setToken(saved);
      }
    }
  }, [profile]);

  const handleGenerateNew = async () => {
    setRegenerating(true);
    const newToken = `ap_sec_${Math.random().toString(36).substring(2, 10)}${Math.random().toString(36).substring(2, 10)}`;

    if (user?.id) {
      try {
        await supabase
          .from('profiles')
          .update({ extension_token: newToken })
          .eq('id', user.id);
        await refreshProfile();
      } catch (err) {
        console.error('Failed to update token in Supabase:', err);
      }
    } else {
      localStorage.setItem('algopulse_token', newToken);
    }

    setToken(newToken);
    setRegenerating(false);
  };

  const handleCopyToken = () => {
    navigator.clipboard.writeText(token);
    setCopiedToken(true);
    setTimeout(() => setCopiedToken(false), 2000);
  };

  const sqlSchema = `-- ==============================================================================
-- AlgoPulse Complete Supabase Schema with Authentication & Auto-Token Trigger
-- ==============================================================================
create extension if not exists "uuid-ossp";
create extension if not exists "pgcrypto";

create table if not exists public.profiles (
  id uuid references auth.users on delete cascade primary key,
  email text not null,
  display_name text,
  extension_token text unique not null,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

create table if not exists public.submissions (
  id text primary key,
  user_id uuid references public.profiles(id) on delete cascade,
  problem_title text not null,
  problem_slug text not null,
  platform text default 'leetcode',
  difficulty text check (difficulty in ('Easy', 'Medium', 'Hard', 'Unknown')),
  language text not null,
  user_code text not null,
  overall_score integer not null,
  optimality_score integer,
  time_score integer,
  space_score integer,
  cleanliness_score integer,
  user_time_complexity text,
  user_space_complexity text,
  optimal_time_complexity text,
  optimal_space_complexity text,
  why_suboptimal text,
  why_ideal text,
  summary_feedback text,
  improvements jsonb default '[]'::jsonb,
  optimal_code text,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

alter table public.profiles enable row level security;
alter table public.submissions enable row level security;

create policy "Users can view own profile" on public.profiles for select using (auth.uid() = id);
create policy "Users can update own profile" on public.profiles for update using (auth.uid() = id);
create policy "Users can view own submissions" on public.submissions for select using (auth.uid() = user_id or user_id is null);
create policy "Allow insert on submissions" on public.submissions for insert with check (true);

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, email, display_name, extension_token)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    'ap_sec_' || md5(random()::text || clock_timestamp()::text)
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();`;

  const handleCopySql = () => {
    navigator.clipboard.writeText(sqlSchema);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 2000);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-300">
      <div>
        <h1 className="text-2xl font-extrabold text-white">Extension Integration & Auth Settings</h1>
        <p className="text-xs text-slate-400 mt-1">
          Connect your AlgoPulse Chrome extension to sync LeetCode reviews securely to your account.
        </p>
      </div>

      {/* User Account Status Banner */}
      {!user ? (
        <div className="p-5 rounded-2xl bg-indigo-950/40 border border-indigo-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-indigo-600/20 text-indigo-400 border border-indigo-500/30">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white">Guest Mode Active</h2>
              <p className="text-xs text-slate-300 mt-0.5">
                Sign in or register an account so your submissions stay permanently saved under your personal profile.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href="/login"
              className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-white font-medium text-xs rounded-xl border border-slate-700 transition"
            >
              Sign In
            </Link>
            <Link
              href="/signup"
              className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs rounded-xl shadow-md shadow-indigo-600/30 transition"
            >
              Create Account
            </Link>
          </div>
        </div>
      ) : (
        <div className="p-5 rounded-2xl bg-emerald-950/30 border border-emerald-800/60 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-emerald-600/20 text-emerald-400 border border-emerald-500/30">
              <CheckCircle className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <span>Authenticated as</span>
                <span className="font-mono text-emerald-300 font-semibold">{user.email}</span>
              </h2>
              <p className="text-xs text-slate-300 mt-0.5">
                Your extension submissions are linked directly to your Supabase user ID with Row-Level Security.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Extension Access Token Card */}
      <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-indigo-600/20 text-indigo-400">
              <Key className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white">Personal Extension Access Token</h2>
              <p className="text-xs text-slate-400">
                Paste this token into the AlgoPulse Chrome extension popup to authorize automatic synchronization.
              </p>
            </div>
          </div>
          <button
            onClick={handleGenerateNew}
            disabled={regenerating}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-700 bg-slate-800 hover:bg-slate-700 text-xs text-slate-200 transition cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${regenerating ? 'animate-spin' : ''}`} />
            <span>Generate New</span>
          </button>
        </div>

        <div className="flex items-center gap-2 p-3 rounded-xl bg-slate-950 border border-slate-800 font-mono text-xs">
          <span className="flex-1 text-slate-200 truncate">{token}</span>
          <button
            onClick={handleCopyToken}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-sans text-xs font-medium transition cursor-pointer shrink-0"
          >
            {copiedToken ? (
              <>
                <CheckCircle className="w-3.5 h-3.5" />
                <span>Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copy Token</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Step by Step Setup Instructions */}
      <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4">
        <h2 className="text-sm font-bold text-white flex items-center gap-2">
          <Layers className="w-4 h-4 text-indigo-400" />
          Quick 3-Step Extension Setup
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/80 space-y-2">
            <div className="w-6 h-6 rounded-full bg-indigo-600 text-white font-bold flex items-center justify-center text-xs">
              1
            </div>
            <h3 className="font-semibold text-white">Load Extension in Chrome</h3>
            <p className="text-slate-400 leading-relaxed text-[11px]">
              Open <code className="text-indigo-300">chrome://extensions</code>, enable Developer Mode, and click <strong>"Load unpacked"</strong> targeting <code className="text-indigo-300">extension/dist</code>.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/80 space-y-2">
            <div className="w-6 h-6 rounded-full bg-indigo-600 text-white font-bold flex items-center justify-center text-xs">
              2
            </div>
            <h3 className="font-semibold text-white">Enter API Key & Token</h3>
            <p className="text-slate-400 leading-relaxed text-[11px]">
              Click the AlgoPulse toolbar icon. Enter your free Gemini API key and paste your token above.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/80 space-y-2">
            <div className="w-6 h-6 rounded-full bg-indigo-600 text-white font-bold flex items-center justify-center text-xs">
              3
            </div>
            <h3 className="font-semibold text-white">Solve on LeetCode</h3>
            <p className="text-slate-400 leading-relaxed text-[11px]">
              Write your code on any LeetCode problem. Click <strong>"⚡ AlgoPulse Review"</strong> to get instant AI scoring and automatic sync!
            </p>
          </div>
        </div>
      </div>

      {/* Supabase PostgreSQL Cloud Configuration */}
      <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-emerald-600/20 text-emerald-400">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white">Supabase SQL Schema & Authentication Trigger</h2>
              <p className="text-xs text-slate-400">
                Run this script in your Supabase project (SQL Editor $\rightarrow$ New Query) to create the tables, RLS policies, and auto-token trigger.
              </p>
            </div>
          </div>
          <a
            href="https://supabase.com"
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-1 text-xs text-emerald-400 hover:underline"
          >
            <span>Supabase Free Tier</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>

        <div className="relative">
          <pre className="p-4 rounded-xl bg-slate-950 font-mono text-[11px] text-slate-300 overflow-x-auto border border-slate-800 leading-relaxed max-h-72">
            <code>{sqlSchema}</code>
          </pre>
          <button
            onClick={handleCopySql}
            className="absolute top-3 right-3 p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs flex items-center gap-1 transition cursor-pointer"
          >
            <Copy className="w-3 h-3" />
            <span>{copiedSql ? 'Copied SQL!' : 'Copy SQL'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
