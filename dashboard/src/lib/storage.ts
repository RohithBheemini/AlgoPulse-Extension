import fs from 'fs';
import path from 'path';
import { createClient } from '@supabase/supabase-js';
import {
  SubmissionRecord,
  AnalyticsSummary,
  HeatmapDay,
  StreakStats,
  ParadigmSkill,
  SpacedReviewItem,
  FollowUpQuestion
} from './types';

// Helper to get Supabase client on demand with service role key if available
function getSupabaseInstance() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    return null;
  }

  return createClient(supabaseUrl, supabaseKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false
    }
  });
}

// Local JSON file storage path
const dataDir = path.resolve(process.cwd(), 'data');
const localFilePath = path.resolve(dataDir, 'submissions.json');

function readLocalSubmissions(): SubmissionRecord[] {
  try {
    if (!fs.existsSync(localFilePath)) {
      writeLocalSubmissions([]);
      return [];
    }
    const raw = fs.readFileSync(localFilePath, 'utf8');
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (err) {
    console.error('Error reading local submissions:', err);
    return [];
  }
}

function writeLocalSubmissions(data: SubmissionRecord[]): void {
  try {
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    fs.writeFileSync(localFilePath, JSON.stringify(data, null, 2), 'utf8');
  } catch (err) {
    console.error('Error writing local submissions:', err);
  }
}

export async function getAllSubmissions(userId?: string): Promise<SubmissionRecord[]> {
  const supabase = getSupabaseInstance();
  if (supabase) {
    try {
      if (userId) {
        // Query user-specific submissions strictly
        const { data: userRecords, error: userError } = await supabase
          .from('submissions')
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: false });

        if (!userError && userRecords) {
          return userRecords as SubmissionRecord[];
        }
        return [];
      } else {
        // If not logged in, return an empty array — never expose other users' private submissions
        return [];
      }
    } catch (err) {
      console.warn('Supabase fetch failed, falling back to local storage:', err);
    }
  }

  // Fallback to local storage strictly filtered by user
  const local = readLocalSubmissions();
  if (userId) {
    return local.filter((s) => s.user_id === userId);
  }
  return [];
}

export async function getSubmissionById(id: string): Promise<SubmissionRecord | null> {
  const supabase = getSupabaseInstance();
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('submissions')
        .select('*')
        .eq('id', id)
        .single();

      if (!error && data) {
        return data as SubmissionRecord;
      }
    } catch (err) {
      console.warn('Supabase getSubmissionById error:', err);
    }
  }

  const all = readLocalSubmissions();
  return all.find((s) => s.id === id) || null;
}

