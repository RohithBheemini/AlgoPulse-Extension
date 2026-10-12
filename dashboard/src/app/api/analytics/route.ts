import { NextRequest } from 'next/server';
import { getAnalyticsSummary } from '@/lib/storage';
import {
  handleOptionsResponse,
  jsonResponse,
  errorResponse,
  resolveUserFromRequest
} from '@/lib/api-utils';

export async function OPTIONS() {
  return handleOptionsResponse(['GET', 'OPTIONS']);
}

export async function GET(req: NextRequest) {
  try {
    const { userId } = await resolveUserFromRequest(req);
    const summary = await getAnalyticsSummary(userId);

    return jsonResponse(summary);
  } catch (err: any) {
    console.error('Analytics endpoint error:', err);
    return errorResponse(
      'Failed to compute analytics summary. Please try again.',
      500
    );
  }
}
