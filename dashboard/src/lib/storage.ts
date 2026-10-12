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

const INITIAL_SEED_DATA: SubmissionRecord[] = [
  {
    id: 'sub_seed_1',
    problem_title: 'Two Sum',
    problem_slug: 'two-sum',
    platform: 'leetcode',
    difficulty: 'Easy',
    language: 'python3',
    user_code: `class Solution:
    def twoSum(self, nums: List[int], target: int) -> List[int]:
        lookup = {}
        for i, num in enumerate(nums):
            diff = target - num
            if diff in lookup:
                return [lookup[diff], i]
            lookup[num] = i
        return []`,
    overall_score: 95,
    optimality_score: 35,
    time_score: 25,
    space_score: 18,
    cleanliness_score: 17,
    user_time_complexity: 'Hash Map Single-Pass (O(N))',
    user_space_complexity: 'O(N)',
    optimal_time_complexity: 'Hash Map Single-Pass (O(N))',
    optimal_space_complexity: 'O(N)',
    why_suboptimal: 'Your solution is already algorithmic perfection for an unsorted input array.',
    why_ideal: 'Single-pass hash table achieves immediate O(1) amortized lookup per element while indexing simultaneously.',
    summary_feedback: 'Optimal single-pass hash map approach. Excellent algorithmic strategy.',
    improvements: [
      'Type annotations are clean and idiomatic.',
      'Consider handling edge case where array has fewer than 2 elements.'
    ],
    optimal_code: `class Solution:
    def twoSum(self, nums: List[int], target: int) -> List[int]:
        seen = {}
        for i, val in enumerate(nums):
            needed = target - val
            if needed in seen:
                return [seen[needed], i]
            seen[val] = i
        return []`,
    follow_up_questions: [
      {
        question: 'What if the input array is already sorted? Can we achieve strict O(1) auxiliary space?',
        category: 'Constraint',
        answer: 'Yes! Use a Two-Pointer inward scan with left=0 and right=n-1. If nums[left] + nums[right] < target, advance left; if greater, decrement right. This eliminates the hash table, achieving O(N) time with strict O(1) auxiliary space.'
      },
      {
        question: 'What if the dataset contains 10^10 elements and exceeds single-machine RAM?',
        category: 'Scale',
        answer: 'Apply distributed range-partitioning or hash-sharding (e.g., Apache Spark). Hash-partition elements into bucket nodes so that any element x and its target - x pair are routed to deterministic paired workers.'
      }
    ],
    created_at: new Date(Date.now() - 3 * 86400000).toISOString()
  },
  {
    id: 'sub_seed_2',
    problem_title: 'Longest Substring Without Repeating Characters',
    problem_slug: 'longest-substring-without-repeating-characters',
    platform: 'leetcode',
    difficulty: 'Medium',
    language: 'python3',
    user_code: `class Solution:
    def lengthOfLongestSubstring(self, s: str) -> int:
        seen = set()
        left = 0
        ans = 0
        for right in range(len(s)):
            while s[right] in seen:
                seen.remove(s[left])
                left += 1
            seen.add(s[right])
            ans = max(ans, right - left + 1)
        return ans`,
    overall_score: 90,
    optimality_score: 34,
    time_score: 24,
    space_score: 16,
    cleanliness_score: 16,
    user_time_complexity: 'Sliding Window Set (O(N))',
    user_space_complexity: 'O(min(M, N))',
    optimal_time_complexity: 'Sliding Window Map (O(N))',
    optimal_space_complexity: 'O(min(M, N))',
    why_suboptimal: 'Using a set requires the left pointer to increment step-by-step to discard duplicates.',
    why_ideal: 'Storing character index positions in a dictionary allows the left pointer to jump directly past duplicates in O(1) operations.',
    summary_feedback: 'Sliding window technique implemented cleanly with set lookups.',
    improvements: [
      'You can optimize further by storing character index maps instead of sliding the left pointer one by one.'
    ],
    optimal_code: `class Solution:
    def lengthOfLongestSubstring(self, s: str) -> int:
        char_idx = {}
        left = 0
        longest = 0
        for right, ch in enumerate(s):
            if ch in char_idx and char_idx[ch] >= left:
                left = char_idx[ch] + 1
            char_idx[ch] = right
            longest = max(longest, right - left + 1)
        return longest`,
    created_at: new Date(Date.now() - 2 * 86400000).toISOString()
  },
  {
    id: 'sub_seed_3',
    problem_title: 'Subarray with Given Sum',
    problem_slug: 'subarray-with-given-sum',
    platform: 'geeksforgeeks',
    difficulty: 'Medium',
    language: 'java',
    user_code: `class Solution {
    static ArrayList<Integer> subarraySum(int[] arr, int n, int s) {
        int left = 0, current = 0;
        for (int right = 0; right < n; right++) {
            current += arr[right];
            while (current > s && left < right) {
                current -= arr[left++];
            }
            if (current == s) {
                ArrayList<Integer> res = new ArrayList<>();
                res.add(left + 1);
                res.add(right + 1);
                return res;
            }
        }
        ArrayList<Integer> res = new ArrayList<>();
        res.add(-1);
        return res;
    }
}`,
    overall_score: 94,
    optimality_score: 34,
    time_score: 24,
    space_score: 18,
    cleanliness_score: 18,
    user_time_complexity: 'Sliding Window Two-Pointer (O(N))',
    user_space_complexity: 'O(1)',
    optimal_time_complexity: 'Sliding Window Two-Pointer (O(N))',
    optimal_space_complexity: 'O(1)',
    why_suboptimal: 'Solution is optimal for positive integer arrays.',
    why_ideal: 'Sliding window maintains dynamic prefix sum in O(N) single-pass without nested loops.',
    summary_feedback: 'Clean sliding window two-pointer approach implemented on GeeksforGeeks.',
    improvements: [
      'Handle zero-sum targets explicitly at the beginning.'
    ],
    optimal_code: `class Solution {
    static ArrayList<Integer> subarraySum(int[] arr, int n, int s) {
        int left = 0, current = 0;
        for (int right = 0; right < n; right++) {
            current += arr[right];
            while (current > s && left < right) {
                current -= arr[left++];
            }
            if (current == s) {
                ArrayList<Integer> res = new ArrayList<>();
                res.add(left + 1);
                res.add(right + 1);
                return res;
            }
        }
        ArrayList<Integer> res = new ArrayList<>();
        res.add(-1);
        return res;
    }
}`,
    created_at: new Date(Date.now() - 1 * 86400000).toISOString()
  }
];

