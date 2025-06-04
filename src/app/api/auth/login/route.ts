// src/app/api/auth/login/route.ts
import { NextResponse, NextRequest } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { withRateLimit, ActionType } from '@/services/rate-limiter'; // Consider rate limiting login attempts by IP
import { getIpAddress } from '@/lib/get-ip';
import { Database } from '@/types/supabase';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
// Use the Anon key for client-side auth methods like signInWithPassword
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const turnstileSecretKey = process.env.TURNSTILE_SECRET_KEY;

if (!supabaseUrl) {
  throw new Error('Missing environment variable NEXT_PUBLIC_SUPABASE_URL');
}
if (!supabaseAnonKey) {
   throw new Error('Missing environment variable NEXT_PUBLIC_SUPABASE_ANON_KEY');
}
if (!turnstileSecretKey) {
   console.warn('TURNSTILE_SECRET_KEY is missing. Turnstile verification will fail.');
   // In production, you might want to throw an error here
}

// Create a Supabase client with the Anon key for sign-in
const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);

// Main handler logic for login
const handleLoginPost = async (req: NextRequest) => {
  try {
    const { email, password, turnstileToken } = await req.json();

    // Basic validation
    if (!email || !password || !turnstileToken) {
      console.error('Missing required fields in login request');
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // --- Cloudflare Turnstile Verification ---
    if (!turnstileSecretKey) {
        console.error('Turnstile secret key is not configured. Skipping verification.');
         // In a real application, you might return an error if the key is missing in production
    } else {
      const turnstileVerificationUrl = 'https://challenges.cloudflare.com/turnstile/v0/siteverify';
      const turnstileResponse = await fetch(turnstileVerificationUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: `secret=${encodeURIComponent(turnstileSecretKey)}&response=${encodeURIComponent(turnstileToken)}`,
      });

      const turnstileResult = await turnstileResponse.json();

      if (!turnstileResult.success) {
        console.warn('Turnstile verification failed:', turnstileResult['error-codes']);
        return NextResponse.json({ error: 'Bot verification failed', message: 'Please try again.' }, { status: 403 });
      }
      console.log('Turnstile verification successful.');
    }
    // --- End Turnstile Verification ---

    // --- Supabase Login ---
    console.log(`Attempting to log in user: ${email}`);
    const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
      email: email,
      password: password,
    });

    if (loginError) {
      console.error('Supabase login failed:', loginError.message);
       // Supabase returns specific errors for invalid credentials etc.
      return NextResponse.json({ error: 'Login failed', message: loginError.message }, { status: 401 }); // Use 401 for authentication failure
    }

    console.log('Supabase login successful:', loginData);

    // On successful login, Supabase sets HTTP-only cookies in the response,
    // which the browser will handle automatically.
    // The frontend useAuthSession hook should detect the new session.
    return NextResponse.json({ message: 'Login successful' }, { status: 200 });

  } catch (error: any) {
    console.error('An unexpected error occurred in login API route:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
};

// Wrap the handler with IP-based rate limiting for login attempts
// This helps mitigate brute-force attacks on the login endpoint
export const POST = withRateLimit(
  handleLoginPost, // Your original request handler
  ActionType.LoginAttempt, // The action type for rate limiting
  (req: NextRequest) => getIpAddress(req) // Use IP address as the identifier
);
