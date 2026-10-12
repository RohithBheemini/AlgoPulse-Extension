import { NextRequest } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { getAdminClient } from '@/lib/supabase/admin';
import {
  handleOptionsResponse,
  jsonResponse,
  errorResponse
} from '@/lib/api-utils';

export async function OPTIONS() {
  return handleOptionsResponse(['GET', 'OPTIONS']);
}

export async function GET(req: NextRequest) {
  try {
    // 1. Check if token is passed via Authorization: Bearer <token>
    const authHeader = req.headers.get('authorization') || '';
    const tokenMatch = authHeader.match(/^Bearer\s+(.+)$/i);
    const token = tokenMatch ? tokenMatch[1].trim() : '';

    if (token) {
      const admin = getAdminClient();
      if (admin) {
        const { data: profile, error } = await admin
          .from('profiles')
          .select('id, email, display_name, extension_token, created_at')
          .eq('extension_token', token)
          .single();

        if (profile && !error) {
          return jsonResponse({
            authenticated: true,
            authMethod: 'bearer',
            user: { id: profile.id, email: profile.email },
            profile
          });
        }
      }
    }

    // 2. Fallback to Supabase cookie session
    try {
      const supabase = createServerSupabaseClient();
      const { data: { user }, error: userError } = await supabase.auth.getUser();

      if (!userError && user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('id, email, display_name, extension_token, created_at')
          .eq('id', user.id)
          .single();

        return jsonResponse({
          authenticated: true,
          authMethod: 'session',
          user: { id: user.id, email: user.email },
          profile: profile || {
            id: user.id,
            email: user.email,
            display_name: user.email?.split('@')[0] || 'Developer',
            extension_token: `ap_sec_${user.id.replace(/-/g, '').substring(0, 16)}`
          }
        });
      }
    } catch {
      // Cookie session lookup omitted
    }

    // Unauthenticated
    return jsonResponse({
      authenticated: false,
      authMethod: 'none',
      profile: null
    });
  } catch (err: any) {
    console.error('Auth profile endpoint error:', err);
    return errorResponse(
      'Failed to resolve user profile.',
      500
    );
  }
}
