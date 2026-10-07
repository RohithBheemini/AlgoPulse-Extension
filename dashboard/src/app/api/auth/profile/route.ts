import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';

export async function GET() {
  try {
    const supabase = createServerSupabaseClient();
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json({ authenticated: false, profile: null });
    }

    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (profileError || !profile) {
      return NextResponse.json({
        authenticated: true,
        user,
        profile: {
          id: user.id,
          email: user.email,
          extension_token: 'ap_sec_default'
        }
      });
    }

    return NextResponse.json({
      authenticated: true,
      user,
      profile
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || 'Failed to fetch user profile' },
      { status: 500 }
    );
  }
}
