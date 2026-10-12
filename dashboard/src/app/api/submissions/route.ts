import { NextRequest } from 'next/server';
import { getAllSubmissions, insertSubmission } from '@/lib/storage';
import {
  handleOptionsResponse,
  jsonResponse,
  errorResponse,
  resolveUserFromRequest,
  generateDefaultFollowUps
} from '@/lib/api-utils';

export async function OPTIONS() {
  return handleOptionsResponse(['GET', 'POST', 'OPTIONS']);
}

export async function GET(req: NextRequest) {
  try {
    const { userId } = await resolveUserFromRequest(req);
    let submissions = await getAllSubmissions(userId);

    // Filter by platform if specified (e.g., ?platform=leetcode)
    const platform = req.nextUrl.searchParams.get('platform');
    if (platform) {
      const cleanPlatform = platform.toLowerCase().trim();
      submissions = submissions.filter((s) =>
        s.platform?.toLowerCase().includes(cleanPlatform)
      );
    }

    // Filter by difficulty if specified (e.g., ?difficulty=Medium)
    const difficulty = req.nextUrl.searchParams.get('difficulty');
    if (difficulty) {
      const cleanDiff = difficulty.toLowerCase().trim();
      const targetDiff = ['easy', 'basic', 'school'].includes(cleanDiff) ? 'easy' : cleanDiff;
      submissions = submissions.filter(
        (s) => s.difficulty?.toLowerCase() === targetDiff
      );
    }

    // Optional limit parameter (e.g., ?limit=10)
    const limitParam = req.nextUrl.searchParams.get('limit');
    if (limitParam) {
      const limit = parseInt(limitParam, 10);
      if (!isNaN(limit) && limit > 0) {
        submissions = submissions.slice(0, Math.min(limit, 500));
      }
    }

    return jsonResponse(submissions);
  } catch (err: any) {
    console.error('Error fetching submissions:', err);
    return errorResponse('Failed to fetch submissions', 500);
  }
}

export async function POST(req: NextRequest) {
  try {
    const { userId } = await resolveUserFromRequest(req);

    // Safely parse JSON body
    let body: any;
    try {
      body = await req.json();
    } catch {
      return errorResponse(
        'Invalid JSON payload provided in request body.',
        400
      );
    }

    if (!body || typeof body !== 'object') {
      return errorResponse('Request body must be a valid JSON object.', 400);
    }

    // Validate required fields
    if (
      !body.problem_title ||
      typeof body.problem_title !== 'string' ||
      body.problem_title.trim().length === 0
    ) {
      return errorResponse('Field "problem_title" is required and must be non-empty.', 400);
    }

    if (
      !body.user_code ||
      typeof body.user_code !== 'string' ||
      body.user_code.trim().length === 0
    ) {
      return errorResponse('Field "user_code" is required and must be non-empty.', 400);
    }

    if (body.overall_score === undefined || isNaN(Number(body.overall_score))) {
      return errorResponse('Field "overall_score" must be a valid number between 0 and 100.', 400);
    }

    // Validate and clamp score bounds (0 to 100)
    const clampScore = (val: any, fallback: number = 0): number => {
      const num = Number(val);
      if (isNaN(num)) return fallback;
      return Math.max(0, Math.min(100, Math.round(num)));
    };

    const overallScore = clampScore(body.overall_score, 0);
    const optimalityScore = clampScore(body.optimality_score, 0);
    const timeScore = clampScore(body.time_score, 0);
    const spaceScore = clampScore(body.space_score, 0);
    const cleanlinessScore = clampScore(body.cleanliness_score, 0);

    // Sanitize platform & difficulty
    const rawPlatform = (body.platform || 'leetcode').toString().toLowerCase().trim();
    const platform = rawPlatform.slice(0, 50);

    const rawDiffLower = (body.difficulty || 'Medium').toString().trim().toLowerCase();
    let difficulty: 'Easy' | 'Medium' | 'Hard' = 'Medium';
    if (['easy', 'basic', 'school'].includes(rawDiffLower)) {
      difficulty = 'Easy';
    } else if (rawDiffLower === 'hard') {
      difficulty = 'Hard';
    } else {
      difficulty = 'Medium';
    }

    // Length-guarded strings
    const problemTitle = body.problem_title.trim().slice(0, 250);
    const problemSlug = (body.problem_slug || 'problem').toString().trim().slice(0, 150);
    const language = (body.language || 'python3').toString().trim().slice(0, 50);
    const userCode = body.user_code.toString().slice(0, 500000); // 500KB cap

    // Senior follow-up questions: use provided array or auto-generate smart defaults
    let followUpQuestions = Array.isArray(body.follow_up_questions) && body.follow_up_questions.length > 0
      ? body.follow_up_questions
      : generateDefaultFollowUps(problemTitle);

    const newRecord = await insertSubmission({
      user_id: userId || body.user_id || undefined,
      problem_title: problemTitle,
      problem_slug: problemSlug,
      platform,
      difficulty,
      language,
      user_code: userCode,
      overall_score: overallScore,
      optimality_score: optimalityScore,
      time_score: timeScore,
      space_score: spaceScore,
      cleanliness_score: cleanlinessScore,
      user_time_complexity: (body.user_time_complexity || 'N/A').toString().slice(0, 200),
      user_space_complexity: (body.user_space_complexity || 'N/A').toString().slice(0, 200),
      optimal_time_complexity: (body.optimal_time_complexity || 'N/A').toString().slice(0, 200),
      optimal_space_complexity: (body.optimal_space_complexity || 'N/A').toString().slice(0, 200),
      why_suboptimal: (body.why_suboptimal || '').toString().slice(0, 2000),
      why_ideal: (body.why_ideal || '').toString().slice(0, 2000),
      summary_feedback: (body.summary_feedback || '').toString().slice(0, 2000),
      improvements: Array.isArray(body.improvements)
        ? body.improvements.slice(0, 10).map((imp: any) => String(imp).slice(0, 300))
        : [],
      optimal_code: (body.optimal_code || '').toString().slice(0, 500000),
      follow_up_questions: followUpQuestions
    });

    return jsonResponse(
      {
        success: true,
        message: 'Submission successfully recorded!',
        submission: newRecord,
        userId: userId || null
      },
      201
    );
  } catch (err: any) {
    console.error('Error saving submission:', err);
    return errorResponse('Failed to record submission.', 500);
  }
}
