// src/app/api/generate-melody-task/route.ts
import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';
import { Database } from '@/types/supabase';
// Removed the direct import of generateMelodyFromPrompt

// Initialize Supabase client with anon key for user authentication via JWT
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY; // We'll pass this to the Edge Function

if (!supabaseUrl) {
  throw new Error('Missing environment variable NEXT_PUBLIC_SUPABASE_URL');
}
if (!supabaseAnonKey) {
  throw new Error('Missing environment variable NEXT_PUBLIC_SUPABASE_ANON_KEY');
}
if (!supabaseServiceRoleKey) {
   // The API route doesn't strictly NEED service role key anymore, but the Edge Function will.
   // Keep this check or move it to the Edge Function code.
   console.warn('SUPABASE_SERVICE_ROLE_KEY is missing. Edge Function might fail.');
}

export async function POST(req: Request) {
  const authHeader = req.headers.get('Authorization');
  const jwt = authHeader?.split(' ')[1];

  if (!jwt) {
    console.error('No JWT found in Authorization header in generate-melody-task route');
    return NextResponse.json({ error: 'Unauthorized - No token provided' }, { status: 401 });
  }

  try {
    const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
      global: {
        headers: { Authorization: `Bearer ${jwt}` },
      },
    });

    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
      console.error('JWT verification failed or user not found in generate-melody-task route:', userError?.message);
      return NextResponse.json({ error: 'Unauthorized - Invalid token' }, { status: 401 });
    }

    const userId = user.id;

    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', userId)
      .single();

    if (profileError || !profile) {
      console.error('Error fetching profile for user', userId, ' in generate-melody-task route:', profileError);
      return NextResponse.json({ error: 'User profile not found or access denied' }, { status: 404 });
    }

    const profileId = profile.id;
    const { prompt } = await req.json();

    // Insert the task into the database with the authenticated user's ID
    const { data: task, error: taskError } = await supabase
      .from('tasks')
      .insert([
        {
          user_id: profileId,
          prompt: prompt,
          status: 'PENDING',
        },
      ])
      .select('id') // Select the newly created task's ID
      .single();

    if (taskError || !task) {
      console.error('Error inserting task in generate-melody-task route:', taskError);
      return NextResponse.json({ error: 'Failed to create task' }, { status: 500 });
    }

    const taskId = task.id;

    console.log(`Task created for user ${userId} with ID: ${taskId}. Attempting to call Edge Function.`);

    // --- Call the Supabase Edge Function asynchronously ---
    // We use the anon key for the Edge Function call, but the function itself
    // should handle permissions/auth using the task ID and service role key.
    // Replace 'generate-melody-task' with the actual name of your Edge Function.
    // The Edge Function will need access to the task ID and prompt.
    
    // NOTE: You might need to pass the service role key securely to the Edge Function
    // This can be done via environment variables configured for the Edge Function in Supabase.
    const edgeFunctionUrl = `${supabaseUrl}/functions/v1/generate-melody-task`; // Adjust if function name/path is different
    
    fetch(edgeFunctionUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${supabaseAnonKey}`, // Call Edge Function with anon key
        // You MIGHT need to pass the service Role Key here depending on Edge Function setup,
        // but using Edge Function secrets is more secure.
        // 'X-Service-Role': process.env.SUPABASE_SERVICE_ROLE_KEY // Less secure way to pass service role key
      },
      body: JSON.stringify({
        taskId: taskId,
        prompt: prompt,
        // Pass service role key if not using Edge Function secrets
        // serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY
      }),
    })
      .then(response => {
        if (!response.ok) {
          console.error(`Error calling Edge Function for task ${taskId}: Status ${response.status}`);
          // Consider updating task status to reflect that the Edge Function call failed
          // This might require a separate, service-role client here.
        } else {
          console.log(`Successfully triggered Edge Function for task ${taskId}`);
        }
      })
      .catch(edgeError => {
        console.error(`Network error or exception when calling Edge Function for task ${taskId}:`, edgeError);
         // Consider updating task status to reflect that the Edge Function call failed
         // This might require a separate, service-role client here.
      });
    // --- End Edge Function Call ---

    return NextResponse.json({ taskId: taskId }, { status: 202 }); // 202 Accepted

  } catch (error: any) {
    console.error('An unexpected error occurred in generate-melody-task route:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
