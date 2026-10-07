import fs from 'fs';
import path from 'path';
import { createClient } from '@supabase/supabase-js';
import { SubmissionRecord, AnalyticsSummary } from './types';

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
    user_time_complexity: 'O(N)',
    user_space_complexity: 'O(N)',
    optimal_time_complexity: 'O(N)',
    optimal_space_complexity: 'O(N)',
    summary_feedback: 'Optimal single-pass hash map approach. Excellent time complexity.',
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
    created_at: new Date(Date.now() - 3600 * 1000 * 24 * 3).toISOString()
  }
];

function readLocalSubmissions(): SubmissionRecord[] {
  try {
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    if (!fs.existsSync(localFilePath)) {
      fs.writeFileSync(localFilePath, JSON.stringify(INITIAL_SEED_DATA, null, 2), 'utf8');
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
        query = query.eq('user_id', userId);
      }

      const { data, error } = await query;

      if (!error && data) {
        return data as SubmissionRecord[];
      } else if (error) {
        console.warn('Supabase query error:', error.message);
      }
    } catch (err) {
      console.warn('Supabase fetch failed, falling back to local storage:', err);
    }
  }

  return readLocalSubmissions();
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
      console.warn('Supabase insert failed, saving to local storage fallback:', err);
    }
  }

  // Local storage save
  const existing = readLocalSubmissions();
  const updated = [newRecord, ...existing];
  writeLocalSubmissions(updated);
  return newRecord;
}

export async function getAnalyticsSummary(userId?: string): Promise<AnalyticsSummary> {
  const subs = await getAllSubmissions(userId);

  if (subs.length === 0) {
    return {
      totalSubmissions: 0,
      averageScore: 0,
      averageOptimality: 0,
      averageTimeScore: 0,
      averageSpaceScore: 0,
      difficultyCounts: { Easy: 0, Medium: 0, Hard: 0 },
      recentTrend: []
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
    recentTrend
  };
}
