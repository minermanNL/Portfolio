// src/app/api/melody-status/[taskId]/route.ts
import { createClient } from '@supabase/supabase-js'; // Use createClient for JWT auth
// Remove cookies and createRouteHandlerClient import
import { NextResponse } from 'next/server';
import { Database } from '@/types/supabase';

// Initialize Supabase client with anon key
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl) {
  throw new Error('Missing environment variable NEXT_PUBLIC_SUPABASE_URL');
}
if (!supabaseAnonKey) {
  throw new Error('Missing environment variable NEXT_PUBLIC_SUPABASE_ANON_KEY');
}

export async function GET(
  req: Request,
  { params }: { params: { taskId: string } }
) {
  const { taskId } = params;

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
