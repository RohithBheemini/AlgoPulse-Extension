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

export interface ComplexityAnalysis {
  time_complexity: string;
  space_complexity: string;
  summary: string;
}

export interface OptimalApproachAnalysis extends ComplexityAnalysis {
  explanation: string;
}

export interface ScoringBreakdown {
  optimality: number;      // 0-35
  time_complexity: number; // 0-25
  space_complexity: number;// 0-20
  cleanliness: number;     // 0-20
}

export interface AIAnalysisResult {
  score: number; // 0 - 100
  scoring_breakdown: ScoringBreakdown;
  user_approach: ComplexityAnalysis;
  best_approach: OptimalApproachAnalysis;
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
  summary_feedback: string;
  improvements: string[];
  optimal_code: string;
}

export interface SubmissionHistoryItem extends SyncSubmissionPayload {
  id: string;
  created_at: string;
  synced: boolean;
}
