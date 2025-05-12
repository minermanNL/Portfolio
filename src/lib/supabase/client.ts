import { createBrowserClient } from '@supabase/ssr';
import type { Database } from '@/types/supabase';

export function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl) {
    throw new Error(
      'Missing environment variable NEXT_PUBLIC_SUPABASE_URL. Please check your .env or .env.local file and ensure the Next.js server is restarted.'
    );
  }
  if (!supabaseAnonKey) {
     throw new Error(
      'Missing environment variable NEXT_PUBLIC_SUPABASE_ANON_KEY. Please check your .env or .env.local file and ensure the Next.js server is restarted.'
    );
  }

  try {
    // Validate URL format before passing to Supabase
    new URL(supabaseUrl);
  } catch (e) {
     throw new Error(
      `Invalid URL format for NEXT_PUBLIC_SUPABASE_URL: "${supabaseUrl}". Please check your .env or .env.local file.`
    );
  }


  // Define client-side Supabase client
  return createBrowserClient<Database>(
    supabaseUrl,
    supabaseAnonKey
  );
}
