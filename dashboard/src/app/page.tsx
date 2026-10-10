'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Zap,
  ArrowRight,
  Code2,
  Award,
  Clock,
  Sparkles,
  CheckCircle2,
  HelpCircle,
  ChevronDown,
  Layers,
  Cpu,
  Flame,
  Globe,
  Terminal,
  Shield,
  Activity,
  Play
} from 'lucide-react';

const FAQ_ITEMS = [
  {
    question: 'How does AlgoPulse evaluate my code approach?',
    answer:
      'AlgoPulse uses Google Gemini models (Gemini 3.8 Flash / 2.0 Flash) with a strict competitive programming rubric. It evaluates your solution across 4 pillars: Algorithmic Optimality (35 pts), Time Complexity (25 pts), Space Auxiliary Complexity (20 pts), and Code Cleanliness & Edge Cases (20 pts). It explicitly contrasts your approach with the theoretical optimal approach.'
  },
  {
    question: 'Which coding platforms are supported?',
    answer:
      'AlgoPulse works across LeetCode, GeeksforGeeks (GFG), and HackerRank. Our multi-platform content scripts dynamically extract code from Monaco, Ace Editor, CodeMirror, and standard editor DOMs, detecting language, problem slug, difficulty, and description.'
  },
  {
    question: 'How do Progressive Hints work without giving away the full answer?',
    answer:
      'Hints are tiered in 3 progressive steps: Tier 1 offers a subtle observation or invariant nudge. Tier 2 hints at the optimal data structure or pattern (e.g., "Consider a two-pointer pass or frequency map"). Tier 3 provides a concrete strategy outline without writing the code for you, ensuring genuine interview preparation.'
  },
  {
    question: 'Is AlgoPulse free and which Gemini models are supported?',
    answer:
      'AlgoPulse is 100% free and open-source. You provide your own free Gemini API key from Google AI Studio. It supports Gemini 3.8 Flash, Gemini 2.0 Flash, and Gemini 1.5 Flash with automatic fallback and zero subscription fees.'
  },
  {
    question: 'How do submissions automatically sync to my personal dashboard?',
    answer:
      'Each user gets a personal Extension Token (available in Settings or Profile). Paste your token into the AlgoPulse extension popup once. Every time you click "Analyze Code" on LeetCode, GeeksforGeeks, or HackerRank, your submission is instantly transmitted and synced to your dashboard and streak heatmap in real-time.'
  },
  {
    question: 'Is my code and API key private and secure?',
    answer:
      'Yes. Your Gemini API key and personal extension token are stored locally inside your browser storage (chrome.storage.local). Calls to Gemini are made directly via HTTPS to Google servers, and evaluations are synced to your authenticated profile.'
  }
];

