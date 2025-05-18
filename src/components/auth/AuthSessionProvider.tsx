"use client";

import { createContext, useContext, useEffect, useState } from 'react';
import { createClientComponentClient, Session, User } from '@supabase/auth-helpers-nextjs';
import { useRouter } from 'next/navigation';
import { Database } from '@/types/supabase'; // Import your Database type

// Define the shape of the context data
interface AuthContextType {
  supabase: ReturnType<typeof createClientComponentClient>;
  session: Session | null;
  user: User | null;
  isLoading: boolean; // Add loading state
  signOut: () => Promise<void>;
}

// Create the context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Create the provider component
export function AuthSessionProvider({ children }: { children: React.ReactNode }) {
  // Configure cookie options to only look for cookies starting with 'sb-'
  // This helps ignore other potentially malformed cookies from the environment
  const supabase = createClientComponentClient<Database>({
    cookieOptions: {
      name: 'sb'
    }
  });
  
  const router = useRouter();
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true); // Initial loading state

  useEffect(() => {
    // Fetch the initial session and user
    const getInitialSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        setSession(session);
        setUser(session?.user ?? null);
      } catch (e) {
        console.error('Error fetching initial session:', e);
        setSession(null);
        setUser(null);
      } finally {
        setIsLoading(false); // Set loading to false after attempt
      }
    };

    getInitialSession();

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('Auth state changed:', event, session);
      setSession(session);
      setUser(session?.user ?? null);
      // Handle redirects based on auth state if needed
      // e.g., if (event === 'SIGNED_OUT') router.push('/login');
    });

    // Cleanup the subscription
    return () => {
      subscription.unsubscribe();
    };
  }, [supabase, router]); // Add dependencies

  const signOut = async () => {
    setIsLoading(true);
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('Error signing out:', error);
    }
     // Update state immediately on sign out event (handled by auth.onAuthStateChange) or manually
    setSession(null);
    setUser(null);
    setIsLoading(false);
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