function readLocalSubmissions(): SubmissionRecord[] {
  try {
    if (!fs.existsSync(localFilePath)) {
      writeLocalSubmissions(INITIAL_SEED_DATA);
      return INITIAL_SEED_DATA;
    }
    const raw = fs.readFileSync(localFilePath, 'utf8');
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : INITIAL_SEED_DATA;
  } catch (err) {
    console.error('Error reading local submissions:', err);
    return INITIAL_SEED_DATA;
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
      let query = supabase
        .from('submissions')
        .select('*')
        .order('created_at', { ascending: false });

      if (userId) {
        // Query user-specific submissions
        const { data: userRecords, error: userError } = await supabase
          .from('submissions')
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: false });

        if (!userError && userRecords && userRecords.length > 0) {
          return userRecords as SubmissionRecord[];
        }

        // If user has none yet, also look for unassigned submissions (e.g. sent before token was configured)
        const { data: unassigned, error: unassignedError } = await supabase
          .from('submissions')
          .select('*')
          .is('user_id', null)
          .order('created_at', { ascending: false });

        if (!unassignedError && unassigned && unassigned.length > 0) {
          return unassigned as SubmissionRecord[];
        }

        return [];
      }

      const { data, error } = await query;

      if (!error && data && data.length > 0) {
        return data as SubmissionRecord[];
      } else if (error) {
        console.warn('Supabase query error:', error.message);
      }
    } catch (err) {
      console.warn('Supabase fetch failed, falling back to local storage:', err);
    }
  }

  // Fallback to local storage
  const local = readLocalSubmissions();
  if (userId) {
    const userSpecific = local.filter((s) => s.user_id === userId);
    return userSpecific.length > 0 ? userSpecific : local;
  }
  return local;
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
  const raw = (readyCount * 6.5) + (practicingCount * 3.0);
  return Math.min(100, Math.max(25, Math.round(raw)));
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
