"use client";

import type { Session, SupabaseClient } from '@supabase/supabase-js';
import { createContext, useContext, useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { AppUser } from '@/types';
import { usePathname, useRouter } from 'next/navigation';

type AuthContextType = {
  supabase: SupabaseClient;
  session: Session | null;
  user: AppUser | null;
  isLoading: boolean;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthSessionProvider({ children }: { children: React.ReactNode }) {
  const supabase = createClient();
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<AppUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    setIsLoading(true);
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
        setUser(session?.user as AppUser ?? null);
        setIsLoading(false);
      }
    );

    // Initial check
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user as AppUser ?? null);
      setIsLoading(false);
    });
    
    return () => subscription.unsubscribe();
  }, [supabase.auth, router]);


  useEffect(() => {
    if (!isLoading) {
      const isAuthPage = pathname?.startsWith('/login') || pathname?.startsWith('/signup');
      if (session && isAuthPage) {
        router.replace('/dashboard');
      } else if (!session && pathname?.startsWith('/dashboard')) {
        router.replace('/login');
      }
    }
  }, [session, isLoading, pathname, router]);


  const signOut = async () => {
    await supabase.auth.signOut();
    router.push('/login'); 
  };

  const value = {
    supabase,
    session,
    user,
    isLoading,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuthSession() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuthSession must be used within an AuthSessionProvider');
  }
  return context;
}
