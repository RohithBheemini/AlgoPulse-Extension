import { NextResponse } from 'next/server';
import { getAnalyticsSummary } from '@/lib/storage';

export async function GET() {
  try {
    const summary = await getAnalyticsSummary();
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
