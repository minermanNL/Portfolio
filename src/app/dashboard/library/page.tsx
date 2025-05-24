// src/app/dashboard/library/page.tsx
import type { Metadata } from 'next';
import { MelodyList } from '@/components/dashboard/MelodyList';
// import { cookies } from 'next/headers'; // Remove this import
// import { createServerClient, type CookieOptions } from '@supabase/ssr'; // Remove this import
import { createServerComponentClient } from '@/lib/supabase/server-factory'; // Import the factory function
import { headers } from 'next/headers'; // Import headers
import { parseCookieHeader } from '@/lib/utils/cookie-parser'; // Import the parser utility

export const metadata: Metadata = {
  title: 'Melody Library - Tricion Studio',
  description: 'Browse, search, and manage your melodies at Tricion Studio.',
};

export default async function MelodyLibraryPage() {
  console.log('[MelodyLibraryPage SC] Rendering...');

  // Access and parse the cookie header from the incoming request headers
  const headersList = headers();
  const cookieHeader = headersList.get('Cookie');
  const parsedCookies = parseCookieHeader(cookieHeader);
  console.log('[MelodyLibraryPage SC] Parsed cookies:', parsedCookies);


  // Use the factory function to create the Supabase client with parsed cookies
  const supabase = createServerComponentClient(parsedCookies);

  console.log('[MelodyLibraryPage SC] Attempting to fetch session...');
  // The getSession call will now use the manually provided cookies
  const { data: { session }, error: sessionError } = await supabase.auth.getSession();

  if (sessionError) {
    console.error('[MelodyLibraryPage SC] Error fetching session:', sessionError.message);
    return <div>Error loading session: {sessionError.message}. Please try logging in again.</div>;
  }

  console.log('[MelodyLibraryPage SC] Session data: ', session ? `User ID: ${session.user.id}` : 'No session');

  let melodies: any[] = [];
  let fetchError: string | null = null;

  if (session) {
    console.log('[MelodyLibraryPage SC] Session found, fetching melodies for user ID: ', session.user.id);
    const { data, error } = await supabase
      .from('melodies')
      .select('*')
      .eq('user_id', session.user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('[MelodyLibraryPage SC] Error fetching melodies:', error);
      fetchError = error.message;
    } else {
      melodies = data || [];
      console.log(`[MelodyLibraryPage SC] Fetched ${melodies.length} melodies.`);
    }
  } else {
    console.log('[MelodyLibraryPage SC] No active session. Not fetching melodies for unauthenticated state.');
    // You might want to display a login prompt or redirect here
  }

  if (fetchError) {
    return <div>Error loading melodies: {fetchError}</div>;
  }

  return <MelodyList melodies={melodies} />;
}