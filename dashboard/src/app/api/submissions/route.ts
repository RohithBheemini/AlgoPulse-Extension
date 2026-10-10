import { NextRequest, NextResponse } from 'next/server';
import { getAllSubmissions, insertSubmission } from '@/lib/storage';
import { getAdminClient } from '@/lib/supabase/admin';
import { createServerSupabaseClient } from '@/lib/supabase/server';

// Enable CORS for Chrome Extension requests
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization'
    }
  });
}

export async function GET(req: NextRequest) {
  try {
    let userId: string | undefined = req.nextUrl.searchParams.get('userId') || undefined;

    // If no userId query param, check if authenticated via Supabase session cookie
    if (!userId) {
      try {
        const supabase = createServerSupabaseClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          userId = user.id;
        }
      } catch {
        // Not authenticated via cookies, return public submissions
      }
    }

    const submissions = await getAllSubmissions(userId);
    return NextResponse.json(submissions, {
      headers: {
        'Access-Control-Allow-Origin': '*'
      }
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || 'Failed to fetch submissions' },
      { status: 500, headers: { 'Access-Control-Allow-Origin': '*' } }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization') || '';
    const token = authHeader.replace(/^Bearer\s+/i, '').trim();

    let userId: string | undefined = undefined;

    // 1. Look up user by extension token in Supabase
    const admin = getAdminClient();
    if (admin && token) {
      const { data: profile } = await admin
        .from('profiles')
        .select('id')
        .eq('extension_token', token)
        .single();

      if (profile) {
        userId = profile.id;
      }
    }

    // 2. Fallback: check if session cookie is present
    if (!userId) {
      try {
        const supabase = createServerSupabaseClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          userId = user.id;
        }
      } catch {
        // Ignore
      }
    }

    const body = await req.json();

    // 3. Fallback: check if user_id was passed in body
    if (!userId && body.user_id) {
      userId = body.user_id;
    }

    if (!body.problem_title || !body.user_code || body.overall_score === undefined) {
      return NextResponse.json(
        { error: 'Missing required fields (problem_title, user_code, overall_score).' },
        { status: 400, headers: { 'Access-Control-Allow-Origin': '*' } }
      );
    }

    const newRecord = await insertSubmission({
      user_id: userId,
      problem_title: body.problem_title,
      problem_slug: body.problem_slug || 'unknown',
      platform: body.platform || 'leetcode',
      difficulty: body.difficulty || 'Medium',
      language: body.language || 'python3',
      user_code: body.user_code,
      overall_score: Number(body.overall_score),
      optimality_score: Number(body.optimality_score || 0),
      time_score: Number(body.time_score || 0),
      space_score: Number(body.space_score || 0),
      cleanliness_score: Number(body.cleanliness_score || 0),
      user_time_complexity: body.user_time_complexity || 'N/A',
      user_space_complexity: body.user_space_complexity || 'N/A',
      optimal_time_complexity: body.optimal_time_complexity || 'N/A',
      optimal_space_complexity: body.optimal_space_complexity || 'N/A',
      why_suboptimal: body.why_suboptimal || '',
      why_ideal: body.why_ideal || '',
      summary_feedback: body.summary_feedback || '',
      improvements: Array.isArray(body.improvements) ? body.improvements : [],
      optimal_code: body.optimal_code || ''
    });

    return NextResponse.json(
      {
        success: true,
        message: 'Submission successfully recorded!',
        submission: newRecord,
        userId: userId || null
      },
      {
        status: 201,
        headers: {
          'Access-Control-Allow-Origin': '*'
        }
      }
    );
  } catch (err: any) {
    console.error('Error saving submission:', err);
    return NextResponse.json(
      { error: err.message || 'Failed to save submission' },
      { status: 500, headers: { 'Access-Control-Allow-Origin': '*' } }
    );
  }
}
