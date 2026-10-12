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
  ChevronDown,
  Layers,
  Cpu,
  Flame,
  Globe,
  Terminal,
  Shield,
  Activity,
  Play,
  Key,
  Copy,
  Check,
  FileCode,
  Layout,
  ExternalLink,
  Laptop,
  CheckCheck,
  Search,
  GitBranch,
  RotateCcw,
  RefreshCw
} from 'lucide-react';
import { useAuth } from '@/components/AuthProvider';

const FAQ_ITEMS = [
  {
    question: 'How does AlgoPulse evaluate my code approach instead of just runtime?',
    answer:
      'AlgoPulse uses Google Gemini models (Gemini 3.8 Flash / 2.0 Flash) with a strict competitive programming rubric. Rather than relying on volatile milliseconds from external servers, it evaluates your core algorithmic strategy across 4 pillars: Algorithmic Optimality (35 pts), Time Complexity Big-O (25 pts), Auxiliary Space Efficiency (20 pts), and Code Cleanliness & Edge Cases (20 pts). It explicitly contrasts your approach with the theoretical mathematical optimal approach.'
  },
  {
    question: 'How does AlgoPulse work in the Browser vs VS Code?',
    answer:
      'In your browser (Chrome/Edge/Brave), AlgoPulse attaches directly to LeetCode, GeeksforGeeks, and HackerRank via content scripts, injecting a floating widget and an interactive slide-over review drawer directly over the Monaco/Ace editor. In VS Code, it operates as a native desktop extension with an Activity Bar sidepanel, responding to Ctrl+Alt+A to evaluate your active workspace file and offering a 1-click "Insert Optimal Code into Editor" button.'
  },
  {
    question: 'How do Progressive Hints work without giving away the complete answer?',
    answer:
      'Hints are tiered across 3 progressive levels: Tier 1 offers a subtle observation or invariant nudge. Tier 2 hints at the optimal data structure or pattern (e.g., "Consider a two-pointer pass or frequency map"). Tier 3 provides a concrete strategy outline without writing the code for you, ensuring genuine interview preparation and deeper retention.'
  },
  {
    question: 'Which coding platforms and languages are supported?',
    answer:
      'AlgoPulse supports LeetCode, GeeksforGeeks (GFG), and HackerRank in the browser, plus any local file in VS Code. It evaluates Python, C++, Java, JavaScript, TypeScript, Go, Rust, and C#.'
  },
  {
    question: 'Is AlgoPulse free and which Gemini models power it?',
    answer:
      'AlgoPulse is 100% free and open-source. You provide your own free Gemini API key from Google AI Studio. It supports Gemini 3.8 Flash, Gemini 2.0 Flash, and Gemini 1.5 Flash with zero subscription fees.'
  },
  {
    question: 'How do submissions automatically sync to my personal dashboard?',
    answer:
      'Each user receives a unique Extension Token (available right below, or on your Profile/Dashboard page). Simply paste your token into the AlgoPulse extension popup or VS Code extension settings once. Every evaluation from any platform is instantly transmitted and synced to your dashboard and streak heatmap in real-time.'
  }
];

