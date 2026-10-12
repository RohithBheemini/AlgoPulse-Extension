export interface FollowUpQuestion {
  question: string;
  category: 'Scale' | 'Constraint' | 'Concurrency' | 'Edge Case' | string;
  answer: string;
}

export interface SubmissionRecord {
  id: string;
  user_id?: string;
  problem_title: string;
  problem_slug: string;
  platform: 'leetcode' | 'geeksforgeeks' | 'hackerrank' | 'vscode' | 'other' | string;
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
  
  paradigm?: string;
  follow_up_questions?: FollowUpQuestion[];
  
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

export interface ParadigmSkill {
  name: string;
  category: string;
  solvedCount: number;
  masteryScore: number;
  status: 'Ready' | 'Practicing' | 'Blind Spot';
}

export interface SpacedReviewItem {
  id: string;
  problemTitle: string;
  paradigm: string;
  lastPracticed: string;
  dueInDays: number;
  urgency: 'Due Today' | 'Upcoming' | 'Mastered';
  decayPercent: number;
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
    vscode: number;
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
  readinessScore?: number;
  paradigmMatrix?: ParadigmSkill[];
  spacedReviewQueue?: SpacedReviewItem[];
}