export default function HomePage() {
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [demoTab, setDemoTab] = useState<'optimal' | 'brute'>('optimal');

  return (
    <div className="relative min-h-screen text-[#f0f6fc] overflow-hidden -mt-6">
      {/* Dynamic Google Colorful Lighting Ambient Glows */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden z-0">
        <div className="orb-blue absolute -top-24 left-1/4 w-[500px] h-[500px] rounded-full bg-[#4285F4] opacity-25 blur-[120px]" />
        <div className="orb-red absolute top-32 -left-20 w-[450px] h-[450px] rounded-full bg-[#EA4335] opacity-20 blur-[130px]" />
        <div className="orb-yellow absolute top-80 right-10 w-[420px] h-[420px] rounded-full bg-[#FBBC05] opacity-20 blur-[120px]" />
        <div className="orb-green absolute top-[550px] left-1/3 w-[520px] h-[520px] rounded-full bg-[#34A853] opacity-25 blur-[140px]" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 pb-24 space-y-28">
        {/* HERO SECTION */}
        <div className="text-center space-y-6 max-w-4xl mx-auto pt-6">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#161b22]/90 border border-[#30363d] backdrop-blur-md shadow-lg shadow-[#4285F4]/10 animate-in fade-in duration-500">
            <span className="flex h-2 w-2 rounded-full bg-[#34A853] animate-pulse" />
            <span className="text-xs font-semibold text-[#8b949e]">
              Powered by <span className="text-[#4285F4] font-bold">Google Gemini 3.8 Flash</span> &bull; Multi-Platform Ready
            </span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-black tracking-tight leading-[1.15]">
            Master Algorithms with{' '}
            <span className="google-text-gradient">
              Instant AI Intelligence
            </span>
          </h1>

          <p className="text-base sm:text-lg text-[#8b949e] max-w-2xl mx-auto leading-relaxed">
            The intelligent companion for <span className="text-[#f0f6fc] font-semibold">LeetCode</span>,{' '}
            <span className="text-[#f0f6fc] font-semibold">GeeksforGeeks</span>, and{' '}
            <span className="text-[#f0f6fc] font-semibold">HackerRank</span>. Evaluate code optimality, unlock progressive hints, benchmark Big-O complexity, and visualize your daily streak heatmap in real-time.
          </p>

          {/* Action CTAs */}
          <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
            <Link
              href="/dashboard"
              className="px-6 py-3 rounded-xl bg-[#4285F4] hover:bg-[#3367D6] text-white text-sm font-semibold shadow-lg shadow-[#4285F4]/30 hover:shadow-[#4285F4]/50 hover:scale-[1.02] active:scale-[0.98] transition flex items-center gap-2 cursor-pointer"
            >
              <Activity className="w-4 h-4" />
              <span>Launch Live Dashboard</span>
              <ArrowRight className="w-4 h-4 ml-1" />
            </Link>

            <Link
              href="/submissions"
              className="px-6 py-3 rounded-xl bg-[#161b22] hover:bg-[#21262d] text-[#c9d1d9] hover:text-[#f0f6fc] border border-[#30363d] hover:border-[#8b949e] text-sm font-semibold transition flex items-center gap-2"
            >
              <Code2 className="w-4 h-4 text-[#34A853]" />
              <span>Explore Submissions</span>
            </Link>

            <Link
              href="/settings"
              className="px-5 py-3 rounded-xl bg-[#161b22] hover:bg-[#21262d] text-[#8b949e] hover:text-[#f0f6fc] border border-[#30363d] text-sm font-medium transition flex items-center gap-2"
            >
              <Terminal className="w-4 h-4 text-[#FBBC05]" />
              <span>Extension Token</span>
            </Link>
          </div>

          {/* Live Interactive Evaluation Demo Widget */}
          <div className="pt-10">
            <div className="rounded-2xl bg-[#161b22]/90 border border-[#30363d] shadow-2xl backdrop-blur-xl p-4 sm:p-6 text-left max-w-4xl mx-auto pulse-glow">
              <div className="flex flex-wrap items-center justify-between pb-4 border-b border-[#30363d] gap-3">
                <div className="flex items-center gap-3">
                  <div className="flex gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-[#EA4335]" />
                    <div className="w-3 h-3 rounded-full bg-[#FBBC05]" />
                    <div className="w-3 h-3 rounded-full bg-[#34A853]" />
                  </div>
                  <span className="text-xs font-mono text-[#8b949e]">
                    interactive-demo / Two Sum (LeetCode #1)
                  </span>
                </div>

                <div className="flex items-center gap-1 bg-[#0d1117] p-1 rounded-lg border border-[#30363d]">
                  <button
                    onClick={() => setDemoTab('optimal')}
                    className={`px-3 py-1 rounded text-xs font-medium transition cursor-pointer ${
                      demoTab === 'optimal'
                        ? 'bg-[#34A853] text-white shadow'
                        : 'text-[#8b949e] hover:text-[#f0f6fc]'
                    }`}
                  >
                    Optimal Solution (100/100)
                  </button>
                  <button
                    onClick={() => setDemoTab('brute')}
                    className={`px-3 py-1 rounded text-xs font-medium transition cursor-pointer ${
                      demoTab === 'brute'
                        ? 'bg-[#EA4335] text-white shadow'
                        : 'text-[#8b949e] hover:text-[#f0f6fc]'
                    }`}
                  >
                    Brute Force (42/100)
                  </button>
                </div>
              </div>

              {/* Demo Content */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-5">
                {/* Code Window */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs text-[#8b949e]">
                    <span className="font-mono">Python3 Solution</span>
                    <span className="px-2 py-0.5 rounded bg-[#21262d] text-[#4285F4] text-[10px] font-mono">
                      {demoTab === 'optimal' ? 'Hash Map Single-Pass' : 'Nested For-Loops'}
                    </span>
                  </div>
                  <pre className="p-4 rounded-xl bg-[#0d1117] border border-[#30363d] font-mono text-xs text-[#c9d1d9] overflow-x-auto leading-relaxed">
                    {demoTab === 'optimal'
                      ? `class Solution:
    def twoSum(self, nums: List[int], target: int) -> List[int]:
        seen = {}
        for i, num in enumerate(nums):
            complement = target - num
            if complement in seen:
                return [seen[complement], i]
            seen[num] = i
        return []`
                      : `class Solution:
    def twoSum(self, nums: List[int], target: int) -> List[int]:
        n = len(nums)
        for i in range(n):
            for j in range(i + 1, n):
                if nums[i] + nums[j] == target:
                    return [i, j]
        return []`}
                  </pre>
                </div>

                {/* AlgoPulse Evaluation Preview */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-xs uppercase font-bold text-[#8b949e] tracking-wider">
                        AlgoPulse AI Score
                      </span>
                      <div className="flex items-baseline gap-2">
                        <span
                          className={`text-3xl font-extrabold ${
                            demoTab === 'optimal' ? 'text-[#34A853]' : 'text-[#FBBC05]'
                          }`}
                        >
                          {demoTab === 'optimal' ? '100' : '42'}
                        </span>
                        <span className="text-xs text-[#8b949e]">/ 100</span>
                        <span
                          className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                            demoTab === 'optimal'
                              ? 'bg-[#34A853]/20 text-[#34A853] border border-[#34A853]/30'
                              : 'bg-[#FBBC05]/20 text-[#FBBC05] border border-[#FBBC05]/30'
                          }`}
                        >
                          {demoTab === 'optimal' ? 'Optimal Approach' : 'Suboptimal Big-O'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Rubric Breakdown Bars */}
                  <div className="space-y-2 text-xs">
                    <div>
                      <div className="flex justify-between text-[#8b949e] mb-1">
                        <span>Algorithmic Optimality</span>
                        <span className="text-[#f0f6fc] font-mono font-medium">
                          {demoTab === 'optimal' ? '35 / 35' : '15 / 35'}
                        </span>
                      </div>
                      <div className="h-1.5 w-full bg-[#21262d] rounded-full overflow-hidden">
                        <div
                          className="h-full bg-[#4285F4] rounded-full transition-all duration-500"
                          style={{ width: demoTab === 'optimal' ? '100%' : '42%' }}
                        />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-[#8b949e] mb-1">
                        <span>Time Complexity (Big-O)</span>
                        <span className="text-[#f0f6fc] font-mono font-medium">
                          {demoTab === 'optimal' ? '25 / 25 (O(N))' : '8 / 25 (O(N²))'}
                        </span>
                      </div>
                      <div className="h-1.5 w-full bg-[#21262d] rounded-full overflow-hidden">
                        <div
                          className="h-full bg-[#34A853] rounded-full transition-all duration-500"
                          style={{ width: demoTab === 'optimal' ? '100%' : '32%' }}
                        />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-[#8b949e] mb-1">
                        <span>Auxiliary Space Efficiency</span>
                        <span className="text-[#f0f6fc] font-mono font-medium">
                          {demoTab === 'optimal' ? '20 / 20' : '10 / 20'}
                        </span>
                      </div>
                      <div className="h-1.5 w-full bg-[#21262d] rounded-full overflow-hidden">
                        <div
                          className="h-full bg-[#FBBC05] rounded-full transition-all duration-500"
                          style={{ width: demoTab === 'optimal' ? '100%' : '50%' }}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="p-3 rounded-lg bg-[#0d1117] border border-[#30363d] text-xs text-[#8b949e]">
                    <span className="text-[#f0f6fc] font-semibold">Gemini Insight: </span>
                    {demoTab === 'optimal'
                      ? 'Single-pass hash table yields immediate O(1) amortized lookup per element while caching simultaneously. Algorithmic theoretical limit reached.'
                      : 'Quadratic O(N²) nested loops cause TLE on large arrays. You can achieve O(N) by caching seen elements in a hash map.'}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* HOW IT WORKS SECTION (5 STEPS) */}
        <div className="space-y-12">
          <div className="text-center space-y-2">
            <span className="text-xs uppercase font-extrabold tracking-widest text-[#4285F4]">
              Seamless Workflow
            </span>
            <h2 className="text-3xl font-bold tracking-tight text-[#f0f6fc]">
              How AlgoPulse Works in 5 Steps
            </h2>
            <p className="text-sm text-[#8b949e] max-w-xl mx-auto">
              From coding in your browser to real-time sync with your mastery heatmap.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {/* Step 1 */}
            <div className="p-5 rounded-2xl bg-[#161b22] border border-[#30363d] relative hover:border-[#4285F4] transition group">
              <div className="w-8 h-8 rounded-xl bg-[#4285F4]/15 border border-[#4285F4]/30 text-[#4285F4] font-bold text-sm flex items-center justify-center mb-3">
                1
              </div>
              <h3 className="text-sm font-bold text-[#f0f6fc] group-hover:text-[#4285F4] transition">
                Install & Link Token
              </h3>
              <p className="text-xs text-[#8b949e] mt-2 leading-relaxed">
                Load the extension in Chrome and paste your personal token from the Profile page.
              </p>
            </div>

            {/* Step 2 */}
            <div className="p-5 rounded-2xl bg-[#161b22] border border-[#30363d] relative hover:border-[#EA4335] transition group">
              <div className="w-8 h-8 rounded-xl bg-[#EA4335]/15 border border-[#EA4335]/30 text-[#EA4335] font-bold text-sm flex items-center justify-center mb-3">
                2
              </div>
              <h3 className="text-sm font-bold text-[#f0f6fc] group-hover:text-[#EA4335] transition">
                Open Any Problem
              </h3>
              <p className="text-xs text-[#8b949e] mt-2 leading-relaxed">
                Visit LeetCode, GeeksforGeeks, or HackerRank. The AlgoPulse widget mounts automatically.
              </p>
            </div>

            {/* Step 3 */}
            <div className="p-5 rounded-2xl bg-[#161b22] border border-[#30363d] relative hover:border-[#FBBC05] transition group">
              <div className="w-8 h-8 rounded-xl bg-[#FBBC05]/15 border border-[#FBBC05]/30 text-[#FBBC05] font-bold text-sm flex items-center justify-center mb-3">
                3
              </div>
              <h3 className="text-sm font-bold text-[#f0f6fc] group-hover:text-[#FBBC05] transition">
                One-Click Evaluation
              </h3>
              <p className="text-xs text-[#8b949e] mt-2 leading-relaxed">
                Click &quot;Analyze Code&quot;. The extension extracts your code directly from the Monaco or Ace editor.
              </p>
            </div>

            {/* Step 4 */}
            <div className="p-5 rounded-2xl bg-[#161b22] border border-[#30363d] relative hover:border-[#34A853] transition group">
              <div className="w-8 h-8 rounded-xl bg-[#34A853]/15 border border-[#34A853]/30 text-[#34A853] font-bold text-sm flex items-center justify-center mb-3">
                4
              </div>
              <h3 className="text-sm font-bold text-[#f0f6fc] group-hover:text-[#34A853] transition">
                Instant 4-Pillar Score
              </h3>
              <p className="text-xs text-[#8b949e] mt-2 leading-relaxed">
                Receive Big-O comparison, 3-tier progressive hints, and optimal code reference in seconds.
              </p>
            </div>

            {/* Step 5 */}
            <div className="p-5 rounded-2xl bg-[#161b22] border border-[#30363d] relative hover:border-[#4285F4] transition group">
              <div className="w-8 h-8 rounded-xl bg-[#4285F4]/15 border border-[#4285F4]/30 text-[#4285F4] font-bold text-sm flex items-center justify-center mb-3">
                5
              </div>
              <h3 className="text-sm font-bold text-[#f0f6fc] group-hover:text-[#4285F4] transition">
                Real-Time Cloud Sync
              </h3>
              <p className="text-xs text-[#8b949e] mt-2 leading-relaxed">
                Your submission is immediately synced to your dashboard, updating streaks and heatmap live.
              </p>
            </div>
          </div>
        </div>

        {/* SUPPORTED PLATFORMS SHOWCASE */}
        <div className="space-y-8">
          <div className="text-center space-y-2">
            <span className="text-xs uppercase font-extrabold tracking-widest text-[#34A853]">
              Cross-Platform Ready
            </span>
            <h2 className="text-3xl font-bold tracking-tight text-[#f0f6fc]">
              Works Across Your Preferred Platforms
            </h2>
            <p className="text-sm text-[#8b949e] max-w-xl mx-auto">
              AlgoPulse is engineered to work wherever you practice competitive programming and technical interview prep.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* LeetCode Card */}
            <div className="p-6 rounded-2xl bg-[#161b22] border border-[#30363d] hover:border-[#FBBC05]/60 transition space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-lg font-bold text-[#f0f6fc]">LeetCode</span>
                <span className="px-2.5 py-1 rounded bg-[#FBBC05]/15 text-[#FBBC05] border border-[#FBBC05]/30 text-xs font-semibold">
                  Monaco Engine
                </span>
              </div>
              <p className="text-xs text-[#8b949e] leading-relaxed">
                Deep bridge into the Monaco editor internal model. Supports full problem context, testcase separation, dynamic slug and difficulty extraction.
              </p>
              <div className="pt-2 flex items-center gap-2 text-xs text-[#34A853]">
                <CheckCircle2 className="w-4 h-4" />
                <span>leetcode.com/problems/*</span>
              </div>
            </div>

            {/* GeeksforGeeks Card */}
            <div className="p-6 rounded-2xl bg-[#161b22] border border-[#30363d] hover:border-[#34A853]/60 transition space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-lg font-bold text-[#f0f6fc]">GeeksforGeeks</span>
                <span className="px-2.5 py-1 rounded bg-[#34A853]/15 text-[#34A853] border border-[#34A853]/30 text-xs font-semibold">
                  Ace & CodeMirror
                </span>
              </div>
              <p className="text-xs text-[#8b949e] leading-relaxed">
                Full compatibility with GFG practice portal. Injects into Ace editor and CodeMirror instances with automatic topic and tag recognition.
              </p>
              <div className="pt-2 flex items-center gap-2 text-xs text-[#34A853]">
                <CheckCircle2 className="w-4 h-4" />
                <span>geeksforgeeks.org/problems/*</span>
              </div>
            </div>

            {/* HackerRank Card */}
            <div className="p-6 rounded-2xl bg-[#161b22] border border-[#30363d] hover:border-[#4285F4]/60 transition space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-lg font-bold text-[#f0f6fc]">HackerRank</span>
                <span className="px-2.5 py-1 rounded bg-[#4285F4]/15 text-[#4285F4] border border-[#4285F4]/30 text-xs font-semibold">
                  Challenges
                </span>
              </div>
              <p className="text-xs text-[#8b949e] leading-relaxed">
                Automated challenge title, problem statement, and solution extraction from HackerRank interview preparation kits and coding contests.
              </p>
              <div className="pt-2 flex items-center gap-2 text-xs text-[#34A853]">
                <CheckCircle2 className="w-4 h-4" />
                <span>hackerrank.com/challenges/*</span>
              </div>
            </div>
          </div>
        </div>

        {/* COMMON FAQS ACCORDION */}
        <div className="space-y-8 max-w-4xl mx-auto">
          <div className="text-center space-y-2">
            <span className="text-xs uppercase font-extrabold tracking-widest text-[#FBBC05]">
              Got Questions?
            </span>
            <h2 className="text-3xl font-bold tracking-tight text-[#f0f6fc]">
              Frequently Asked Questions
            </h2>
            <p className="text-sm text-[#8b949e]">
              Everything you need to know about the extension, AI scoring, and live sync.
            </p>
          </div>

          <div className="space-y-3">
            {FAQ_ITEMS.map((item, index) => {
              const isOpen = openFaq === index;
              return (
                <div
                  key={index}
                  className="rounded-xl bg-[#161b22] border border-[#30363d] overflow-hidden transition"
                >
                  <button
                    onClick={() => setOpenFaq(isOpen ? null : index)}
                    className="w-full px-5 py-4 flex items-center justify-between text-left text-sm font-semibold text-[#f0f6fc] hover:text-[#4285F4] transition cursor-pointer"
                  >
                    <span>{item.question}</span>
                    <ChevronDown
                      className={`w-4 h-4 text-[#8b949e] transition-transform duration-200 ${
                        isOpen ? 'rotate-180 text-[#4285F4]' : ''
                      }`}
                    />
                  </button>
                  {isOpen && (
                    <div className="px-5 pb-4 text-xs text-[#8b949e] leading-relaxed border-t border-[#30363d]/50 pt-3 animate-in fade-in duration-200">
                      {item.answer}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* BOTTOM CALL TO ACTION */}
        <div className="rounded-3xl bg-gradient-to-r from-[#161b22] via-[#21262d] to-[#161b22] border border-[#30363d] p-8 sm:p-12 text-center space-y-6 relative overflow-hidden shadow-2xl">
          <div className="absolute top-0 left-0 right-0 h-1 google-gradient-bar" />
          <h2 className="text-2xl sm:text-4xl font-extrabold text-[#f0f6fc] tracking-tight">
            Ready to Supercharge Your Coding Journey?
          </h2>
          <p className="text-sm text-[#8b949e] max-w-xl mx-auto">
            Get instant clarity on every algorithmic submission and watch your problem-solving metrics soar.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
            <Link
              href="/dashboard"
              className="px-6 py-3 rounded-xl bg-[#4285F4] hover:bg-[#3367D6] text-white text-sm font-semibold shadow-lg shadow-[#4285F4]/30 transition flex items-center gap-2 cursor-pointer"
            >
              <Activity className="w-4 h-4" />
              <span>Go to Analytics Dashboard</span>
            </Link>
            <Link
              href="/profile"
              className="px-6 py-3 rounded-xl bg-[#21262d] hover:bg-[#30363d] text-[#f0f6fc] border border-[#30363d] text-sm font-semibold transition flex items-center gap-2"
            >
              <Shield className="w-4 h-4 text-[#34A853]" />
              <span>View Profile & Token</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
