// src/lib/supabase/server-factory.ts
import { createServerClient } from '@supabase/ssr';
// import { cookies } from 'next/headers'; // Remove this import
import { Database } from '@/types/supabase'; // Adjust the path

// Modify the factory to accept the parsed cookies object
export function createServerComponentClient(cookies: { [key: string]: string }) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

  return createServerClient<Database>(
    supabaseUrl,
    supabaseAnonKey,
    {
      cookies: {
        get(name: string) {
          // Access the manually provided cookies object
          const value = cookies[name];
          console.log(`[createServerComponentClient - cookies.get] Getting cookie: ${name}, Value: ${value ? value.substring(0, 20) + '...' : 'undefined'}`);
          return value;
        },
        // set and remove are typically not needed for read-only Server Components
        // If you need them (e.g., in Server Actions), you'll need a different strategy
        // or handle them separately.
        // These are likely not needed here as the primary source of truth for auth cookies
        // in this workaround will be the middleware and client-side actions.
      },
    }
  );
}