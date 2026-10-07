'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Zap,
  LayoutDashboard,
  Code2,
  Settings,
  ExternalLink,
  LogIn,
  LogOut,
  User,
  Key
} from 'lucide-react';
import { useAuth } from './AuthProvider';

export const Navbar: React.FC = () => {
  const pathname = usePathname();
  const { user, profile, loading, signOut } = useAuth();

  const isAuthPage = pathname === '/login' || pathname === '/signup';
  if (isAuthPage) return null;

  return (
    <header className="sticky top-0 z-50 border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="p-2 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-500/20 group-hover:scale-105 transition">
              <Zap className="w-5 h-5 text-amber-300" />
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-lg tracking-tight text-white flex items-center gap-1.5">
                AlgoPulse
                <span className="text-[10px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
                  Dashboard
                </span>
              </span>
              <span className="text-[10px] text-slate-400 -mt-1">
                AI Code Intelligence
              </span>
            </div>
          </Link>

          <nav className="hidden md:flex items-center gap-1">
            <Link
              href="/"
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition ${
                pathname === '/'
                  ? 'bg-slate-900 text-white'
                  : 'text-slate-400 hover:text-white hover:bg-slate-900/50'
              }`}
            >
              <LayoutDashboard className="w-4 h-4 text-indigo-400" />
              <span>Overview</span>
            </Link>
            <Link
              href="/submissions"
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition ${
                pathname.startsWith('/submissions')
                  ? 'bg-slate-900 text-white'
                  : 'text-slate-400 hover:text-white hover:bg-slate-900/50'
              }`}
            >
              <Code2 className="w-4 h-4 text-indigo-400" />
              <span>Submissions</span>
            </Link>
            <Link
              href="/settings"
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition ${
                pathname === '/settings'
                  ? 'bg-slate-900 text-white'
                  : 'text-slate-400 hover:text-white hover:bg-slate-900/50'
              }`}
            >
              <Key className="w-4 h-4 text-indigo-400" />
              <span>Extension Token</span>
            </Link>
          </nav>
        </div>

        {/* Right Auth / Action Area */}
        <div className="flex items-center gap-3">
          <a
            href="https://leetcode.com"
            target="_blank"
            rel="noreferrer"
            className="hidden sm:flex items-center gap-1 text-xs text-slate-400 hover:text-white transition px-3 py-1.5 rounded-lg border border-slate-800 bg-slate-900/60"
          >
            <span>LeetCode</span>
            <ExternalLink className="w-3 h-3 text-slate-500" />
          </a>

          {!loading && (
            <>
              {user ? (
                <div className="flex items-center gap-2">
                  <div className="hidden sm:flex flex-col text-right">
                    <span className="text-xs font-semibold text-white truncate max-w-[140px]">
                      {profile?.display_name || user.email?.split('@')[0]}
                    </span>
                    <span className="text-[10px] text-slate-400 truncate max-w-[140px]">
                      {user.email}
                    </span>
                  </div>
                  <div className="w-8 h-8 rounded-full bg-indigo-600 text-white font-bold text-xs flex items-center justify-center border border-indigo-400/30">
                    {user.email?.charAt(0).toUpperCase() || 'U'}
                  </div>
                  <button
                    onClick={signOut}
                    title="Sign Out"
                    className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-900 rounded-lg transition"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Link
                    href="/login"
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-300 hover:text-white transition"
                  >
                    <LogIn className="w-3.5 h-3.5" />
                    <span>Sign In</span>
                  </Link>
                  <Link
                    href="/signup"
                    className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium rounded-lg shadow-md shadow-indigo-600/20 transition"
                  >
                    Sign Up
                  </Link>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </header>
  );
};
