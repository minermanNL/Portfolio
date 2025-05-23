// src/middleware.ts
import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  // Log all incoming cookies available to the middleware
  console.log('[Middleware] Incoming cookies:');
  request.cookies.getAll().forEach(cookie => {
    console.log(`- ${cookie.name}: ${cookie.value.substring(0, 20) + '...'}`);
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          console.log(`[Middleware] Attempting to get cookie: ${name}`);
          return request.cookies.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          console.log(`[Middleware] Setting cookie: ${name}, Value (truncated): ${value.substring(0, 20) + '...'}, Options:`, options);
          response.cookies.set({
            name,
            value,
            ...options,
          });
        },
        remove(name: string, options: CookieOptions) {
          console.log(`[Middleware] Removing cookie: ${name}, Options:`, options);
          response.cookies.set({
            name,
            value: '',
            ...options,
            maxAge: 0,
          });
          for (let i = 0; i < 10; i++) {
            response.cookies.set({
                name: `${name}.${i}`,
                value: '',
                ...options,
                maxAge: 0,
            });
          }
        },
      },
    }
  );

  console.log('[Middleware] Calling getSession...');
  const { data: { session }, error } = await supabase.auth.getSession();
  console.log('[Middleware] getSession finished. Session:', session ? 'Found' : 'None', 'Error:', error);


  const setCookieHeaders = response.headers.getSetCookie();
  if (setCookieHeaders.length > 0) {
      console.log('[Middleware] Set-Cookie headers on outgoing response:', setCookieHeaders);
  } else {
      console.log('[Middleware] No Set-Cookie headers added to outgoing response.');
  }


  return response;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|assets|api/auth).*)',
  ],
};
