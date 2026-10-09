export interface ProblemMetadata {
  title: string;
  slug: string;
  difficulty: 'Easy' | 'Medium' | 'Hard' | 'Unknown';
  language: string;
  code: string;
  platform: 'leetcode' | 'hackerrank' | 'other';
  description?: string;
  url?: string;
}

export interface ApproachAnalysis {
  name: string;             // e.g. "Two Pointers", "Hash Map Single-Pass", "Brute Force"
  paradigm: string;         // e.g. "Two Pointers", "Hashing", "Dynamic Programming", "Greedy"
  time_complexity: string;  // e.g. "O(N)"
  space_complexity: string; // e.g. "O(1)"
  summary: string;          // Concise explanation of how the approach works
}

export interface OptimalApproachAnalysis extends ApproachAnalysis {
  explanation: string;      // Pedagogical explanation of why this approach is ideal
}

export interface ScoringBreakdown {
  approach_soundness?: number;  // 0-35 (Algorithmic approach & paradigm selection)
  approach_optimality?: number; // 0-25 (Optimization distance from ideal technique)
  optimality: number;           // 0-35 (Backwards compatible alias)
  time_complexity: number;      // 0-25 (Backwards compatible alias)
  space_complexity: number;     // 0-20 (Auxiliary memory footprint)
  cleanliness: number;          // 0-20 (Code readability, idioms, edge cases)
}

export interface AIAnalysisResult {
  score: number; // 0 - 100
  scoring_breakdown: ScoringBreakdown;
  user_approach: ApproachAnalysis;
  best_approach: OptimalApproachAnalysis;
  why_suboptimal?: string;
  why_ideal?: string;
  hints: [string, string, string]; // [Tier 1 Nudge, Tier 2 Pattern, Tier 3 Strategy]
  improvements: string[];
  optimal_code: string;
}

export interface ExtensionSettings {
  geminiApiKey: string;
  dashboardUrl: string;
  extensionToken: string;
  autoSync: boolean;
}

export interface SyncSubmissionPayload {
  problem_title: string;
  problem_slug: string;
  platform: string;
  difficulty: string;
  language: string;
  user_code: string;
  overall_score: number;
  optimality_score: number;
  time_score: number;
  space_score: number;
  cleanliness_score: number;
  user_time_complexity: string;
  user_space_complexity: string;
  optimal_time_complexity: string;
  optimal_space_complexity: string;
  why_suboptimal?: string;
  why_ideal?: string;
  summary_feedback: string;
  improvements: string[];
  optimal_code: string;
}

export interface SubmissionHistoryItem extends SyncSubmissionPayload {
  id: string;
  created_at: string;
  synced: boolean;
}
