import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  X,
  ChevronRight,
  CheckCircle,
  AlertCircle,
  Copy,
  RefreshCw,
  Eye,
  Zap,
  Award,
  Code2
} from 'lucide-react';
import { ProblemMetadata, AIAnalysisResult } from '../types';
import { extractCurrentProblemContext } from './extractor';

export const AlgoPulseOverlay: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [context, setContext] = useState<ProblemMetadata | null>(null);
  const [result, setResult] = useState<AIAnalysisResult | null>(null);
  const [syncStatus, setSyncStatus] = useState<{ synced: boolean; message: string } | null>(null);
  const [copied, setCopied] = useState(false);
  const [unlockedHints, setUnlockedHints] = useState<number>(0);
  const [showOptimalCode, setShowOptimalCode] = useState(false);

  // Refresh context when opening
  useEffect(() => {
    if (isOpen) {
      extractCurrentProblemContext().then(setContext);
    }
  }, [isOpen]);

  const handleAnalyze = async () => {
    setLoading(true);
    setError(null);
    setSyncStatus(null);
    setUnlockedHints(0);
    setShowOptimalCode(false);

    try {
      const currentContext = await extractCurrentProblemContext();
      setContext(currentContext);

      if (!currentContext.code || currentContext.code.trim().length < 5) {
        throw new Error('No code detected in editor. Please write some code in LeetCode before analyzing.');
      }

      const response: any = await new Promise((resolve) => {
        chrome.runtime.sendMessage(
          {
            type: 'ANALYZE_AND_EVALUATE',
            payload: currentContext
          },
          (res) => resolve(res)
        );
      });

      if (!response || !response.success) {
        throw new Error(response?.message || 'Failed to analyze code. Please check your Gemini API key in extension settings.');
      }

      setResult(response.analysis);
      if (response.syncStatus) {
        setSyncStatus(response.syncStatus);
      }
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  const copyOptimalCode = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (result?.optimal_code) {
      navigator.clipboard.writeText(result.optimal_code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-emerald-400 border-emerald-500/30 bg-emerald-950/40';
    if (score >= 60) return 'text-amber-400 border-amber-500/30 bg-amber-950/40';
    return 'text-rose-400 border-rose-500/30 bg-rose-950/40';
  };

  const getDifficultyBadge = (difficulty: string) => {
    const d = difficulty.toLowerCase();
    if (d === 'easy') return 'bg-emerald-950 text-emerald-300 border border-emerald-800';
    if (d === 'medium') return 'bg-amber-950 text-amber-300 border border-amber-800';
    if (d === 'hard') return 'bg-rose-950 text-rose-300 border border-rose-800';
    return 'bg-slate-800 text-slate-300 border border-slate-700';
  };

  return (
    <div className="algopulse-root font-sans antialiased text-slate-100">
      {/* Floating Action Trigger Button */}
      {!isOpen && (
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-[999999] flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-indigo-600 via-indigo-700 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-medium text-sm rounded-full shadow-2xl hover:shadow-indigo-500/30 transition-all duration-200 transform hover:-translate-y-0.5 border border-indigo-400/30 cursor-pointer"
          title="Open AlgoPulse AI Reviewer"
        >
          <Sparkles className="w-4 h-4 text-amber-300 animate-pulse" />
          <span>AlgoPulse Review</span>
        </button>
      )}

      {/* Slide-over Drawer - Guaranteed Dark Theme */}
      {isOpen && (
        <div className="fixed inset-y-0 right-0 z-[999999] w-full max-w-md bg-slate-900 text-slate-100 shadow-2xl border-l border-slate-800 flex flex-col h-full animate-in slide-in-from-right duration-200">
          {/* Header */}
          <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-indigo-600 text-white shadow-md shadow-indigo-600/30">
                <Zap className="w-4 h-4 text-amber-300" />
              </div>
              <div>
                <h2 className="font-bold text-sm tracking-tight text-white flex items-center gap-2">
                  AlgoPulse AI
                  <span className="text-[10px] uppercase font-semibold px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                    Pro
                  </span>
                </h2>
                <p className="text-xs text-slate-400">
                  {context?.title || 'LeetCode Problem'}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body Content */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {/* Context Card */}
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <span className={`px-2 py-0.5 rounded-full font-medium ${getDifficultyBadge(context?.difficulty || 'Medium')}`}>
                  {context?.difficulty || 'Medium'}
                </span>
                <span className="text-slate-400 font-mono">
                  {context?.language || 'python3'}
                </span>
              </div>
              <button
                type="button"
                onClick={handleAnalyze}
                disabled={loading}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white font-medium rounded-lg shadow-md shadow-indigo-600/20 transition disabled:opacity-50 cursor-pointer"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
                <span>{loading ? 'Evaluating...' : 'Analyze Code'}</span>
              </button>
            </div>

            {/* Error Message */}
            {error && (
              <div className="p-3.5 rounded-xl bg-rose-950/60 border border-rose-800/80 text-rose-300 text-xs flex gap-2.5">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-rose-200">Analysis Failed</p>
                  <p className="mt-0.5 leading-relaxed">{error}</p>
                </div>
              </div>
            )}

            {/* Initial Placeholder */}
            {!result && !loading && !error && (
              <div className="py-12 px-4 text-center space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-indigo-600/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center mx-auto">
                  <Sparkles className="w-6 h-6 text-indigo-400" />
                </div>
                <h3 className="font-semibold text-white text-sm">
                  Ready to evaluate your solution
                </h3>
                <p className="text-xs text-slate-400 max-w-xs mx-auto leading-relaxed">
                  Write your code in the LeetCode editor and click "Analyze Code" above. AlgoPulse will evaluate your Big-O complexities, score your approach, and sync with your dashboard.
                </p>
              </div>
            )}

            {/* Loading State */}
            {loading && (
              <div className="py-16 text-center space-y-4">
                <div className="relative w-12 h-12 mx-auto">
                  <div className="w-12 h-12 rounded-full border-2 border-indigo-900 border-t-indigo-500 animate-spin" />
                  <Sparkles className="w-5 h-5 text-indigo-400 absolute inset-0 m-auto animate-pulse" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">
                    Evaluating Code with Gemini AI...
                  </p>
                  <p className="text-xs text-slate-400 mt-1">
                    Calculating Big-O complexities and testing optimality rubric
                  </p>
                </div>
              </div>
            )}

            {/* Analysis Results */}
            {result && !loading && (
              <div className="space-y-4">
                {/* Score Banner */}
                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 shadow-sm flex items-center justify-between">
                  <div>
                    <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                      Overall Score
                    </span>
                    <div className="flex items-baseline gap-1 mt-0.5">
                      <span className="text-3xl font-extrabold text-white">
                        {result.score}
                      </span>
                      <span className="text-xs text-slate-400">/ 100</span>
                    </div>
                  </div>
                  <div className={`px-3 py-1.5 rounded-lg border font-semibold text-xs flex items-center gap-1.5 ${getScoreColor(result.score)}`}>
                    <Award className="w-4 h-4" />
                    <span>{result.score >= 80 ? 'Optimal' : result.score >= 60 ? 'Acceptable' : 'Needs Optimization'}</span>
                  </div>
                </div>

                {/* Rubric Breakdown */}
                <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2.5 text-xs">
                  <h4 className="font-semibold text-white">
                    Rubric Breakdown
                  </h4>
                  <div className="space-y-2">
                    <div>
                      <div className="flex justify-between text-[11px] mb-1">
                        <span className="text-slate-400">Algorithmic Optimality</span>
                        <span className="font-semibold text-slate-200">{result.scoring_breakdown.optimality} / 35</span>
                      </div>
                      <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                        <div
                          className="bg-indigo-500 h-full rounded-full transition-all duration-500"
                          style={{ width: `${(result.scoring_breakdown.optimality / 35) * 100}%` }}
                        />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-[11px] mb-1">
                        <span className="text-slate-400">Time Complexity</span>
                        <span className="font-semibold text-slate-200">{result.scoring_breakdown.time_complexity} / 25</span>
                      </div>
                      <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                        <div
                          className="bg-blue-500 h-full rounded-full transition-all duration-500"
                          style={{ width: `${(result.scoring_breakdown.time_complexity / 25) * 100}%` }}
                        />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-[11px] mb-1">
                        <span className="text-slate-400">Space Complexity</span>
                        <span className="font-semibold text-slate-200">{result.scoring_breakdown.space_complexity} / 20</span>
                      </div>
                      <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                        <div
                          className="bg-teal-500 h-full rounded-full transition-all duration-500"
                          style={{ width: `${(result.scoring_breakdown.space_complexity / 20) * 100}%` }}
                        />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-[11px] mb-1">
                        <span className="text-slate-400">Cleanliness & Style</span>
                        <span className="font-semibold text-slate-200">{result.scoring_breakdown.cleanliness} / 20</span>
                      </div>
                      <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                        <div
                          className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                          style={{ width: `${(result.scoring_breakdown.cleanliness / 20) * 100}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Complexity Benchmark Comparison Card */}
                <div className="p-3.5 rounded-xl border border-slate-800 bg-slate-950 space-y-2 text-xs">
                  <h4 className="font-semibold text-white">
                    Complexity Comparison
                  </h4>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                      <span className="text-[10px] text-slate-400 uppercase font-semibold">Your Approach</span>
                      <p className="mt-1 font-mono font-bold text-white text-sm">
                        {result.user_approach.time_complexity}
                      </p>
                      <p className="text-[11px] text-slate-400">Space: {result.user_approach.space_complexity}</p>
                    </div>
                    <div className="p-2.5 rounded-lg bg-indigo-950/40 border border-indigo-800/60">
                      <span className="text-[10px] text-indigo-400 uppercase font-semibold">Optimal Approach</span>
                      <p className="mt-1 font-mono font-bold text-indigo-300 text-sm">
                        {result.best_approach.time_complexity}
                      </p>
                      <p className="text-[11px] text-indigo-400">Space: {result.best_approach.space_complexity}</p>
                    </div>
                  </div>
                  <p className="text-[11px] text-slate-300 mt-1 italic leading-relaxed">
                    {result.best_approach.explanation}
                  </p>
                </div>

                {/* Progressive Hints Section */}
                <div className="p-3.5 rounded-xl border border-slate-800 bg-slate-950 space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <h4 className="font-semibold text-white flex items-center gap-1.5">
                      <Eye className="w-3.5 h-3.5 text-indigo-400" />
                      Progressive Hints
                    </h4>
                    <span className="text-[10px] text-slate-400">
                      {unlockedHints} of 3 revealed
                    </span>
                  </div>

                  <div className="space-y-1.5">
                    {result.hints.map((hint, idx) => {
                      const isUnlocked = idx < unlockedHints;
                      return (
                        <div
                          key={idx}
                          className={`p-2.5 rounded-lg border text-[11px] transition ${
                            isUnlocked
                              ? 'bg-slate-900 border-slate-700/80 text-slate-200'
                              : 'bg-slate-950 border-dashed border-slate-800 text-slate-500'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-semibold text-slate-300">
                              Tier {idx + 1}: {idx === 0 ? 'Observation' : idx === 1 ? 'Pattern Hint' : 'Strategy'}
                            </span>
                            {!isUnlocked && idx === unlockedHints && (
                              <button
                                type="button"
                                onClick={() => setUnlockedHints(idx + 1)}
                                className="text-[10px] font-semibold text-indigo-400 hover:text-indigo-300 cursor-pointer"
                              >
                                Reveal Hint
                              </button>
                            )}
                          </div>
                          {isUnlocked ? (
                            <p className="mt-1 text-slate-200 leading-relaxed">{hint}</p>
                          ) : (
                            <p className="mt-1 text-slate-500 italic">Locked. Click reveal when stuck.</p>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Suggested Improvements */}
                {result.improvements && result.improvements.length > 0 && (
                  <div className="p-3.5 rounded-xl border border-slate-800 bg-slate-950 space-y-2 text-xs">
                    <h4 className="font-semibold text-white">
                      Suggested Improvements
                    </h4>
                    <ul className="space-y-1.5">
                      {result.improvements.map((imp, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-[11px] text-slate-300">
                          <ChevronRight className="w-3.5 h-3.5 text-indigo-400 shrink-0 mt-0.5" />
                          <span>{imp}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Optimal Code Reference Snippet - Fixed Toggle and Clean Syntax Box */}
                <div className="p-3.5 rounded-xl border border-slate-800 bg-slate-950 space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <h4 className="font-semibold text-white flex items-center gap-1.5">
                      <Code2 className="w-4 h-4 text-indigo-400" />
                      Optimal Code Reference
                    </h4>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowOptimalCode(!showOptimalCode);
                      }}
                      className="px-2.5 py-1 rounded bg-slate-900 hover:bg-slate-800 border border-slate-700 text-[11px] text-indigo-300 font-semibold transition cursor-pointer"
                    >
                      {showOptimalCode ? 'Hide Code' : 'View Code'}
                    </button>
                  </div>

                  {showOptimalCode && (
                    <div className="relative mt-2 rounded-xl overflow-hidden border border-slate-800 bg-slate-950">
                      <div className="p-2 bg-slate-900 border-b border-slate-800 flex items-center justify-between text-[10px] text-slate-400">
                        <span className="font-mono text-indigo-300">{context?.language || 'python3'}</span>
                        <button
                          type="button"
                          onClick={copyOptimalCode}
                          className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 transition flex items-center gap-1 cursor-pointer"
                        >
                          <Copy className="w-3 h-3" />
                          <span>{copied ? 'Copied!' : 'Copy Code'}</span>
                        </button>
                      </div>
                      <pre className="p-3 bg-slate-950 text-emerald-300 font-mono text-[11px] overflow-x-auto max-h-64 leading-relaxed whitespace-pre m-0">
                        <code>{result.optimal_code || '// No code snippet returned'}</code>
                      </pre>
                    </div>
                  )}
                </div>

                {/* Sync Status Banner */}
                {syncStatus && (
                  <div
                    className={`p-3 rounded-xl border text-xs flex items-center justify-between ${
                      syncStatus.synced
                        ? 'bg-emerald-950/40 border-emerald-800/80 text-emerald-300'
                        : 'bg-slate-950 border-slate-800 text-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 shrink-0 text-emerald-400" />
                      <span>{syncStatus.message}</span>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="p-3 border-t border-slate-800 bg-slate-950 flex items-center justify-between text-xs text-slate-500">
            <span>Powered by Gemini Flash</span>
            <span className="font-mono text-[10px]">AlgoPulse v1.0</span>
          </div>
        </div>
      )}
    </div>
  );
};
