'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Zap,
  LayoutDashboard,
  Code2,
  Key,
  ExternalLink,
  LogIn,
  LogOut,
  User
} from 'lucide-react';
import { useAuth } from './AuthProvider';

export const Navbar: React.FC = () => {
  const pathname = usePathname();
  const { user, profile, loading, signOut } = useAuth();

  const isAuthPage = pathname === '/login' || pathname === '/signup';
  if (isAuthPage) return null;

  return (
    <header className="sticky top-0 z-50 border-b border-[#30363d] bg-[#161b22]/95 backdrop-blur-md">
      {/* Google 4-Color Accent Line */}
      <div className="h-[2px] w-full google-gradient-bar" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="p-2 rounded-xl bg-[#4285F4] text-white shadow-md shadow-[#4285F4]/25 group-hover:scale-105 transition">
              <Zap className="w-5 h-5 text-[#FBBC05] fill-[#FBBC05]" />
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-lg tracking-tight text-[#f0f6fc] flex items-center gap-1.5">
                AlgoPulse
                <span className="text-[10px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded bg-[#21262d] text-[#4285F4] border border-[#30363d]">
                  Dashboard
                </span>
              </span>
              <span className="text-[10px] text-[#8b949e] -mt-1">
                AI Code Intelligence
              </span>
            </div>
          </Link>

          <nav className="hidden md:flex items-center gap-1">
            <Link
              href="/"
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                pathname === '/'
                  ? 'bg-[#21262d] text-[#f0f6fc] border border-[#30363d]'
                  : 'text-[#8b949e] hover:text-[#f0f6fc] hover:bg-[#21262d]/60'
              }`}
            >
              <span>Home</span>
            </Link>
            <Link
              href="/dashboard"
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                pathname === '/dashboard'
                  ? 'bg-[#21262d] text-[#f0f6fc] border border-[#30363d]'
                  : 'text-[#8b949e] hover:text-[#f0f6fc] hover:bg-[#21262d]/60'
              }`}
            >
              <LayoutDashboard className={`w-4 h-4 ${pathname === '/dashboard' ? 'text-[#4285F4]' : 'text-[#8b949e]'}`} />
              <span>Dashboard</span>
            </Link>
            <Link
              href="/submissions"
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                pathname.startsWith('/submissions')
                  ? 'bg-[#21262d] text-[#f0f6fc] border border-[#30363d]'
                  : 'text-[#8b949e] hover:text-[#f0f6fc] hover:bg-[#21262d]/60'
              }`}
            >
              <Code2 className={`w-4 h-4 ${pathname.startsWith('/submissions') ? 'text-[#34A853]' : 'text-[#8b949e]'}`} />
              <span>Submissions</span>
            </Link>
            <Link
              href="/profile"
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                pathname === '/profile'
                  ? 'bg-[#21262d] text-[#f0f6fc] border border-[#30363d]'
                  : 'text-[#8b949e] hover:text-[#f0f6fc] hover:bg-[#21262d]/60'
              }`}
            >
              <User className={`w-4 h-4 ${pathname === '/profile' ? 'text-[#EA4335]' : 'text-[#8b949e]'}`} />
              <span>Profile</span>
            </Link>
            <Link
              href="/settings"
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                pathname === '/settings'
                  ? 'bg-[#21262d] text-[#f0f6fc] border border-[#30363d]'
                  : 'text-[#8b949e] hover:text-[#f0f6fc] hover:bg-[#21262d]/60'
              }`}
            >
              <Key className={`w-4 h-4 ${pathname === '/settings' ? 'text-[#FBBC05]' : 'text-[#8b949e]'}`} />
              <span>Token</span>
            </Link>
          </nav>
        </div>

        {/* Right Auth / Action Area */}
        <div className="flex items-center gap-3">
          <a
            href="https://leetcode.com"
            target="_blank"
            rel="noreferrer"
            className="hidden sm:flex items-center gap-1 text-xs text-[#8b949e] hover:text-[#f0f6fc] transition px-3 py-1.5 rounded-lg border border-[#30363d] bg-[#21262d]/50 hover:bg-[#21262d]"
          >
            <span>LeetCode</span>
            <ExternalLink className="w-3 h-3 text-[#6e7681]" />
          </a>

          {!loading && (
            <>
              {user ? (
                <div className="flex items-center gap-2">
                  <Link
                    href="/profile"
                    className="hidden sm:flex flex-col text-right hover:opacity-80 transition"
                  >
                    <span className="text-xs font-semibold text-[#f0f6fc] truncate max-w-[140px]">
                      {profile?.display_name || user.email?.split('@')[0]}
                    </span>
                    <span className="text-[10px] text-[#8b949e] truncate max-w-[140px]">
                      {user.email}
                    </span>
                  </Link>
                  <Link
                    href="/profile"
                    className="w-8 h-8 rounded-full bg-[#21262d] hover:ring-2 hover:ring-[#4285F4] text-[#4285F4] font-bold text-xs flex items-center justify-center border border-[#30363d] transition cursor-pointer"
                  >
                    {user.email?.charAt(0).toUpperCase() || 'U'}
                  </Link>
                  <button
                    onClick={signOut}
                    title="Sign Out"
                    className="p-1.5 text-[#8b949e] hover:text-[#EA4335] hover:bg-[#21262d] rounded-lg transition cursor-pointer"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Link
                    href="/login"
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-[#c9d1d9] hover:text-[#f0f6fc] transition"
                  >
                    <LogIn className="w-3.5 h-3.5" />
                    <span>Sign In</span>
                  </Link>
                  <Link
                    href="/signup"
                    className="px-3.5 py-1.5 bg-[#4285F4] hover:bg-[#3367D6] text-white text-xs font-medium rounded-lg shadow-sm shadow-[#4285F4]/30 transition"
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
