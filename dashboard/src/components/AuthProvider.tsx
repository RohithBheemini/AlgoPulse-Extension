'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { User } from '@supabase/supabase-js';
import { createClient } from '@/lib/supabase/client';

export interface UserProfile {
  id: string;
  email: string;
  display_name: string | null;
  extension_token: string;
}

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  profile: null,
  loading: true,
  signOut: async () => {},
  refreshProfile: async () => {},
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const supabase = createClient();

  const fetchProfile = async (userId: string, userEmail?: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (!error && data) {
        setProfile(data as UserProfile);
        return;
      }

      // If profile does not exist yet (e.g. trigger was not configured), auto-provision it
      const defaultToken = `ap_sec_${userId.replace(/-/g, '').substring(0, 16)}`;
      const email = userEmail || user?.email || '';
      const initialProfile: UserProfile = {
        id: userId,
        email: email,
        display_name: email.split('@')[0] || 'Developer',
        extension_token: defaultToken
      };

      try {
        const { data: inserted, error: insertErr } = await supabase
          .from('profiles')
          .upsert([initialProfile])
          .select()
          .single();

        if (!insertErr && inserted) {
          setProfile(inserted as UserProfile);
          return;
        }
      } catch {
        // Fallback if client upsert is restricted by RLS
      }

      setProfile(initialProfile);
    } catch (err) {
      console.warn('Could not load profile:', err);
    }
  };

  const refreshProfile = async () => {
    if (user?.id) {
      await fetchProfile(user.id, user.email);
    }
  };

  useEffect(() => {
    let mounted = true;

    async function initAuth() {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (mounted) {
          setUser(session?.user || null);
          if (session?.user?.id) {
            await fetchProfile(session.user.id, session.user.email);
          }
        }
      } catch (err) {
        console.warn('Supabase auth session check failed:', err);
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }

      const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
        if (!mounted) return;
        setUser(session?.user || null);
        if (session?.user?.id) {
          await fetchProfile(session.user.id, session.user.email);
        } else {
          setProfile(null);
        }
        setLoading(false);
      });

      return () => {
        subscription.unsubscribe();
      };
    }

    initAuth();

    return () => {
      mounted = false;
    };
  }, []);

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setProfile(null);
    window.location.href = '/';
  };

  return (
    <AuthContext.Provider value={{ user, profile, loading, signOut, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