export async function insertSubmission(
  sub: Omit<SubmissionRecord, 'id' | 'created_at'>
): Promise<SubmissionRecord> {
  const newRecord: SubmissionRecord = {
    ...sub,
    id: `sub_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    created_at: new Date().toISOString()
  };

  // Always mirror to local file so offline and local fallback have the latest data
  try {
    const existing = readLocalSubmissions();
    const updated = [newRecord, ...existing.filter((s) => s.id !== newRecord.id)];
    writeLocalSubmissions(updated);
  } catch (err) {
    console.warn('Failed to mirror to local file:', err);
  }

  const supabase = getSupabaseInstance();
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('submissions')
        .insert([newRecord])
        .select()
        .single();

      if (!error && data) {
        return data as SubmissionRecord;
      } else if (error) {
        console.warn('Supabase insert error, falling back to local:', error.message);
      }
    } catch (err) {
      console.warn('Supabase insert failed, saved to local storage fallback:', err);
    }
  }

  return newRecord;
}

export async function deleteSubmission(id: string): Promise<boolean> {
  let found = false;

  // 1. Delete from local JSON file
  try {
    const existing = readLocalSubmissions();
    const filtered = existing.filter((s) => s.id !== id);
    if (filtered.length !== existing.length) {
      found = true;
      writeLocalSubmissions(filtered);
    }
  } catch (err) {
    console.warn('Failed to delete from local file:', err);
  }

  // 2. Delete from Supabase if configured
  const supabase = getSupabaseInstance();
  if (supabase) {
    try {
      const { error } = await supabase
        .from('submissions')
        .delete()
        .eq('id', id);

      if (!error) {
        found = true;
      }
    } catch (err) {
      console.warn('Supabase delete error:', err);
    }
  }

  return found;
}

function computeHeatmapAndStreaks(submissions: SubmissionRecord[]): {
  heatmap: HeatmapDay[];
  streaks: StreakStats;
} {
  // Generate past 16 weeks (112 days) up to today
  const daysCount = 112;
  const today = new Date();
  today.setHours(23, 59, 59, 999);

  const dayMap = new Map<string, { count: number; problems: string[] }>();

  // Initialize all days
  for (let i = daysCount - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];
    dayMap.set(dateStr, { count: 0, problems: [] });
  }

  // Populate from submissions
  submissions.forEach((sub) => {
    try {
      const dateStr = new Date(sub.created_at).toISOString().split('T')[0];
      const entry = dayMap.get(dateStr);
      if (entry) {
        entry.count += 1;
        if (!entry.problems.includes(sub.problem_title)) {
          entry.problems.push(sub.problem_title);
        }
      }
    } catch {
      // Ignore malformed dates
    }
  });

  const heatmap: HeatmapDay[] = [];
  let currentStreak = 0;
  let longestStreak = 0;
  let runningStreak = 0;
  let totalActiveDays = 0;

  const sortedDates = Array.from(dayMap.keys()).sort();

  sortedDates.forEach((dateStr) => {
    const info = dayMap.get(dateStr)!;
    const count = info.count;
    let level: 0 | 1 | 2 | 3 | 4 = 0;
    if (count >= 4) level = 4;
    else if (count === 3) level = 3;
    else if (count === 2) level = 2;
    else if (count === 1) level = 1;

    heatmap.push({
      date: dateStr,
      count,
      level,
      problems: info.problems
    });

    if (count > 0) {
      totalActiveDays++;
      runningStreak++;
      if (runningStreak > longestStreak) {
        longestStreak = runningStreak;
      }
    } else {
      runningStreak = 0;
    }
  });

  // Calculate current streak backwards from today
  const todayStr = new Date().toISOString().split('T')[0];
  const yesterdayStr = new Date(Date.now() - 86400000).toISOString().split('T')[0];

  const todayCount = dayMap.get(todayStr)?.count || 0;
  const yesterdayCount = dayMap.get(yesterdayStr)?.count || 0;

  if (todayCount > 0 || yesterdayCount > 0) {
    let checkDate = todayCount > 0 ? new Date() : new Date(Date.now() - 86400000);
    while (true) {
      const dateStr = checkDate.toISOString().split('T')[0];
      const entry = dayMap.get(dateStr);
      if (entry && entry.count > 0) {
        currentStreak++;
        checkDate.setDate(checkDate.getDate() - 1);
      } else {
        break;
      }
    }
  }

  return {
    heatmap,
    streaks: {
      currentStreak,
      longestStreak: Math.max(longestStreak, currentStreak),
      totalActiveDays
    }
  };
}

function extractTopParadigms(submissions: SubmissionRecord[]): Array<{ name: string; count: number }> {
  const paradigmMap: Record<string, number> = {};

  const commonParadigms = [
    'Hash Map',
    'Two Pointers',
    'Sliding Window',
    'Dynamic Programming',
    'Binary Search',
    'Greedy',
    'Breadth-First Search',
    'Depth-First Search',
    'Prefix Sum',
    'Monotonic Stack',
    'Bit Manipulation',
    'Recursion'
  ];

  submissions.forEach((sub) => {
    const text = `${sub.user_time_complexity} ${sub.optimal_time_complexity} ${sub.why_suboptimal} ${sub.summary_feedback}`;
    commonParadigms.forEach((p) => {
      if (new RegExp(p, 'i').test(text)) {
        paradigmMap[p] = (paradigmMap[p] || 0) + 1;
      }
    });
  });

  return Object.entries(paradigmMap)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);
}

const INTERVIEW_PARADIGMS = [
  { name: 'Hash Map & Lookup', category: 'Fundamental', keywords: ['hash', 'lookup', 'map', 'frequency', 'dictionary', 'two sum'] },
  { name: 'Two Pointers', category: 'Array & String', keywords: ['two-pointer', 'two pointer', 'opposite', 'converging', 'palindrome'] },
  { name: 'Sliding Window', category: 'Array & String', keywords: ['sliding window', 'window', 'substring without', 'continuous subarray'] },
  { name: 'Fast & Slow Pointers', category: 'Linked List', keywords: ['tortoise', 'slow', 'cycle', 'floyd', 'middle of linked list'] },
  { name: 'Monotonic Stack & Queue', category: 'Stack', keywords: ['monotonic', 'next greater', 'daily temperature', 'histogram'] },
  { name: 'Binary Search & Bounds', category: 'Search', keywords: ['binary search', 'log n', 'bisection', 'sorted array search'] },
  { name: 'Tree BFS & DFS', category: 'Trees', keywords: ['bfs', 'dfs', 'level order', 'tree', 'traversal', 'depth', 'islands'] },
  { name: 'Dynamic Programming', category: 'Optimization', keywords: ['dp', 'dynamic programming', 'memoization', 'tabulation', 'subproblem', 'knapsack'] },
  { name: 'Graph & Disjoint Set', category: 'Graphs', keywords: ['graph', 'dijkstra', 'union-find', 'disjoint', 'topological', 'connected components'] },
  { name: 'Heap & Priority Queue', category: 'Priority', keywords: ['heap', 'priority queue', 'top k', 'min-heap', 'kth largest'] },
  { name: 'Backtracking & Subsets', category: 'Combinatorics', keywords: ['backtrack', 'permutation', 'combination', 'subset', 'n-queens'] },
  { name: 'Linked List Reversal', category: 'Linked List', keywords: ['reverse linked list', 'in-place reversal', 'swap nodes'] },
  { name: 'Greedy Strategy', category: 'Optimization', keywords: ['greedy', 'interval', 'jump game', 'gas station'] },
  { name: 'Prefix Sum & Diff', category: 'Array', keywords: ['prefix sum', 'cumulative', 'subarray sum', 'range sum'] }
];

function computeParadigmMatrix(submissions: SubmissionRecord[]): ParadigmSkill[] {
  return INTERVIEW_PARADIGMS.map((p) => {
    const matchingSubs = submissions.filter((sub) => {
      const corpus = `${sub.problem_title} ${sub.problem_slug} ${sub.user_time_complexity} ${sub.optimal_time_complexity} ${sub.summary_feedback} ${sub.paradigm || ''}`.toLowerCase();
      return p.keywords.some((kw) => corpus.includes(kw));
    });

    const solvedCount = matchingSubs.length;
    const avgScore = solvedCount > 0 
      ? Math.round(matchingSubs.reduce((acc, s) => acc + (s.overall_score || 0), 0) / solvedCount)
      : 0;

    const status: 'Ready' | 'Practicing' | 'Blind Spot' = 
      solvedCount >= 2 && avgScore >= 80 ? 'Ready' :
      solvedCount >= 1 ? 'Practicing' : 'Blind Spot';

    return {
      name: p.name,
      category: p.category,
      solvedCount,
      masteryScore: solvedCount > 0 ? avgScore : 0,
      status
    };
  });
}

function computeSpacedReviewQueue(submissions: SubmissionRecord[]): SpacedReviewItem[] {
  const seen = new Set<string>();
  const queue: SpacedReviewItem[] = [];

  submissions.forEach((sub) => {
    if (seen.has(sub.problem_title)) return;
    seen.add(sub.problem_title);

    const createdTime = new Date(sub.created_at).getTime();
    const daysElapsed = Math.max(0, Math.floor((Date.now() - createdTime) / 86400000));
    
    const baseDecay = Math.min(95, Math.max(10, daysElapsed * 16));
    const scoreBonus = sub.overall_score >= 90 ? 15 : 0;
    const decayPercent = Math.max(5, baseDecay - scoreBonus);

    let urgency: 'Due Today' | 'Upcoming' | 'Mastered' = 'Upcoming';
    let dueInDays = 3;

    if (decayPercent >= 45 || daysElapsed >= 4) {
      urgency = 'Due Today';
      dueInDays = 0;
    } else if (decayPercent <= 20 && daysElapsed < 2) {
      urgency = 'Mastered';
      dueInDays = Math.max(7, 14 - daysElapsed);
    } else {
      urgency = 'Upcoming';
      dueInDays = Math.max(1, 5 - daysElapsed);
    }

    queue.push({
      id: sub.id,
      problemTitle: sub.problem_title,
      paradigm: sub.user_time_complexity.split('(')[0].trim() || 'Algorithmic Pattern',
      lastPracticed: new Date(sub.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
      dueInDays,
      urgency,
      decayPercent
    });
  });

  return queue.sort((a, b) => b.decayPercent - a.decayPercent).slice(0, 5);
}

function computeReadinessScore(matrix: ParadigmSkill[]): number {
  const readyCount = matrix.filter((p) => p.status === 'Ready').length;
  const practicingCount = matrix.filter((p) => p.status === 'Practicing').length;
  if (readyCount === 0 && practicingCount === 0) return 0;
  const raw = (readyCount * 6.5) + (practicingCount * 3.0);
  return Math.min(100, Math.round(raw));
}

export async function getAnalyticsSummary(userId?: string): Promise<AnalyticsSummary> {
  const subs = await getAllSubmissions(userId);
  const { heatmap, streaks } = computeHeatmapAndStreaks(subs);
  const topParadigms = extractTopParadigms(subs);
  const paradigmMatrix = computeParadigmMatrix(subs);
  const spacedReviewQueue = computeSpacedReviewQueue(subs);
  const readinessScore = computeReadinessScore(paradigmMatrix);

  const platformCounts = {
    leetcode: 0,
    geeksforgeeks: 0,
    hackerrank: 0,
    vscode: 0,
    other: 0
  };

  subs.forEach((s) => {
    const p = (s.platform || 'leetcode').toLowerCase();
    if (p.includes('leetcode')) platformCounts.leetcode++;
    else if (p.includes('geeksforgeeks') || p.includes('gfg')) platformCounts.geeksforgeeks++;
    else if (p.includes('hackerrank')) platformCounts.hackerrank++;
    else if (p.includes('vscode')) platformCounts.vscode++;
    else platformCounts.other++;
  });

  if (subs.length === 0) {
    return {
      totalSubmissions: 0,
      averageScore: 0,
      averageOptimality: 0,
      averageTimeScore: 0,
      averageSpaceScore: 0,
      difficultyCounts: { Easy: 0, Medium: 0, Hard: 0 },
      platformCounts,
      recentTrend: [],
      heatmap,
      streaks,
      topParadigms,
      readinessScore: 0,
      paradigmMatrix,
      spacedReviewQueue: []
    };
  }

  const total = subs.length;
  const avgScore = Math.round(subs.reduce((acc, s) => acc + (s.overall_score || 0), 0) / total);
  const avgOpt = Math.round(subs.reduce((acc, s) => acc + (s.optimality_score || 0), 0) / total);
  const avgTime = Math.round(subs.reduce((acc, s) => acc + (s.time_score || 0), 0) / total);
  const avgSpace = Math.round(subs.reduce((acc, s) => acc + (s.space_score || 0), 0) / total);

  const diffCounts = { Easy: 0, Medium: 0, Hard: 0 };
  subs.forEach((s) => {
    const d = s.difficulty as 'Easy' | 'Medium' | 'Hard';
    if (diffCounts[d] !== undefined) {
      diffCounts[d]++;
    }
  });

  const recentTrend = subs
    .slice(0, 10)
    .reverse()
    .map((s) => ({
      date: new Date(s.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
      score: s.overall_score,
      problem: s.problem_title
    }));

  return {
    totalSubmissions: total,
    averageScore: avgScore,
    averageOptimality: avgOpt,
    averageTimeScore: avgTime,
    averageSpaceScore: avgSpace,
    difficultyCounts: diffCounts,
    platformCounts,
    recentTrend,
    heatmap,
    streaks,
    topParadigms,
    readinessScore,
    paradigmMatrix,
    spacedReviewQueue
  };
}
