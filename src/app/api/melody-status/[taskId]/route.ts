// src/app/api/melody-status/[taskId]/route.ts
import { createClient } from '@supabase/supabase-js'; // Use createClient for JWT auth
import { NextResponse, NextRequest } from 'next/server';
import { Database } from '@/types/supabase';
import { withRateLimit, ActionType } from '@/services/rate-limiter';

// Initialize Supabase client with anon key
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl) {
  throw new Error('Missing environment variable NEXT_PUBLIC_SUPABASE_URL');
}
if (!supabaseAnonKey) {
  throw new Error('Missing environment variable NEXT_PUBLIC_SUPABASE_ANON_KEY');
}

// --- GET handler (existing logic for fetching task status) ---
export async function GET(
  req: Request,
  routeContext: { params: { taskId: string } } // Renamed second argument
) {
  // Explicitly await the resolution of params as hinted by the error message
  const params = await Promise.resolve(routeContext.params); 
  const taskId = params.taskId;

  if (!taskId) {
    console.error('Task ID is missing from request parameters');
    return NextResponse.json({ error: 'Task ID is required' }, { status: 400 });
  }

  // Read the Authorization header for JWT
  const authHeader = req.headers.get('Authorization');
  const jwt = authHeader?.split(' ')[1];

  if (!jwt) {
    console.error(`No JWT found in Authorization header for task ${taskId}`);
    return NextResponse.json({ error: 'Unauthorized - No token provided' }, { status: 401 });
  }

  try {
    // Initialize Supabase client with the JWT for authentication
    const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
      global: {
        headers: { Authorization: `Bearer ${jwt}` },
      },
    });

    // Verify the JWT and get the user
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
      console.error(`JWT verification failed or user not found for task ${taskId}:`, userError?.message);
      return NextResponse.json({ error: 'Unauthorized - Invalid token' }, { status: 401 });
    }

    const userId = user.id;

    // Fetch the task using the task ID and ensuring the user_id matches the authenticated user
    // RLS on tasks should allow this select for authenticated users matching their own user_id
    const { data: task, error } = await supabase
      .from('tasks')
      .select('id, status, midi_data, description, error_message, created_at, updated_at')
      .eq('id', taskId)
      .eq('user_id', userId) // Ensure the authenticated user can only access their own tasks
      .single();

    if (error) {
      console.error(`Error fetching task ${taskId} for user ${userId}:`, error.message);
      // PGRST116: "object not found in search path" - often indicates RLS denied access or task doesn't exist/belong to user
      if (error.code === 'PGRST116') {
         return NextResponse.json({ error: 'Task not found or access denied' }, { status: 404 });
      }
      return NextResponse.json({ error: 'Failed to fetch task status' }, { status: 500 });
    }

    if (!task) {
       // This case might be hit if the task exists but doesn't belong to the user due to RLS,
       // or if the task simply doesn't exist.
       console.warn(`Task ${taskId} not found or does not belong to user ${userId}`);
       return NextResponse.json({ error: 'Task not found or access denied' }, { status: 404 });
    }

    return NextResponse.json(task, { status: 200 });

  } catch (error: any) {
    console.error(`An unexpected error occurred while fetching task ${taskId}:`, error.message);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// --- POST handler (Placeholder for Iteration/Refinement) ---
// This handler will be wrapped with rate limiting
const handleIterationPost = async (
  req: NextRequest,
  routeContext: { params: { taskId: string } }
) => {
   const params = await Promise.resolve(routeContext.params); 
   const taskId = params.taskId;

  if (!taskId) {
    console.error('Task ID is missing from request parameters for POST');
    return NextResponse.json({ error: 'Task ID is required' }, { status: 400 });
  }

  // Read the Authorization header for JWT
  const authHeader = req.headers.get('Authorization');
  const jwt = authHeader?.split(' ')[1];

  if (!jwt) {
    console.error(`No JWT found in Authorization header for task ${taskId} POST`);
    return NextResponse.json({ error: 'Unauthorized - No token provided' }, { status: 401 });
  }

  try {
    // Initialize Supabase client with the JWT for authentication
    const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
      global: {
        headers: { Authorization: `Bearer ${jwt}` },
      },
    });

    // Verify the JWT and get the user
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
      console.error(`JWT verification failed or user not found for task ${taskId} POST:`, userError?.message);
      return NextResponse.json({ error: 'Unauthorized - Invalid token' }, { status: 401 });
    }

    const userId = user.id;

    // TODO: Implement actual iteration/refinement logic here.
    // - Fetch the task using taskId and userId to ensure ownership.
    // - Process the request body for refinement parameters.
    // - Potentially create a new task linked to the original, or update the existing one.
    // - Trigger the Edge Function or other backend process for iteration.

    console.log(`Received iteration request for task ${taskId} from user ${userId}.`);

    // Placeholder success response
    return NextResponse.json({ message: `Iteration request for task ${taskId} received.` }, { status: 202 });

  } catch (error: any) {
    console.error(`An unexpected error occurred during iteration for task ${taskId}:`, error.message);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
};

// Wrap the POST handler with user-based rate limiting for iteration
export const POST = withRateLimit(
  handleIterationPost, // Your iteration request handler
  ActionType.Iteration, // The action type for rate limiting
  async (req: Request) => { // Function to get the identifier (User ID)
    // This function needs to get the user ID from the request
    const authHeader = req.headers.get('Authorization');
    const jwt = authHeader?.split(' ')[1];

    if (!jwt) {
      console.warn('No JWT found in iteration route for rate limiter identifier.');
      return undefined; // No JWT means no authenticated user ID
    }

    try {
       const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
        global: {
          headers: { Authorization: `Bearer ${jwt}` },
        },
      });

      const { data: { user }, error: userError } = await supabase.auth.getUser();

      if (userError || !user) {
        console.warn('Failed to get user for iteration rate limiter identifier.', userError?.message);
        return undefined; // Return undefined if user cannot be authenticated
      }

      return user.id; // Use user ID as the identifier

    } catch (error) {
      console.error('Error extracting user ID for iteration rate limiting:', error);
      return undefined; // Return undefined on error
    }
  }
);
