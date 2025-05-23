// src/app/dashboard/library/page.tsx
import type { Metadata } from 'next';
import { MelodyList } from '@/components/dashboard/MelodyList';
import { cookies } from 'next/headers'; // For Server Components
import { createServerClient, type CookieOptions } from '@supabase/ssr';

export const metadata: Metadata = {
  title: 'Melody Library - Tricion Studio',
  description: 'Browse, search, and manage your melodies at Tricion Studio.',
};

// Make sure this component is explicitly async
export default async function MelodyLibraryPage() {
  console.log('[MelodyLibraryPage SC] Rendering...');

  const currentCookieStore = cookies(); // Get the cookie store from next/headers

  // Log all incoming cookies available to the Server Component
  console.log('[MelodyLibraryPage SC] Incoming cookies from next/headers:');
  // Temporarily comment out the getAll().forEach causing the error to see other logs
  // currentCookieStore.getAll().forEach(cookie => {
  //     console.log(`- ${cookie.name}: ${cookie.value.substring(0, 20) + '...'}`);
  // });
  console.log('[MelodyLibraryPage SC] getAll() logging commented out temporarily.');


  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) { 
          const cookie = currentCookieStore.get(name); // Use the cookieStore obtained at the top
          // Log all attempted cookie reads for debugging chunked cookies
          console.log(`[MelodyLibraryPage SC] Attempting to get cookie: ${name}, Found: ${cookie ? 'Yes' : 'No'}, Value: ${cookie?.value?.substring(0, 20) + '...'}`);
          return cookie?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          console.warn(`[MelodyLibraryPage SC] Attempted to set cookie: ${name} (should be handled by middleware/actions)`);
        },
        remove(name: string, options: CookieOptions) {
          console.warn(`[MelodyLibraryPage SC] Attempted to remove cookie: ${name} (should be handled by middleware/actions)`);
        },
      },
    }
  );

  console.log('[MelodyLibraryPage SC] Attempting to fetch session...');
  const { data: { session }, error: sessionError } = await supabase.auth.getSession();

  if (sessionError) {
    console.error('[MelodyLibraryPage SC] Error fetching session:', sessionError.message);
    return <div>Error loading session: {sessionError.message}. Please try logging in again.</div>;
  }

  console.log('[MelodyLibraryPage SC] Session data:', session ? `User ID: ${session.user.id}` : 'No session');

  let melodies: any[] = [];
  let fetchError: string | null = null;

  if (session) {
    console.log('[MelodyLibraryPage SC] Session found, fetching melodies for user ID:', session.user.id);
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
    console.log('[MelodyLibraryPage SC] No active session. Not fetching melodies.');
  }

  if (fetchError) {
    return <div>Error loading melodies: {fetchError}</div>;
  }

  return <MelodyList melodies={melodies} />;
}
