export interface SubmissionRecord {
  id: string;
  user_id?: string;
  problem_title: string;
  problem_slug: string;
  platform: 'leetcode' | 'geeksforgeeks' | 'hackerrank' | 'other' | string;
  difficulty: 'Easy' | 'Medium' | 'Hard' | string;
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
  
  created_at: string;
}

export interface HeatmapDay {
  date: string;
  count: number;
  level: 0 | 1 | 2 | 3 | 4;
  problems: string[];
}

export interface StreakStats {
  currentStreak: number;
  longestStreak: number;
  totalActiveDays: number;
}

export interface AnalyticsSummary {
  totalSubmissions: number;
  averageScore: number;
  averageOptimality: number;
  averageTimeScore: number;
  averageSpaceScore: number;
  difficultyCounts: {
    Easy: number;
    Medium: number;
    Hard: number;
  };
  platformCounts: {
    leetcode: number;
    geeksforgeeks: number;
    hackerrank: number;
    other: number;
  };
  recentTrend: Array<{
    date: string;
    score: number;
    problem: string;
  }>;
  heatmap: HeatmapDay[];
  streaks: StreakStats;
  topParadigms: Array<{ name: string; count: number }>;
}
