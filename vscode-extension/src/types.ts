export interface ProblemMetadata {
  title: string;
  slug: string;
  difficulty: 'Easy' | 'Medium' | 'Hard' | 'Unknown';
  language: string;
  code: string;
  platform: 'vscode' | 'leetcode' | 'geeksforgeeks' | 'hackerrank' | 'other';
  description?: string;
  filePath?: string;
}

export interface ApproachAnalysis {
  name: string;
  paradigm: string;
  summary: string;
  time_complexity: string;
  space_complexity: string;
}

export interface BestApproachAnalysis {
  name: string;
  paradigm: string;
  time_complexity: string;
  space_complexity: string;
  explanation: string;
}

export interface ProgressiveHints {
  tier1_observation: string;
  tier2_pattern: string;
  tier3_strategy: string;
}

export interface ScoringBreakdown {
  approach_soundness: number;
  approach_optimality: number;
  optimality: number;
  time_complexity: number;
  space_complexity: number;
  cleanliness: number;
}

export interface AIAnalysisResult {
  score: number;
  scoring_breakdown: ScoringBreakdown;
  user_approach: ApproachAnalysis;
  best_approach: BestApproachAnalysis;
  why_suboptimal?: string;
  why_ideal?: string;
  hints: ProgressiveHints;
  improvements: string[];
  optimal_code: string;
  assessed_difficulty?: 'Easy' | 'Medium' | 'Hard';
  model_used?: string;
}

export interface ExtensionConfig {
  geminiApiKey: string;
  dashboardUrl: string;
  extensionToken: string;
  autoSync: boolean;
  preferredModel: string;
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
  why_suboptimal: string;
  why_ideal: string;
  summary_feedback: string;
  improvements: string[];
  optimal_code: string;
  paradigm?: string;
}