export default function HomePage() {
  const { user, profile } = useAuth();
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  // Demonstration Interactive States
  const [demoEnv, setDemoEnv] = useState<'browser' | 'vscode'>('browser');
  const [demoApproach, setDemoApproach] = useState<'optimal' | 'suboptimal'>('suboptimal');
  const [browserPlatform, setBrowserPlatform] = useState<'leetcode' | 'gfg'>('leetcode');
  const [selectedHint, setSelectedHint] = useState<number>(1);
  const [codeInserted, setCodeInserted] = useState<boolean>(false);
  const [copiedToken, setCopiedToken] = useState<boolean>(false);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [analyzeSuccessToast, setAnalyzeSuccessToast] = useState<string | null>(null);

  const token = profile?.extension_token || 'ap_sec_9a7b3e1f0c4d2e8';

  const handleCopyToken = () => {
    navigator.clipboard.writeText(token);
    setCopiedToken(true);
    setTimeout(() => setCopiedToken(false), 2000);
  };

  const handleInsertCode = () => {
    setCodeInserted(true);
    setDemoApproach('optimal');
    setTimeout(() => setCodeInserted(false), 3000);
  };

  const handleResetVsCode = () => {
    setCodeInserted(false);
    setDemoApproach('suboptimal');
  };

  const triggerMockAnalysis = (source: string) => {
    setIsAnalyzing(true);
    setTimeout(() => {
      setIsAnalyzing(false);
      setAnalyzeSuccessToast(`Evaluated by Gemini 3.8 Flash from ${source}!`);
      setTimeout(() => setAnalyzeSuccessToast(null), 3000);
    }, 450);
  };

  // Problem-specific data for Browser Demo
  const browserData = {
    leetcode: {
      title: '1. Two Sum',
      url: 'https://leetcode.com/problems/two-sum/',
      engine: 'Monaco Engine Attached',
      description: 'Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.',
      optimalCode: `class Solution:
    def twoSum(self, nums: List[int], target: int) -> List[int]:
        # Optimal Single-Pass Hash Table: O(N) Time, O(N) Space
        seen = {}
        for i, num in enumerate(nums):
            diff = target - num
            if diff in seen:
                return [seen[diff], i]
            seen[num] = i
        return []`,
      suboptimalCode: `class Solution:
    def twoSum(self, nums: List[int], target: int) -> List[int]:
        # Suboptimal Brute Force: O(N²) Time, O(1) Space
        n = len(nums)
        for i in range(n):
            for j in range(i + 1, n):
                if nums[i] + nums[j] == target:
                    return [i, j]
        return []`,
      optimalScore: 100,
      suboptimalScore: 42,
      optimalBreakdown: { opt: '35 / 35', time: '25 / 25 (O(N))', space: '20 / 20 (O(N))' },
      suboptimalBreakdown: { opt: '15 / 35', time: '8 / 25 (O(N²))', space: '10 / 20 (O(1))' },
      optimalInsight: 'Single-pass hash table stores complements with amortized O(1) lookup. Reaches the theoretical lower bound for two-sum.',
      suboptimalInsight: 'Quadratic nested loops result in O(N²) time complexity, which causes Time Limit Exceeded (TLE) on large test inputs.',
      hints: {
        1: 'For every number x, the required complement is target - x. Can you find it faster than scanning the entire list?',
        2: 'Trade O(N) memory for time: use a Hash Map to store elements and their index positions.',
        3: 'Populate your hash map dynamically in a single pass as you iterate so you never match a number with itself.'
      }
    },
    gfg: {
      title: 'Subarray with Given Sum',
      url: 'https://practice.geeksforgeeks.org/problems/subarray-with-given-sum/',
      engine: 'Ace & CodeMirror Injected',
      description: 'Given an unsorted array arr of size N of non-negative integers, find a continuous sub-array which adds to a given sum S.',
      optimalCode: `class Solution:
    def subarraySum(self, arr: List[int], n: int, s: int) -> List[int]:
        # Optimal Two-Pointer Sliding Window: O(N) Time, O(1) Space
        left, curr_sum = 0, 0
        for right in range(n):
            curr_sum += arr[right]
            while curr_sum > s and left < right:
                curr_sum -= arr[left]
                left += 1
            if curr_sum == s:
                return [left + 1, right + 1] # 1-based indexing
        return [-1]`,
      suboptimalCode: `class Solution:
    def subarraySum(self, arr: List[int], n: int, s: int) -> List[int]:
        # Suboptimal Nested For-Loops: O(N²) Time
        for i in range(n):
            curr_sum = 0
            for j in range(i, n):
                curr_sum += arr[j]
                if curr_sum == s:
                    return [i + 1, j + 1]
        return [-1]`,
      optimalScore: 100,
      suboptimalScore: 38,
      optimalBreakdown: { opt: '35 / 35', time: '25 / 25 (O(N))', space: '20 / 20 (O(1))' },
      suboptimalBreakdown: { opt: '14 / 35', time: '7 / 25 (O(N²))', space: '10 / 20 (O(1))' },
      optimalInsight: 'Two-pointer sliding window expands the right pointer and contracts the left in amortized O(N) operations without redundant summing.',
      suboptimalInsight: 'Nested for-loops compute subarray sums in O(N²) quadratic time, triggering Time Limit Exceeded (TLE) on arrays where N = 10⁵.',
      hints: {
        1: 'Since all array integers are non-negative, expanding the window strictly increases the sum and contracting it strictly decreases the sum.',
        2: 'Maintain a running window sum between two pointers left and right instead of recomputing from scratch.',
        3: 'While curr_sum > s and left < right, subtract arr[left] and advance left. When curr_sum == s, return 1-based indices.'
      }
    }
  };

  const activeBrowser = browserData[browserPlatform];

  return (
    <div className="relative min-h-screen text-[#f0f6fc] overflow-hidden -mt-6">
      {/* Dynamic Google Colorful Lighting Ambient Glows */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden z-0">
        <div className="orb-blue absolute -top-24 left-1/4 w-[520px] h-[520px] rounded-full bg-[#4285F4] opacity-25 blur-[125px]" />
        <div className="orb-red absolute top-36 -left-20 w-[460px] h-[460px] rounded-full bg-[#EA4335] opacity-20 blur-[130px]" />
        <div className="orb-yellow absolute top-96 right-10 w-[440px] h-[440px] rounded-full bg-[#FBBC05] opacity-20 blur-[125px]" />
        <div className="orb-green absolute top-[600px] left-1/3 w-[540px] h-[540px] rounded-full bg-[#34A853] opacity-25 blur-[145px]" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-24 space-y-24">
        {/* HERO SECTION - Purely educational demonstration focus, no premature action clutter */}
        <div className="text-center space-y-5 max-w-4xl mx-auto pt-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#161b22]/90 border border-[#30363d] backdrop-blur-md shadow-lg shadow-[#4285F4]/10">
            <span className="flex h-2 w-2 rounded-full bg-[#34A853] animate-pulse" />
            <span className="text-xs font-semibold text-[#8b949e]">
              Powered by <span className="text-[#4285F4] font-bold">Google Gemini 3.8 Flash</span> &bull; Dual-Engine Experience
            </span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-black tracking-tight leading-[1.12]">
            Master Algorithms with{' '}
            <span className="google-text-gradient">
              Instant AI Intelligence
            </span>
          </h1>

          <p className="text-base sm:text-lg text-[#8b949e] max-w-2xl mx-auto leading-relaxed">
            Experience how AlgoPulse evaluates your solution approach, benchmarks Big-O complexity, and delivers progressive hints across <span className="text-[#f0f6fc] font-semibold">Web Browsers (LeetCode & GFG)</span> and directly inside your <span className="text-[#f0f6fc] font-semibold">VS Code Editor</span>.
          </p>

          <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#4285F4] pt-1">
            <Sparkles className="w-3.5 h-3.5 text-[#FBBC05]" />
            <span>Interactive Live Demonstration Below</span>
            <Sparkles className="w-3.5 h-3.5 text-[#FBBC05]" />
          </div>
        </div>

        {/* DUAL-EXTENSION INTERACTIVE DEMONSTRATION SHOWCASE */}
        <div className="space-y-6 max-w-6xl mx-auto">
          {/* Main Environment Tabs (Browser vs VS Code) */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-2 rounded-2xl bg-[#161b22] border border-[#30363d] backdrop-blur-md shadow-lg">
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button
                onClick={() => setDemoEnv('browser')}
                className={`flex-1 sm:flex-initial px-5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition flex items-center justify-center gap-2.5 cursor-pointer ${
                  demoEnv === 'browser'
                    ? 'bg-[#4285F4] text-white shadow-lg shadow-[#4285F4]/30'
                    : 'text-[#8b949e] hover:text-[#f0f6fc] hover:bg-[#21262d]'
                }`}
              >
                <Globe className="w-4 h-4" />
                <span>🌐 Browser Extension (LeetCode / GFG)</span>
              </button>

              <button
                onClick={() => setDemoEnv('vscode')}
                className={`flex-1 sm:flex-initial px-5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition flex items-center justify-center gap-2.5 cursor-pointer ${
                  demoEnv === 'vscode'
                    ? 'bg-[#4285F4] text-white shadow-lg shadow-[#4285F4]/30'
                    : 'text-[#8b949e] hover:text-[#f0f6fc] hover:bg-[#21262d]'
                }`}
              >
                <Laptop className="w-4 h-4" />
                <span>💻 VS Code Extension (Desktop IDE)</span>
              </button>
            </div>

            {/* Approach Toggle (Suboptimal vs Optimal) */}
            <div className="flex items-center gap-1.5 bg-[#0d1117] p-1 rounded-xl border border-[#30363d] w-full sm:w-auto justify-center">
              <button
                onClick={() => setDemoApproach('suboptimal')}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition cursor-pointer ${
                  demoApproach === 'suboptimal'
                    ? 'bg-[#EA4335] text-white shadow'
                    : 'text-[#8b949e] hover:text-[#f0f6fc]'
                }`}
              >
                Suboptimal Approach
              </button>
              <button
                onClick={() => setDemoApproach('optimal')}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition cursor-pointer ${
                  demoApproach === 'optimal'
                    ? 'bg-[#34A853] text-white shadow'
                    : 'text-[#8b949e] hover:text-[#f0f6fc]'
                }`}
              >
                Optimal Solution (100)
              </button>
            </div>
          </div>

          {/* Interactive Analysis Toast if Triggered */}
          {analyzeSuccessToast && (
            <div className="p-3 rounded-xl bg-[#34A853]/20 border border-[#34A853] text-[#34A853] text-xs font-semibold text-center animate-in fade-in flex items-center justify-center gap-2">
              <CheckCircle2 className="w-4 h-4" />
              <span>{analyzeSuccessToast}</span>
            </div>
          )}

          {/* ========================================================================= */}
          {/* DEMO ENVIRONMENT A: BROWSER EXTENSION (LeetCode / GeeksforGeeks)          */}
          {/* ========================================================================= */}
          {demoEnv === 'browser' && (
            <div className="rounded-2xl bg-[#161b22]/95 border border-[#30363d] shadow-2xl backdrop-blur-xl overflow-hidden pulse-glow">
              {/* Browser Window Chrome */}
              <div className="bg-[#0d1117] px-4 py-3 border-b border-[#30363d] flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="flex gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-[#EA4335]" />
                    <div className="w-3 h-3 rounded-full bg-[#FBBC05]" />
                    <div className="w-3 h-3 rounded-full bg-[#34A853]" />
                  </div>
                  <div className="flex items-center gap-2 px-3 py-1 rounded-lg bg-[#161b22] border border-[#30363d] text-xs font-mono text-[#8b949e] max-w-sm sm:max-w-md truncate">
                    <Globe className="w-3 h-3 text-[#34A853]" />
                    <span>{activeBrowser.url}</span>
                  </div>
                </div>

                {/* Platform Toggle */}
                <div className="flex items-center gap-1 bg-[#161b22] p-1 rounded-lg border border-[#30363d]">
                  <button
                    onClick={() => {
                      setBrowserPlatform('leetcode');
                      setSelectedHint(1);
                    }}
                    className={`px-2.5 py-0.5 rounded text-[11px] font-semibold transition cursor-pointer ${
                      browserPlatform === 'leetcode'
                        ? 'bg-[#FBBC05] text-[#0d1117]'
                        : 'text-[#8b949e] hover:text-[#f0f6fc]'
                    }`}
                  >
                    LeetCode #1
                  </button>
                  <button
                    onClick={() => {
                      setBrowserPlatform('gfg');
                      setSelectedHint(1);
                    }}
                    className={`px-2.5 py-0.5 rounded text-[11px] font-semibold transition cursor-pointer ${
                      browserPlatform === 'gfg'
                        ? 'bg-[#34A853] text-white'
                        : 'text-[#8b949e] hover:text-[#f0f6fc]'
                    }`}
                  >
                    GeeksforGeeks
                  </button>
                </div>
              </div>

              {/* In-Browser Web Problem Page & Floating AlgoPulse Drawer */}
              <div className="p-5 sm:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Left: Problem Context & Monaco Code Editor */}
                <div className="lg:col-span-7 space-y-4">
                  {/* Problem Header */}
                  <div className="p-4 rounded-xl bg-[#0d1117] border border-[#30363d] space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-[#f0f6fc]">
                          {activeBrowser.title}
                        </span>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[#34A853]/15 text-[#34A853] border border-[#34A853]/30">
                          {browserPlatform === 'leetcode' ? 'Easy' : 'Medium'}
                        </span>
                      </div>
                      <span className="text-[10px] font-mono text-[#8b949e]">
                        {activeBrowser.engine}
                      </span>
                    </div>
                    <p className="text-xs text-[#8b949e] leading-relaxed">
                      {activeBrowser.description}
                    </p>
                  </div>

                  {/* Monaco / Ace Code Window */}
                  <div className="space-y-2 relative">
                    <div className="flex items-center justify-between text-xs text-[#8b949e] px-1">
                      <span className="font-mono text-[11px]">
                        {browserPlatform === 'leetcode' ? 'Monaco Editor Model (Python 3)' : 'Ace Editor Model (Python 3)'}
                      </span>
                      <span className="px-2 py-0.5 rounded bg-[#21262d] text-[#4285F4] text-[10px] font-mono">
                        {demoApproach === 'optimal' ? 'Optimal Strategy' : 'Suboptimal Strategy'}
                      </span>
                    </div>

                    <div className="relative group">
                      <pre className="p-4 rounded-xl bg-[#0d1117] border border-[#30363d] font-mono text-xs text-[#c9d1d9] overflow-x-auto leading-relaxed">
                        {demoApproach === 'optimal'
                          ? activeBrowser.optimalCode
                          : activeBrowser.suboptimalCode}
                      </pre>

                      {/* Interactive In-Page Floating Badge (Click to simulate Analyze Code) */}
                      <div className="absolute top-3 right-3 flex items-center gap-2">
                        <button
                          onClick={() => triggerMockAnalysis('Browser Extension')}
                          disabled={isAnalyzing}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#4285F4] hover:bg-[#3367D6] text-white text-xs font-semibold shadow-lg shadow-[#4285F4]/40 border border-white/20 transition cursor-pointer active:scale-95"
                          title="Click to trigger in-page code analysis"
                        >
                          {isAnalyzing ? (
                            <>
                              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                              <span>Analyzing...</span>
                            </>
                          ) : (
                            <>
                              <Zap className="w-3.5 h-3.5 fill-white" />
                              <span>Analyze Code</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right: In-Page Slideover AlgoPulse Analysis Drawer */}
                <div className="lg:col-span-5 rounded-2xl bg-[#0d1117] border border-[#30363d] p-5 space-y-4">
                  <div className="flex items-center justify-between border-b border-[#30363d] pb-3">
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 rounded-lg bg-[#4285F4]/15 text-[#4285F4] border border-[#4285F4]/30">
                        <Zap className="w-4 h-4 text-[#FBBC05] fill-[#FBBC05]" />
                      </div>
                      <div>
                        <h3 className="text-xs font-bold text-[#f0f6fc]">AlgoPulse In-Page Drawer</h3>
                        <p className="text-[10px] text-[#8b949e]">Automatic DOM Extraction & Gemini Review</p>
                      </div>
                    </div>
                    <span
                      className={`text-xs px-2.5 py-0.5 rounded-full font-bold ${
                        demoApproach === 'optimal'
                          ? 'bg-[#34A853]/20 text-[#34A853] border border-[#34A853]/30'
                          : 'bg-[#FBBC05]/20 text-[#FBBC05] border border-[#FBBC05]/30'
                      }`}
                    >
                      {demoApproach === 'optimal'
                        ? `Optimal (${activeBrowser.optimalScore})`
                        : `Suboptimal (${activeBrowser.suboptimalScore})`}
                    </span>
                  </div>

                  {/* 4 Pillars Scoring */}
                  <div className="space-y-2 text-xs">
                    <div>
                      <div className="flex justify-between text-[#8b949e] mb-1">
                        <span>Algorithmic Optimality (35 pts)</span>
                        <span className="text-[#f0f6fc] font-mono font-medium">
                          {demoApproach === 'optimal'
                            ? activeBrowser.optimalBreakdown.opt
                            : activeBrowser.suboptimalBreakdown.opt}
                        </span>
                      </div>
                      <div className="h-1.5 w-full bg-[#21262d] rounded-full overflow-hidden">
                        <div
                          className="h-full bg-[#4285F4] rounded-full transition-all duration-500"
                          style={{ width: demoApproach === 'optimal' ? '100%' : '42%' }}
                        />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-[#8b949e] mb-1">
                        <span>Time Complexity (25 pts)</span>
                        <span className="text-[#f0f6fc] font-mono font-medium">
                          {demoApproach === 'optimal'
                            ? activeBrowser.optimalBreakdown.time
                            : activeBrowser.suboptimalBreakdown.time}
                        </span>
                      </div>
                      <div className="h-1.5 w-full bg-[#21262d] rounded-full overflow-hidden">
                        <div
                          className="h-full bg-[#34A853] rounded-full transition-all duration-500"
                          style={{ width: demoApproach === 'optimal' ? '100%' : '32%' }}
                        />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-[#8b949e] mb-1">
                        <span>Auxiliary Space Efficiency (20 pts)</span>
                        <span className="text-[#f0f6fc] font-mono font-medium">
                          {demoApproach === 'optimal'
                            ? activeBrowser.optimalBreakdown.space
                            : activeBrowser.suboptimalBreakdown.space}
                        </span>
                      </div>
                      <div className="h-1.5 w-full bg-[#21262d] rounded-full overflow-hidden">
                        <div
                          className="h-full bg-[#FBBC05] rounded-full transition-all duration-500"
                          style={{ width: demoApproach === 'optimal' ? '100%' : '50%' }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Gemini Approach Insight */}
                  <div className="p-3 rounded-xl bg-[#161b22] border border-[#30363d] text-xs text-[#8b949e] space-y-1">
                    <span className="text-[#f0f6fc] font-semibold">Gemini Approach Evaluation: </span>
                    <p className="leading-relaxed">
                      {demoApproach === 'optimal'
                        ? activeBrowser.optimalInsight
                        : activeBrowser.suboptimalInsight}
                    </p>
                  </div>

                  {/* Progressive Hints Walkthrough */}
                  <div className="space-y-2 pt-1 border-t border-[#30363d]">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold text-[#f0f6fc] uppercase tracking-wider">
                        Progressive Hints Engine
                      </span>
                      <span className="text-[10px] text-[#8b949e]">Click to reveal tier</span>
                    </div>

                    <div className="grid grid-cols-3 gap-1.5">
                      <button
                        onClick={() => setSelectedHint(1)}
                        className={`py-1 px-1.5 rounded text-[10px] font-semibold transition cursor-pointer truncate ${
                          selectedHint === 1
                            ? 'bg-[#4285F4] text-white'
                            : 'bg-[#21262d] text-[#8b949e] hover:text-[#f0f6fc]'
                        }`}
                      >
                        Hint 1: Invariant
                      </button>
                      <button
                        onClick={() => setSelectedHint(2)}
                        className={`py-1 px-1.5 rounded text-[10px] font-semibold transition cursor-pointer truncate ${
                          selectedHint === 2
                            ? 'bg-[#34A853] text-white'
                            : 'bg-[#21262d] text-[#8b949e] hover:text-[#f0f6fc]'
                        }`}
                      >
                        Hint 2: Pattern
                      </button>
                      <button
                        onClick={() => setSelectedHint(3)}
                        className={`py-1 px-1.5 rounded text-[10px] font-semibold transition cursor-pointer truncate ${
                          selectedHint === 3
                            ? 'bg-[#FBBC05] text-[#0d1117]'
                            : 'bg-[#21262d] text-[#8b949e] hover:text-[#f0f6fc]'
                        }`}
                      >
                        Hint 3: Strategy
                      </button>
                    </div>

                    <div className="p-2.5 rounded-lg bg-[#161b22] border border-[#30363d] text-[11px] text-[#c9d1d9] leading-relaxed">
                      <span>💡 <strong>Tier {selectedHint}:</strong> {activeBrowser.hints[selectedHint as 1 | 2 | 3]}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* DEMO ENVIRONMENT B: VS CODE EXTENSION (Desktop IDE)                       */}
          {/* ========================================================================= */}
          {demoEnv === 'vscode' && (
            <div className="rounded-2xl bg-[#161b22]/95 border border-[#30363d] shadow-2xl backdrop-blur-xl overflow-hidden pulse-glow">
              {/* VS Code Window Chrome */}
              <div className="bg-[#090d16] px-4 py-2.5 border-b border-[#30363d] flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="flex gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-[#EA4335]" />
                    <div className="w-3 h-3 rounded-full bg-[#FBBC05]" />
                    <div className="w-3 h-3 rounded-full bg-[#34A853]" />
                  </div>
                  <span className="text-xs font-mono text-[#8b949e] ml-2">
                    solution.py &mdash; AlgoPulse [VS Code Extension] &mdash; Visual Studio Code
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded bg-[#21262d] text-[#4285F4] text-[10px] font-mono font-medium">
                    Ctrl + Alt + A
                  </span>
                </div>
              </div>

              {/* VS Code Three-Column Architecture */}
              <div className="grid grid-cols-1 md:grid-cols-12 min-h-[460px]">
                {/* 1. VS Code Activity Bar (Left Strip) */}
                <div className="hidden md:flex md:col-span-1 bg-[#0d1117] border-r border-[#30363d] flex-col items-center py-4 gap-6 text-[#8b949e]">
                  <FileCode className="w-5 h-5 hover:text-[#f0f6fc] transition cursor-pointer" />
                  <Search className="w-5 h-5 hover:text-[#f0f6fc] transition cursor-pointer" />
                  <GitBranch className="w-5 h-5 hover:text-[#f0f6fc] transition cursor-pointer" />
                  <Play className="w-5 h-5 hover:text-[#f0f6fc] transition cursor-pointer" />
                  <Layers className="w-5 h-5 hover:text-[#f0f6fc] transition cursor-pointer" />
                  {/* Glowing Active AlgoPulse Sidebar Icon */}
                  <div className="p-2 rounded-xl bg-[#4285F4]/20 text-[#4285F4] border border-[#4285F4]/40 shadow-md shadow-[#4285F4]/20 relative">
                    <Zap className="w-5 h-5 fill-[#FBBC05] text-[#FBBC05]" />
                    <span className="absolute -left-[9px] top-2 bottom-2 w-1 bg-[#4285F4] rounded-r" />
                  </div>
                </div>

                {/* 2. VS Code Active Editor Buffer */}
                <div className="md:col-span-6 bg-[#090d16] p-4 flex flex-col justify-between border-r border-[#30363d]">
                  <div className="space-y-3">
                    {/* Tab Bar & Breadcrumbs */}
                    <div className="flex items-center justify-between pb-2 border-b border-[#21262d]">
                      <div className="flex items-center gap-2 px-3 py-1 bg-[#161b22] border-t-2 border-[#4285F4] rounded-t text-xs font-mono text-[#f0f6fc]">
                        <FileCode className="w-3.5 h-3.5 text-[#34A853]" />
                        <span>solution.py</span>
                      </div>
                      <span className="text-[10px] text-[#8b949e] font-mono">
                        workspace &gt; algorithms &gt; solution.py
                      </span>
                    </div>

                    {/* Syntax Code Buffer */}
                    <div className="relative">
                      {codeInserted && (
                        <div className="absolute top-2 right-2 px-3 py-1 rounded-lg bg-[#34A853]/20 border border-[#34A853] text-[#34A853] text-[11px] font-mono animate-in fade-in">
                          &check; Optimal code inserted into active buffer!
                        </div>
                      )}

                      <pre className="font-mono text-xs text-[#c9d1d9] leading-relaxed select-all">
                        {demoApproach === 'optimal'
                          ? `1   class Solution:
2       def twoSum(self, nums: List[int], target: int) -> List[int]:
3           # [AlgoPulse Optimal O(N) Hash Table - Inserted!]
4           lookup = {}
5           for index, val in enumerate(nums):
6               diff = target - val
7               if diff in lookup:
8                   return [lookup[diff], index]
9               lookup[val] = index
10          return []`
                          : `1   class Solution:
2       def twoSum(self, nums: List[int], target: int) -> List[int]:
3           # [Suboptimal O(N²) Quadratic Brute Force]
4           n = len(nums)
5           for i in range(n):
6               for j in range(i + 1, n):
7                   if nums[i] + nums[j] == target:
8                       return [i, j]
9           return []`}
                      </pre>
                    </div>
                  </div>

                  {/* Bottom Editor Shortcut Pill */}
                  <div className="pt-4 border-t border-[#21262d] flex items-center justify-between text-[11px] text-[#8b949e]">
                    <span>Hit <kbd className="px-1.5 py-0.5 rounded bg-[#21262d] text-[#f0f6fc] font-mono">Ctrl+Alt+A</kbd> to analyze</span>
                    <span className="text-[#34A853]">Python 3.11 &bull; UTF-8</span>
                  </div>
                </div>

                {/* 3. VS Code Activity Bar Webview Panel (AlgoPulse Sidepane) */}
                <div className="md:col-span-5 bg-[#161b22] p-5 flex flex-col justify-between space-y-4">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between pb-3 border-b border-[#30363d]">
                      <div className="flex items-center gap-2">
                        <Zap className="w-4 h-4 text-[#FBBC05] fill-[#FBBC05]" />
                        <span className="text-xs font-bold text-[#f0f6fc] tracking-wider uppercase">
                          AlgoPulse Webview
                        </span>
                      </div>
                      <button
                        onClick={() => triggerMockAnalysis('VS Code Extension')}
                        disabled={isAnalyzing}
                        className="px-2 py-1 rounded text-[10px] font-mono bg-[#4285F4]/15 hover:bg-[#4285F4]/30 text-[#4285F4] border border-[#4285F4]/30 transition flex items-center gap-1 cursor-pointer"
                        title="Re-run analysis for active editor"
                      >
                        <RefreshCw className={`w-3 h-3 ${isAnalyzing ? 'animate-spin' : ''}`} />
                        <span>Run Ctrl+Alt+A</span>
                      </button>
                    </div>

                    {/* Score Overview */}
                    <div className="p-3.5 rounded-xl bg-[#0d1117] border border-[#30363d] space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-[#8b949e]">Approach Score:</span>
                        <span
                          className={`text-xl font-black ${
                            demoApproach === 'optimal' ? 'text-[#34A853]' : 'text-[#FBBC05]'
                          }`}
                        >
                          {demoApproach === 'optimal' ? '100 / 100' : '42 / 100'}
                        </span>
                      </div>
                      <div className="text-[11px] text-[#8b949e] flex justify-between">
                        <span>Time: {demoApproach === 'optimal' ? 'O(N) Linear' : 'O(N²) Quadratic'}</span>
                        <span>Space: {demoApproach === 'optimal' ? 'O(N) Hash Map' : 'O(1) Auxiliary'}</span>
                      </div>
                    </div>

                    {/* 4 Pillars Breakdown Bars */}
                    <div className="space-y-2 text-xs">
                      <div>
                        <div className="flex justify-between text-[#8b949e] mb-1">
                          <span>Algorithmic Optimality</span>
                          <span className="text-[#f0f6fc] font-mono">
                            {demoApproach === 'optimal' ? '35/35' : '15/35'}
                          </span>
                        </div>
                        <div className="h-1.5 w-full bg-[#21262d] rounded-full overflow-hidden">
                          <div
                            className="h-full bg-[#4285F4] rounded-full transition-all duration-500"
                            style={{ width: demoApproach === 'optimal' ? '100%' : '42%' }}
                          />
                        </div>
                      </div>

                      <div>
                        <div className="flex justify-between text-[#8b949e] mb-1">
                          <span>Time Big-O Complexity</span>
                          <span className="text-[#f0f6fc] font-mono">
                            {demoApproach === 'optimal' ? '25/25' : '8/25'}
                          </span>
                        </div>
                        <div className="h-1.5 w-full bg-[#21262d] rounded-full overflow-hidden">
                          <div
                            className="h-full bg-[#34A853] rounded-full transition-all duration-500"
                            style={{ width: demoApproach === 'optimal' ? '100%' : '32%' }}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Progressive Hints Tabs in VS Code */}
                    <div className="space-y-1.5 pt-1">
                      <div className="flex items-center justify-between text-[11px] text-[#8b949e]">
                        <span className="font-semibold text-[#f0f6fc]">Progressive Guidance</span>
                        <span>Tier {selectedHint}</span>
                      </div>
                      <div className="grid grid-cols-3 gap-1">
                        {[1, 2, 3].map((tier) => (
                          <button
                            key={tier}
                            onClick={() => setSelectedHint(tier)}
                            className={`py-1 rounded text-[10px] font-medium transition cursor-pointer ${
                              selectedHint === tier
                                ? 'bg-[#4285F4] text-white'
                                : 'bg-[#0d1117] text-[#8b949e] hover:text-[#f0f6fc]'
                            }`}
                          >
                            Tier {tier}
                          </button>
                        ))}
                      </div>
                      <div className="p-2 rounded bg-[#0d1117] border border-[#30363d] text-[11px] text-[#c9d1d9] leading-relaxed">
                        {selectedHint === 1 && '💡 Invariant: Notice that target - num must already exist in our previous seen set.'}
                        {selectedHint === 2 && '💡 Data Structure: A dictionary provides O(1) amortized lookup to eliminate nested loops.'}
                        {selectedHint === 3 && '💡 Implementation: Return [lookup[diff], i] when the complement is found.'}
                      </div>
                    </div>

                    {/* VS Code Special Action Buttons */}
                    <div className="pt-2 flex items-center gap-2">
                      <button
                        onClick={handleInsertCode}
                        className="flex-1 py-2 px-3 rounded-xl bg-[#34A853] hover:bg-[#2e944b] text-white text-xs font-semibold shadow-md shadow-[#34A853]/25 transition flex items-center justify-center gap-1.5 cursor-pointer active:scale-95"
                      >
                        <CheckCheck className="w-3.5 h-3.5" />
                        <span>Insert Optimal Code</span>
                      </button>

                      {demoApproach === 'optimal' && (
                        <button
                          onClick={handleResetVsCode}
                          className="py-2 px-2.5 rounded-xl bg-[#21262d] hover:bg-[#30363d] text-[#8b949e] hover:text-[#f0f6fc] border border-[#30363d] text-xs font-medium transition flex items-center gap-1 cursor-pointer"
                          title="Reset editor buffer to suboptimal"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                          <span>Reset</span>
                        </button>
                      )}
                    </div>
                  </div>

                  {/* VS Code Status Footnote */}
                  <div className="p-2.5 rounded-lg bg-[#0d1117] border border-[#30363d] text-[11px] text-[#8b949e] flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-[#34A853]" />
                      <span>Synced to Supabase Profile</span>
                    </span>
                    <span className="font-mono text-[10px]">v1.0.0</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* HOW IT WORKS SECTION (5 SEAMLESS STEPS) */}
        <div className="space-y-10">
          <div className="text-center space-y-2">
            <span className="text-xs uppercase font-extrabold tracking-widest text-[#4285F4]">
              Unified Architecture
            </span>
            <h2 className="text-3xl font-bold tracking-tight text-[#f0f6fc]">
              How AlgoPulse Works in 5 Steps
            </h2>
            <p className="text-sm text-[#8b949e] max-w-xl mx-auto">
              From coding in your browser or desktop IDE to real-time sync with your mastery heatmap.
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
                Load the Chrome Extension or VS Code Extension, then paste your personal token below.
              </p>
            </div>

            {/* Step 2 */}
            <div className="p-5 rounded-2xl bg-[#161b22] border border-[#30363d] relative hover:border-[#EA4335] transition group">
              <div className="w-8 h-8 rounded-xl bg-[#EA4335]/15 border border-[#EA4335]/30 text-[#EA4335] font-bold text-sm flex items-center justify-center mb-3">
                2
              </div>
              <h3 className="text-sm font-bold text-[#f0f6fc] group-hover:text-[#EA4335] transition">
                Solve Anywhere
              </h3>
              <p className="text-xs text-[#8b949e] mt-2 leading-relaxed">
                Work on LeetCode, GeeksforGeeks, HackerRank, or any local source file in VS Code.
              </p>
            </div>

            {/* Step 3 */}
            <div className="p-5 rounded-2xl bg-[#161b22] border border-[#30363d] relative hover:border-[#FBBC05] transition group">
              <div className="w-8 h-8 rounded-xl bg-[#FBBC05]/15 border border-[#FBBC05]/30 text-[#FBBC05] font-bold text-sm flex items-center justify-center mb-3">
                3
              </div>
              <h3 className="text-sm font-bold text-[#f0f6fc] group-hover:text-[#FBBC05] transition">
                Trigger AI Review
              </h3>
              <p className="text-xs text-[#8b949e] mt-2 leading-relaxed">
                Click &quot;Analyze Code&quot; in the browser or hit <kbd className="px-1 py-0.5 rounded bg-[#21262d] text-[#f0f6fc] font-mono text-[10px]">Ctrl+Alt+A</kbd> in VS Code.
              </p>
            </div>

            {/* Step 4 */}
            <div className="p-5 rounded-2xl bg-[#161b22] border border-[#30363d] relative hover:border-[#34A853] transition group">
              <div className="w-8 h-8 rounded-xl bg-[#34A853]/15 border border-[#34A853]/30 text-[#34A853] font-bold text-sm flex items-center justify-center mb-3">
                4
              </div>
              <h3 className="text-sm font-bold text-[#f0f6fc] group-hover:text-[#34A853] transition">
                4-Pillar Score & Hints
              </h3>
              <p className="text-xs text-[#8b949e] mt-2 leading-relaxed">
                Get approach optimality, Big-O comparison, 3-tier progressive hints, and optimal code.
              </p>
            </div>

            {/* Step 5 */}
            <div className="p-5 rounded-2xl bg-[#161b22] border border-[#30363d] relative hover:border-[#4285F4] transition group">
              <div className="w-8 h-8 rounded-xl bg-[#4285F4]/15 border border-[#4285F4]/30 text-[#4285F4] font-bold text-sm flex items-center justify-center mb-3">
                5
              </div>
              <h3 className="text-sm font-bold text-[#f0f6fc] group-hover:text-[#4285F4] transition">
                Live Cloud Sync
              </h3>
              <p className="text-xs text-[#8b949e] mt-2 leading-relaxed">
                Submissions stream instantly to your dashboard, updating streaks and heatmap live.
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
              Works Across Your Preferred Environments
            </h2>
            <p className="text-sm text-[#8b949e] max-w-xl mx-auto">
              Engineered to operate seamlessly wherever you practice competitive programming and technical interview algorithms.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {/* LeetCode Card */}
            <div className="p-6 rounded-2xl bg-[#161b22] border border-[#30363d] hover:border-[#FBBC05]/60 transition space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-base font-bold text-[#f0f6fc]">LeetCode</span>
                <span className="px-2 py-0.5 rounded bg-[#FBBC05]/15 text-[#FBBC05] border border-[#FBBC05]/30 text-[10px] font-semibold">
                  Monaco Engine
                </span>
              </div>
              <p className="text-xs text-[#8b949e] leading-relaxed">
                Deep bridge into Monaco internal model. Supports full problem context, testcase separation, dynamic slug and difficulty extraction.
              </p>
              <div className="pt-1 flex items-center gap-1.5 text-xs text-[#34A853]">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span className="text-[11px]">leetcode.com/*</span>
              </div>
            </div>

            {/* GeeksforGeeks Card */}
            <div className="p-6 rounded-2xl bg-[#161b22] border border-[#30363d] hover:border-[#34A853]/60 transition space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-base font-bold text-[#f0f6fc]">GeeksforGeeks</span>
                <span className="px-2 py-0.5 rounded bg-[#34A853]/15 text-[#34A853] border border-[#34A853]/30 text-[10px] font-semibold">
                  Ace & CodeMirror
                </span>
              </div>
              <p className="text-xs text-[#8b949e] leading-relaxed">
                Full compatibility with GFG practice portal. Injects into Ace and CodeMirror instances with automatic topic and tag recognition.
              </p>
              <div className="pt-1 flex items-center gap-1.5 text-xs text-[#34A853]">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span className="text-[11px]">geeksforgeeks.org/*</span>
              </div>
            </div>

            {/* HackerRank Card */}
            <div className="p-6 rounded-2xl bg-[#161b22] border border-[#30363d] hover:border-[#4285F4]/60 transition space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-base font-bold text-[#f0f6fc]">HackerRank</span>
                <span className="px-2 py-0.5 rounded bg-[#4285F4]/15 text-[#4285F4] border border-[#4285F4]/30 text-[10px] font-semibold">
                  Challenges
                </span>
              </div>
              <p className="text-xs text-[#8b949e] leading-relaxed">
                Automated challenge title, problem statement, and solution extraction from HackerRank interview preparation kits.
              </p>
              <div className="pt-1 flex items-center gap-1.5 text-xs text-[#34A853]">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span className="text-[11px]">hackerrank.com/*</span>
              </div>
            </div>

            {/* VS Code Card */}
            <div className="p-6 rounded-2xl bg-[#161b22] border border-[#30363d] hover:border-[#EA4335]/60 transition space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-base font-bold text-[#f0f6fc]">VS Code Desktop</span>
                <span className="px-2 py-0.5 rounded bg-[#EA4335]/15 text-[#EA4335] border border-[#EA4335]/30 text-[10px] font-semibold">
                  Desktop IDE
                </span>
              </div>
              <p className="text-xs text-[#8b949e] leading-relaxed">
                Native VS Code extension with Activity Bar webview, Ctrl+Alt+A keyboard shortcut, and 1-click &quot;Insert in Editor&quot;.
              </p>
              <div className="pt-1 flex items-center gap-1.5 text-xs text-[#34A853]">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span className="text-[11px]">VSIX Packaged</span>
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
              Everything you need to know about the extension, AI scoring rubric, and live sync.
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

        {/* ========================================================================= */}
        {/* GET STARTED: TOKEN, DASHBOARD & SUBMISSIONS (TRANSITION SECTION)          */}
        {/* ========================================================================= */}
        <div className="rounded-3xl bg-[#161b22] border border-[#30363d] p-8 sm:p-12 space-y-8 relative overflow-hidden shadow-2xl">
          <div className="absolute top-0 left-0 right-0 h-1 google-gradient-bar" />

          <div className="text-center space-y-2 max-w-2xl mx-auto">
            <span className="text-xs uppercase font-extrabold tracking-widest text-[#4285F4]">
              Start Coding with Intelligence
            </span>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-[#f0f6fc] tracking-tight">
              Get Your Token, Dashboard &amp; Submissions
            </h2>
            <p className="text-xs sm:text-sm text-[#8b949e] leading-relaxed">
              Copy your personal sync token to connect your extensions, then explore your live dashboard and submission archive.
            </p>
          </div>

          {/* 3 Unified Action Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
            {/* Card 1: Your Extension Token */}
            <div className="p-5 rounded-2xl bg-[#0d1117] border border-[#30363d] space-y-3 flex flex-col justify-between hover:border-[#FBBC05]/60 transition">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="p-2 rounded-xl bg-[#FBBC05]/15 text-[#FBBC05] border border-[#FBBC05]/30">
                    <Key className="w-4 h-4" />
                  </div>
                  <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-[#21262d] text-[#FBBC05]">
                    Personal Secret
                  </span>
                </div>
                <h3 className="text-sm font-bold text-[#f0f6fc]">Extension Sync Token</h3>
                <p className="text-xs text-[#8b949e] leading-relaxed">
                  Paste this token once into your Chrome Extension popup or VS Code settings to link all evaluations.
                </p>
                <div className="p-2.5 rounded-lg bg-[#161b22] border border-[#30363d] font-mono text-[11px] text-[#f0f6fc] truncate select-all">
                  {token}
                </div>
              </div>

              <div className="pt-2 flex items-center gap-2">
                <button
                  onClick={handleCopyToken}
                  className="flex-1 py-2 px-3 rounded-xl bg-[#21262d] hover:bg-[#30363d] text-[#f0f6fc] border border-[#30363d] text-xs font-semibold transition flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  {copiedToken ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-[#34A853]" />
                      <span className="text-[#34A853]">Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5 text-[#8b949e]" />
                      <span>Copy Token</span>
                    </>
                  )}
                </button>
                <Link
                  href="/profile"
                  className="p-2 rounded-xl bg-[#21262d] hover:bg-[#30363d] text-[#8b949e] hover:text-[#f0f6fc] border border-[#30363d] text-xs font-medium transition"
                  title="Manage in Profile"
                >
                  <Shield className="w-4 h-4" />
                </Link>
              </div>
            </div>

            {/* Card 2: Live Analytics Dashboard */}
            <div className="p-5 rounded-2xl bg-[#0d1117] border border-[#30363d] space-y-3 flex flex-col justify-between hover:border-[#4285F4]/60 transition">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="p-2 rounded-xl bg-[#4285F4]/15 text-[#4285F4] border border-[#4285F4]/30">
                    <Activity className="w-4 h-4" />
                  </div>
                  <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-[#21262d] text-[#4285F4]">
                    Real-Time Polling
                  </span>
                </div>
                <h3 className="text-sm font-bold text-[#f0f6fc]">Analytics Dashboard</h3>
                <p className="text-xs text-[#8b949e] leading-relaxed">
                  Track your 16-week submission heatmap, active streaks, Big-O benchmark progression, and difficulty split.
                </p>
                <div className="p-2.5 rounded-lg bg-[#161b22] border border-[#30363d] text-[11px] text-[#8b949e] flex items-center justify-between">
                  <span>Heatmap &bull; Streaks</span>
                  <span className="text-[#34A853] font-medium">Auto-refresh 5s</span>
                </div>
              </div>

              <div className="pt-2">
                <Link
                  href="/dashboard"
                  className="w-full py-2 px-3 rounded-xl bg-[#4285F4] hover:bg-[#3367D6] text-white text-xs font-semibold shadow-md shadow-[#4285F4]/30 transition flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>Launch Live Dashboard</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>

            {/* Card 3: Submissions History */}
            <div className="p-5 rounded-2xl bg-[#0d1117] border border-[#30363d] space-y-3 flex flex-col justify-between hover:border-[#34A853]/60 transition">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="p-2 rounded-xl bg-[#34A853]/15 text-[#34A853] border border-[#34A853]/30">
                    <Code2 className="w-4 h-4" />
                  </div>
                  <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-[#21262d] text-[#34A853]">
                    Full Archive
                  </span>
                </div>
                <h3 className="text-sm font-bold text-[#f0f6fc]">Submission Archive</h3>
                <p className="text-xs text-[#8b949e] leading-relaxed">
                  Inspect every evaluated code problem with side-by-side code diffs, AI feedback, and optimal solution benchmarks.
                </p>
                <div className="p-2.5 rounded-lg bg-[#161b22] border border-[#30363d] text-[11px] text-[#8b949e] flex items-center justify-between">
                  <span>LeetCode, GFG &amp; VS Code</span>
                  <span className="text-[#FBBC05] font-medium">Historical Log</span>
                </div>
              </div>

              <div className="pt-2">
                <Link
                  href="/submissions"
                  className="w-full py-2 px-3 rounded-xl bg-[#21262d] hover:bg-[#30363d] text-[#c9d1d9] hover:text-[#f0f6fc] border border-[#30363d] text-xs font-semibold transition flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Code2 className="w-3.5 h-3.5 text-[#34A853]" />
                  <span>Browse Submissions</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
