// src/app/api/auth/signup/route.ts
import { NextResponse, NextRequest } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { withRateLimit, ActionType } from '@/services/rate-limiter';
import { getIpAddress } from '@/lib/get-ip';
import { Database } from '@/types/supabase';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const turnstileSecretKey = process.env.TURNSTILE_SECRET_KEY;

if (!supabaseUrl) {
  throw new Error('Missing environment variable NEXT_PUBLIC_SUPABASE_URL');
}
if (!supabaseServiceRoleKey) {
   throw new Error('Missing environment variable SUPABASE_SERVICE_ROLE_KEY');
}
if (!turnstileSecretKey) {
   console.warn('TURNSTILE_SECRET_KEY is missing. Turnstile verification will fail.');
   // In production, you might want to throw an error here
}

// Create a Supabase client with the service role key for server-side operations
const supabase = createClient<Database>(supabaseUrl, supabaseServiceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

// Main handler logic for signup
const handleSignupPost = async (req: NextRequest) => {
  try {
    const { email, password, turnstileToken } = await req.json();

    // Basic validation
    if (!email || !password || !turnstileToken) {
      console.error('Missing required fields in signup request');
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

    // --- Supabase Signup ---
    console.log(`Attempting to sign up user: ${email}`);
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email: email,
      password: password,
      // Add any options like emailRedirectTo if needed
      // options: { emailRedirectTo: `${req.nextUrl.origin}/auth/callback` }
    });

    if (signUpError) {
      console.error('Supabase signup failed:', signUpError.message);
       // Map Supabase errors to appropriate HTTP responses if necessary
      return NextResponse.json({ error: 'Signup failed', message: signUpError.message }, { status: 400 }); // Use 400 for bad request (e.g., user exists)
    }

    console.log('Supabase signup successful:', signUpData);

    // Determine response based on Supabase behavior (e.g., email confirmation required)
    const message = signUpData.user && signUpData.user.identities && signUpData.user.identities.length > 0
      ? 'Signup successful!'
      : 'Please check your email to confirm your account.';

    const description = signUpData.user && signUpData.user.identities && signUpData.user.identities.length > 0
      ? 'You can now log in.'
      : 'A confirmation link has been sent to your email address.';

    return NextResponse.json({ message, description }, { status: 200 });

  } catch (error: any) {
    console.error('An unexpected error occurred in signup API route:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
};

// Wrap the handler with IP-based rate limiting for account creation
export const POST = withRateLimit(
  handleSignupPost, // Your original request handler
  ActionType.AccountCreation, // The action type for rate limiting
  (req: NextRequest) => getIpAddress(req) // Function to get the identifier (IP address)
);
