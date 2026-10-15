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

const AlgoPulseOverlayInner: React.FC = () => {
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

      if (!window.chrome?.runtime?.id) {
        throw new Error('Extension was recently reloaded in Chrome. Please refresh this page (F5) to reconnect.');
      }

      const response: any = await new Promise((resolve, reject) => {
        try {
          chrome.runtime.sendMessage(
            {
              type: 'ANALYZE_AND_EVALUATE',
              payload: currentContext
            },
            (res) => {
              if (chrome.runtime?.lastError) {
                const msg = chrome.runtime.lastError.message || '';
                if (msg.toLowerCase().includes('context invalidated')) {
                  return reject(new Error('Extension was recently reloaded in Chrome. Please refresh this page (F5) to reconnect.'));
                }
                return reject(new Error(msg));
              }
              resolve(res);
            }
          );
        } catch (callErr: any) {
          if (callErr?.message?.toLowerCase().includes('context invalidated')) {
            reject(new Error('Extension was recently reloaded in Chrome. Please refresh this page (F5) to reconnect.'));
          } else {
            reject(callErr);
          }
        }
      });

      if (!response?.success) {
        throw new Error(response?.error || response?.message || 'Failed to complete code review analysis.');
      }

      setResult(response.result || response.analysis);

      if (response.syncResult?.success || response.syncStatus?.synced) {
        setSyncStatus({ synced: true, message: 'Successfully synced to dashboard!' });
      } else if (response.syncResult?.skipped) {
        setSyncStatus({ synced: false, message: 'Sync disabled or dashboard token missing.' });
      } else if (response.syncResult?.error || response.syncStatus?.message) {
        setSyncStatus({ synced: false, message: response.syncStatus?.message || `Sync warning: ${response.syncResult?.error}` });
      }
    } catch (err: any) {
      console.error('[AlgoPulse] Overlay Analysis Error:', err);
      const msg = err?.message || 'An unexpected error occurred during analysis.';
      if (msg.toLowerCase().includes('context invalidated')) {
        setError('Extension was recently reloaded in Chrome. Please refresh this page (F5) to reconnect.');
      } else {
        setError(msg);
      }
    } finally {
      setLoading(false);
    }
  };

  const copyOptimalCode = () => {
    if (result?.optimal_code) {
      navigator.clipboard.writeText(result.optimal_code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-[#34A853] border-[#34A853]/30 bg-[#34A853]/15';
    if (score >= 60) return 'text-[#FBBC05] border-[#FBBC05]/30 bg-[#FBBC05]/15';
    return 'text-[#EA4335] border-[#EA4335]/30 bg-[#EA4335]/15';
  };

  const getDifficultyBadge = (difficulty: string) => {
    const d = difficulty.toLowerCase();
    if (d === 'easy') return 'bg-[#34A853]/15 text-[#34A853] border border-[#34A853]/30';
    if (d === 'medium') return 'bg-[#FBBC05]/15 text-[#FBBC05] border border-[#FBBC05]/30';
    if (d === 'hard') return 'bg-[#EA4335]/15 text-[#EA4335] border border-[#EA4335]/30';
    return 'bg-[#21262d] text-[#c9d1d9] border border-[#30363d]';
  };

  return (
    <div className="algopulse-root font-sans antialiased text-[#c9d1d9]">
      {/* Floating Action Trigger Button - Professional GitHub Card Style with Google Accent */}
      {!isOpen && (
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-[999999] flex items-center gap-2 px-4 py-2.5 bg-[#161b22] hover:bg-[#21262d] text-[#f0f6fc] font-medium text-xs rounded-full shadow-2xl transition-all duration-200 transform hover:-translate-y-0.5 border border-[#30363d] hover:border-[#4285F4] cursor-pointer group"
          title="Open AlgoPulse AI Reviewer"
        >
          <div className="w-2 h-2 rounded-full bg-[#4285F4] group-hover:scale-125 transition" />
          <Sparkles className="w-3.5 h-3.5 text-[#FBBC05] fill-[#FBBC05]" />
          <span className="font-semibold tracking-tight">AlgoPulse Review</span>
        </button>
      )}

      {/* Slide-over Drawer - GitHub Dark Canvas Theme */}
      {isOpen && (
        <div className="fixed inset-y-0 right-0 z-[999999] w-full max-w-md bg-[#0d1117] text-[#c9d1d9] shadow-2xl border-l border-[#30363d] flex flex-col h-full animate-in slide-in-from-right duration-200">
          {/* Google 4-Color Accent Line */}
          <div className="h-[2px] w-full google-gradient-bar shrink-0" />

          {/* Header */}
          <div className="p-4 border-b border-[#30363d] flex items-center justify-between bg-[#161b22]">
            <div className="flex items-center gap-2.5">
              <div className="p-1.5 rounded-lg bg-[#4285F4] text-white shadow-md shadow-[#4285F4]/20">
                <Zap className="w-4 h-4 text-[#FBBC05] fill-[#FBBC05]" />
              </div>
              <div>
                <h2 className="font-bold text-sm tracking-tight text-[#f0f6fc] flex items-center gap-1.5">
                  AlgoPulse AI
                  <span className="text-[10px] uppercase font-semibold px-1.5 py-0.5 rounded bg-[#21262d] text-[#4285F4] border border-[#30363d]">
                    Pro
                  </span>
                </h2>
                <p className="text-xs text-[#8b949e]">
                  {context?.title || 'LeetCode Problem'}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="p-1.5 rounded-lg text-[#8b949e] hover:text-[#f0f6fc] hover:bg-[#21262d] transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body Content */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {/* Context Card */}
            <div className="p-3 rounded-xl bg-[#161b22] border border-[#30363d] flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <span className={`px-2 py-0.5 rounded-full font-medium ${getDifficultyBadge(context?.difficulty || 'Medium')}`}>
                  {context?.difficulty || 'Medium'}
                </span>
                <span className="text-[#8b949e] font-mono">
                  {context?.language || 'python3'}
                </span>
              </div>
              <button
                type="button"
                onClick={handleAnalyze}
                disabled={loading}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-[#4285F4] hover:bg-[#3367D6] text-white font-medium rounded-lg shadow-sm shadow-[#4285F4]/30 transition disabled:opacity-50 cursor-pointer text-xs"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
                <span>{loading ? 'Evaluating...' : 'Analyze Code'}</span>
              </button>
            </div>

            {/* Error Message */}
            {error && (
              <div className="p-3.5 rounded-xl bg-[#EA4335]/15 border border-[#EA4335]/30 text-[#EA4335] text-xs flex gap-2.5">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="font-semibold text-[#f0f6fc]">Analysis Failed</p>
                  <p className="mt-0.5 leading-relaxed text-[#c9d1d9]">{error}</p>
                  {(error.toLowerCase().includes('reloaded') || error.toLowerCase().includes('refresh') || error.toLowerCase().includes('context invalidated')) && (
                    <button
                      type="button"
                      onClick={() => window.location.reload()}
                      className="mt-2.5 inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#4285F4] hover:bg-[#3367D6] text-white font-medium text-xs rounded-lg transition shadow-sm cursor-pointer"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      <span>Refresh Page (F5) to Reconnect</span>
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Initial Placeholder */}
            {!result && !loading && !error && (
              <div className="py-12 px-4 text-center space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-[#4285F4]/15 border border-[#4285F4]/30 text-[#4285F4] flex items-center justify-center mx-auto">
                  <Sparkles className="w-6 h-6 text-[#FBBC05] fill-[#FBBC05]" />
                </div>
                <h3 className="font-semibold text-[#f0f6fc] text-sm">
                  Ready to evaluate your solution
                </h3>
                <p className="text-xs text-[#8b949e] max-w-xs mx-auto leading-relaxed">
                  Write your code in the LeetCode editor and click "Analyze Code" above. AlgoPulse will evaluate your Big-O complexities, score your approach, and sync with your dashboard.
                </p>
              </div>
            )}

            {/* Loading State */}
            {loading && (
              <div className="py-16 text-center space-y-4">
                <div className="relative w-12 h-12 mx-auto">
                  <div className="w-12 h-12 rounded-full border-2 border-[#30363d] border-t-[#4285F4] animate-spin" />
                  <Sparkles className="w-5 h-5 text-[#FBBC05] absolute inset-0 m-auto animate-pulse" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-[#f0f6fc]">
                    Evaluating Code with AI Engine...
                  </p>
                  <p className="text-xs text-[#8b949e] mt-1">
                    Analyzing algorithmic approach & Big-O complexities
                  </p>
                </div>
              </div>
            )}

            {/* Analysis Results */}
            {result && !loading && (() => {
              const scoreVal = typeof result.score === 'number' ? result.score : 70;
              const soundness = result.scoring_breakdown?.approach_soundness ?? result.scoring_breakdown?.optimality ?? 28;
              const optScore = result.scoring_breakdown?.approach_optimality ?? result.scoring_breakdown?.time_complexity ?? 20;
              const spaceScore = result.scoring_breakdown?.space_complexity ?? 18;
              const cleanScore = result.scoring_breakdown?.cleanliness ?? 18;
              const userApp = result.user_approach || {
                name: 'Submitted Strategy',
                paradigm: 'General',
                time_complexity: 'O(N)',
                space_complexity: 'O(1)',
                summary: ''
              };
              const bestApp = result.best_approach || {
                name: 'Ideal Paradigm',
                paradigm: 'Optimal',
                time_complexity: 'O(N)',
                space_complexity: 'O(1)',
                explanation: 'Optimal time and space complexity strategy.'
              };
              const hintsList = Array.isArray(result.hints) ? result.hints : [];
              const improvementsList = Array.isArray(result.improvements) ? result.improvements : [];

              return (
                <div className="space-y-4">
                  {/* Score Banner */}
                  <div className="p-4 rounded-xl bg-[#161b22] border border-[#30363d] shadow-sm flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold uppercase tracking-wider text-[#8b949e]">
                          Overall Score
                        </span>
                        {result.provider_used && (
                          <span className="px-1.5 py-0.2 rounded text-[10px] bg-[#21262d] border border-[#30363d] text-[#4285F4] font-medium">
                            {result.provider_used}
                          </span>
                        )}
                      </div>
                      <div className="flex items-baseline gap-1 mt-0.5">
                        <span className="text-3xl font-extrabold text-[#f0f6fc]">
                          {scoreVal}
                        </span>
                        <span className="text-xs text-[#8b949e]">/ 100</span>
                      </div>
                    </div>
                    <div className={`px-3 py-1.5 rounded-lg border font-semibold text-xs flex items-center gap-1.5 ${getScoreColor(scoreVal)}`}>
                      <Award className="w-4 h-4" />
                      <span>{scoreVal >= 80 ? 'Optimal' : scoreVal >= 60 ? 'Acceptable' : 'Needs Optimization'}</span>
                    </div>
                  </div>

                  {/* Rubric Breakdown - Approach Focused */}
                  <div className="p-3.5 rounded-xl bg-[#161b22] border border-[#30363d] space-y-2.5 text-xs">
                    <div className="flex items-center justify-between">
                      <h4 className="font-semibold text-[#f0f6fc]">
                        Approach Scoring Rubric
                      </h4>
                      <span className="text-[10px] text-[#8b949e]">Total 100 pts</span>
                    </div>
                    <div className="space-y-2">
                      <div>
                        <div className="flex justify-between text-[11px] mb-1">
                          <span className="text-[#8b949e]">Algorithmic Approach & Paradigm</span>
                          <span className="font-semibold text-[#c9d1d9]">
                            {soundness} / 35
                          </span>
                        </div>
                        <div className="w-full bg-[#21262d] h-1.5 rounded-full overflow-hidden">
                          <div
                            className="bg-[#4285F4] h-full rounded-full transition-all duration-500"
                            style={{ width: `${Math.min(100, (soundness / 35) * 100)}%` }}
                          />
                        </div>
                      </div>

                      <div>
                        <div className="flex justify-between text-[11px] mb-1">
                          <span className="text-[#8b949e]">Approach Optimality & Strategy</span>
                          <span className="font-semibold text-[#c9d1d9]">
                            {optScore} / 25
                          </span>
                        </div>
                        <div className="w-full bg-[#21262d] h-1.5 rounded-full overflow-hidden">
                          <div
                            className="bg-[#34A853] h-full rounded-full transition-all duration-500"
                            style={{ width: `${Math.min(100, (optScore / 25) * 100)}%` }}
                          />
                        </div>
                      </div>

                      <div>
                        <div className="flex justify-between text-[11px] mb-1">
                          <span className="text-[#8b949e]">Space Complexity & Memory</span>
                          <span className="font-semibold text-[#c9d1d9]">{spaceScore} / 20</span>
                        </div>
                        <div className="w-full bg-[#21262d] h-1.5 rounded-full overflow-hidden">
                          <div
                            className="bg-[#FBBC05] h-full rounded-full transition-all duration-500"
                            style={{ width: `${Math.min(100, (spaceScore / 20) * 100)}%` }}
                          />
                        </div>
                      </div>

                      <div>
                        <div className="flex justify-between text-[11px] mb-1">
                          <span className="text-[#8b949e]">Cleanliness & Edge Cases</span>
                          <span className="font-semibold text-[#c9d1d9]">{cleanScore} / 20</span>
                        </div>
                        <div className="w-full bg-[#21262d] h-1.5 rounded-full overflow-hidden">
                          <div
                            className="bg-[#EA4335] h-full rounded-full transition-all duration-500"
                            style={{ width: `${Math.min(100, (cleanScore / 20) * 100)}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Algorithmic Approach Comparison Card */}
                  <div className="p-3.5 rounded-xl border border-[#30363d] bg-[#161b22] space-y-2.5 text-xs">
                    <div className="flex items-center justify-between">
                      <h4 className="font-semibold text-[#f0f6fc] flex items-center gap-1.5">
                        <Code2 className="w-3.5 h-3.5 text-[#4285F4]" />
                        Approach Evaluation
                      </h4>
                      <span className="text-[10px] text-[#8b949e]">
                        Strategy Comparison
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      {/* User Approach */}
                      <div className="p-2.5 rounded-lg bg-[#0d1117] border border-[#30363d] space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] text-[#8b949e] uppercase font-semibold">Your Approach</span>
                          {userApp.paradigm && (
                            <span className="text-[9px] px-1.5 py-0.2 rounded bg-[#21262d] text-[#c9d1d9] border border-[#30363d]">
                              {userApp.paradigm}
                            </span>
                          )}
                        </div>
                        <p className="font-bold text-[#f0f6fc] text-xs leading-snug">
                          {userApp.name || 'Your Strategy'}
                        </p>
                        <div className="flex items-center gap-2 text-[10px] text-[#8b949e] font-mono">
                          <span>Time: <span className="text-[#c9d1d9]">{userApp.time_complexity || 'O(N)'}</span></span>
                          <span>•</span>
                          <span>Space: <span className="text-[#c9d1d9]">{userApp.space_complexity || 'O(1)'}</span></span>
                        </div>
                        {userApp.summary && (
                          <p className="text-[11px] text-[#8b949e] leading-relaxed pt-1 border-t border-[#30363d]/50">
                            {userApp.summary}
                          </p>
                        )}
                      </div>

                      {/* Optimal Approach */}
                      <div className="p-2.5 rounded-lg bg-[#0d1117] border border-[#4285F4]/40 space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] text-[#4285F4] uppercase font-semibold">Optimal Approach</span>
                          {bestApp.paradigm && (
                            <span className="text-[9px] px-1.5 py-0.2 rounded bg-[#34A853]/15 text-[#34A853] border border-[#34A853]/30">
                              {bestApp.paradigm}
                            </span>
                          )}
                        </div>
                        <p className="font-bold text-[#4285F4] text-xs leading-snug">
                          {bestApp.name || 'Ideal Paradigm'}
                        </p>
                        <div className="flex items-center gap-2 text-[10px] text-[#8b949e] font-mono">
                          <span>Time: <span className="text-[#4285F4]">{bestApp.time_complexity || 'O(N)'}</span></span>
                          <span>•</span>
                          <span>Space: <span className="text-[#4285F4]">{bestApp.space_complexity || 'O(1)'}</span></span>
                        </div>
                        <p className="text-[11px] text-[#c9d1d9] leading-relaxed pt-1 border-t border-[#30363d]/50">
                          {bestApp.explanation || 'Optimal complexity approach.'}
                        </p>
                      </div>
                    </div>

                    {/* Why Suboptimal / Why Ideal Critique */}
                    {result.why_suboptimal && (
                      <div className="p-2.5 rounded-lg bg-[#0d1117] border border-[#30363d] text-[11px] space-y-1">
                        <span className="text-[10px] font-semibold text-[#FBBC05] uppercase tracking-wider block">
                          Approach Critique & Paradigm Shift
                        </span>
                        <p className="text-[#8b949e] leading-relaxed">
                          {result.why_suboptimal}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Progressive Hints Section */}
                  <div className="p-3.5 rounded-xl border border-[#30363d] bg-[#161b22] space-y-2 text-xs">
                    <div className="flex items-center justify-between">
                      <h4 className="font-semibold text-[#f0f6fc] flex items-center gap-1.5">
                        <Eye className="w-3.5 h-3.5 text-[#4285F4]" />
                        Progressive Hints
                      </h4>
                      <span className="text-[10px] text-[#8b949e]">
                        {unlockedHints} of {Math.max(3, hintsList.length)} revealed
                      </span>
                    </div>

                    <div className="space-y-1.5">
                      {hintsList.map((hint, idx) => {
                        const isUnlocked = idx < unlockedHints;
                        return (
                          <div
                            key={idx}
                            className={`p-2.5 rounded-lg border text-[11px] transition ${
                              isUnlocked
                                ? 'bg-[#0d1117] border-[#30363d] text-[#c9d1d9]'
                                : 'bg-[#0d1117]/50 border-dashed border-[#30363d] text-[#8b949e]'
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <span className="font-semibold text-[#f0f6fc]">
                                Tier {idx + 1}: {idx === 0 ? 'Observation' : idx === 1 ? 'Pattern Hint' : 'Strategy'}
                              </span>
                              {!isUnlocked && idx === unlockedHints && (
                                <button
                                  type="button"
                                  onClick={() => setUnlockedHints(idx + 1)}
                                  className="text-[10px] font-semibold text-[#4285F4] hover:text-[#3367D6] cursor-pointer"
                                >
                                  Reveal Hint
                                </button>
                              )}
                            </div>
                            {isUnlocked ? (
                              <p className="mt-1 text-[#c9d1d9] leading-relaxed">{hint}</p>
                            ) : (
                              <p className="mt-1 text-[#8b949e] italic">Locked. Click reveal when stuck.</p>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Suggested Improvements */}
                  {improvementsList.length > 0 && (
                    <div className="p-3.5 rounded-xl border border-[#30363d] bg-[#161b22] space-y-2 text-xs">
                      <h4 className="font-semibold text-[#f0f6fc]">
                        Suggested Improvements
                      </h4>
                      <ul className="space-y-1.5">
                        {improvementsList.map((imp, idx) => (
                          <li key={idx} className="flex items-start gap-2 text-[11px] text-[#c9d1d9]">
                            <ChevronRight className="w-3.5 h-3.5 text-[#34A853] shrink-0 mt-0.5" />
                            <span>{imp}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                {/* Optimal Code Reference Snippet */}
                <div className="p-3.5 rounded-xl border border-[#30363d] bg-[#161b22] space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <h4 className="font-semibold text-[#f0f6fc] flex items-center gap-1.5">
                      <Code2 className="w-4 h-4 text-[#34A853]" />
                      Optimal Code Reference
                    </h4>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowOptimalCode(!showOptimalCode);
                      }}
                      className="px-2.5 py-1 rounded bg-[#21262d] hover:bg-[#30363d] border border-[#30363d] text-[11px] text-[#4285F4] font-semibold transition cursor-pointer"
                    >
                      {showOptimalCode ? 'Hide Code' : 'View Code'}
                    </button>
                  </div>

                  {showOptimalCode && (
                    <div className="relative mt-2 rounded-xl overflow-hidden border border-[#30363d] bg-[#0d1117]">
                      <div className="p-2 bg-[#161b22] border-b border-[#30363d] flex items-center justify-between text-[10px] text-[#8b949e]">
                        <span className="font-mono text-[#4285F4]">{context?.language || 'python3'}</span>
                        <button
                          type="button"
                          onClick={copyOptimalCode}
                          className="px-2 py-0.5 rounded bg-[#21262d] hover:bg-[#30363d] text-[#c9d1d9] border border-[#30363d] transition flex items-center gap-1 cursor-pointer"
                        >
                          <Copy className="w-3 h-3" />
                          <span>{copied ? 'Copied!' : 'Copy Code'}</span>
                        </button>
                      </div>
                      <pre className="p-3 bg-[#0d1117] text-[#34A853] font-mono text-[11px] overflow-x-auto max-h-64 leading-relaxed whitespace-pre m-0">
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
                        ? 'bg-[#34A853]/15 border-[#34A853]/30 text-[#34A853]'
                        : 'bg-[#161b22] border-[#30363d] text-[#8b949e]'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 shrink-0 text-[#34A853]" />
                      <span>{syncStatus.message}</span>
                    </div>
                  </div>
                )}
              </div>
            );
          })()}
        </div>

          {/* Footer */}
          <div className="p-3 border-t border-[#30363d] bg-[#161b22] flex items-center justify-between text-xs text-[#8b949e]">
            <div className="flex items-center gap-1.5">
              <div className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-[#4285F4]" />
                <span className="w-1.5 h-1.5 rounded-full bg-[#EA4335]" />
                <span className="w-1.5 h-1.5 rounded-full bg-[#FBBC05]" />
                <span className="w-1.5 h-1.5 rounded-full bg-[#34A853]" />
              </div>
              <span className="text-[11px]">Powered by Google Gemini</span>
            </div>
            <span className="font-mono text-[10px] text-[#6e7681]">AlgoPulse v1.0</span>
          </div>
        </div>
      )}
    </div>
  );
};

class OverlayErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error: string }
> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false, error: '' };
  }

  static getDerivedStateFromError(error: any) {
    return { hasError: true, error: error?.message || 'AlgoPulse UI rendering notice' };
  }

  componentDidCatch(error: any, info: any) {
    console.warn('[AlgoPulse] Overlay Caught Component Error:', error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="fixed bottom-6 right-6 z-[999999] p-3.5 bg-[#161b22] border border-[#30363d] text-[#c9d1d9] text-xs rounded-xl shadow-2xl flex items-center gap-3">
          <span className="text-[#FBBC05] font-semibold">⚡ AlgoPulse</span>
          <span className="text-[11px] text-[#8b949e]">Reviewer ready</span>
          <button
            type="button"
            onClick={() => this.setState({ hasError: false, error: '' })}
            className="px-2.5 py-1 bg-[#4285F4] hover:bg-[#3367D6] text-white text-[10px] font-semibold rounded-lg cursor-pointer"
          >
            Reset
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

export const AlgoPulseOverlay: React.FC = () => (
  <OverlayErrorBoundary>
    <AlgoPulseOverlayInner />
  </OverlayErrorBoundary>
);
