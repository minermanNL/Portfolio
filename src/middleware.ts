// src/middleware.ts
import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  // Create a response object that will be returned by the middleware.
  // This is where any refreshed cookies will be set.
  const response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          // Get cookies from the incoming request
          return request.cookies.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          // CORRECTED: Use response.cookies.set() directly.
          // Next.js handles adding the Set-Cookie header correctly.
          // Do NOT manually append 'Set-Cookie' header if using response.cookies.set.
          response.cookies.set({
            name,
            value,
            ...options,
          });
        },
        remove(name: string, options: CookieOptions) {
          // CORRECTED: Use response.cookies.set() to clear the cookie.
          // Next.js handles adding the Set-Cookie header correctly.
          response.cookies.set({
            name,
            value: '', // Set value to empty
            ...options,
            maxAge: 0, // Set maxAge to 0 for immediate expiration
          });
        },
      },
    }
  );

  // Refresh session if expired and set new cookies
  // This call triggers the `get`, `set`, and `remove` methods defined above,
  // which will now correctly modify the `response` object's cookies.
  await supabase.auth.getSession();

  // Return the response, which now contains any updated cookies.
  return response;
}

// Configure the middleware to run on all paths except for static files, image optimization, and the favicon
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - assets (public assets)
     * - api/auth (Supabase auth routes - middleware should not interfere with their initial cookie setting)
     * - _next/data (Next.js data fetches, which might sometimes need to bypass middleware for specific cookie handling)
     */
    '/((?!_next/static|_next/image|favicon.ico|assets|api/auth|_next/data).*)',
  ],
};