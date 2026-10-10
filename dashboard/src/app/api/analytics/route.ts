import { NextRequest, NextResponse } from 'next/server';
import { getAnalyticsSummary } from '@/lib/storage';
import { createServerSupabaseClient } from '@/lib/supabase/server';

export async function GET(req: NextRequest) {
  try {
    let userId: string | undefined = req.nextUrl.searchParams.get('userId') || undefined;

    if (!userId) {
      try {
        const supabase = createServerSupabaseClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          userId = user.id;
        }
      } catch {
        // Not authenticated
      }
    }

    const summary = await getAnalyticsSummary(userId);
    return NextResponse.json(summary, {
      headers: {
        'Access-Control-Allow-Origin': '*'
      }
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || 'Failed to fetch analytics' },
      { status: 500, headers: { 'Access-Control-Allow-Origin': '*' } }
    );
  }
}
