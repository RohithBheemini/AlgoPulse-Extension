'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Zap, Lock, Mail, User, AlertCircle, CheckCircle, ArrowRight, ArrowLeft } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

export default function SignupPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const supabase = createClient();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccessMessage(null);

    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      setLoading(false);
      return;
    }

    try {
      const { data, error: authError } = await supabase.auth.signUp({
        email: email.trim(),
        password: password.trim(),
        options: {
          data: {
            full_name: name.trim()
          }
        }
      });

      if (authError) {
        throw authError;
      }

      if (data.session) {
        // Direct auto-login without email confirmation
        router.push('/');
        router.refresh();
      } else if (data.user) {
        setSuccessMessage('Account created successfully! You can now sign in with your credentials.');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to create account. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex flex-col justify-center items-center px-4 animate-in fade-in duration-300">
      <div className="w-full max-w-md space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <Link href="/" className="inline-flex items-center gap-2 group">
            <div className="p-2.5 rounded-xl bg-[#4285F4] text-white shadow-md shadow-[#4285F4]/25 group-hover:scale-105 transition">
              <Zap className="w-6 h-6 text-[#FBBC05] fill-[#FBBC05]" />
            </div>
            <span className="font-extrabold text-2xl tracking-tight text-[#f0f6fc]">
              AlgoPulse
            </span>
          </Link>
          <h2 className="text-xl font-bold text-[#f0f6fc]">Create an account</h2>
          <p className="text-xs text-[#8b949e]">
            Get your personal extension access token and start tracking your algorithmic progress.
          </p>
        </div>

        {/* Card */}
        <div className="p-8 rounded-xl bg-[#161b22] border border-[#30363d] shadow-xl space-y-5">
          {error && (
            <div className="p-3 rounded-lg bg-[#EA4335]/15 border border-[#EA4335]/30 text-[#EA4335] text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {successMessage && (
            <div className="p-3 rounded-lg bg-[#34A853]/15 border border-[#34A853]/30 text-[#34A853] text-xs flex items-center gap-2">
              <CheckCircle className="w-4 h-4 shrink-0" />
              <span>{successMessage}</span>
            </div>
          )}

          <form onSubmit={handleSignup} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-[#c9d1d9] flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-[#4285F4]" />
                Full Name / Username
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Rohith"
                className="w-full px-3.5 py-2.5 bg-[#0d1117] border border-[#30363d] rounded-lg text-xs text-[#f0f6fc] placeholder-[#8b949e] focus:outline-none focus:border-[#4285F4] transition"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-[#c9d1d9] flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-[#4285F4]" />
                Email address
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full px-3.5 py-2.5 bg-[#0d1117] border border-[#30363d] rounded-lg text-xs text-[#f0f6fc] placeholder-[#8b949e] focus:outline-none focus:border-[#4285F4] transition"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-[#c9d1d9] flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-[#4285F4]" />
                Password (min 6 characters)
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-3.5 py-2.5 bg-[#0d1117] border border-[#30363d] rounded-lg text-xs text-[#f0f6fc] placeholder-[#8b949e] focus:outline-none focus:border-[#4285F4] transition"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 bg-[#4285F4] hover:bg-[#3367D6] disabled:opacity-50 text-white font-medium text-xs rounded-lg shadow-sm shadow-[#4285F4]/30 transition flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>{loading ? 'Creating account...' : 'Create Account'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </form>

          <div className="pt-2 text-center text-xs text-[#8b949e] border-t border-[#30363d]">
            Already have an account?{' '}
            <Link
              href="/login"
              className="text-[#4285F4] font-semibold hover:underline"
            >
              Sign In
            </Link>
          </div>
        </div>

        <div className="text-center">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs text-[#8b949e] hover:text-[#f0f6fc] transition"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Return to overview</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
