// src/app/api/generate-melody-task/route.ts
import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';
import { Database } from '@/types/supabase';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl) {
  throw new Error('Missing environment variable NEXT_PUBLIC_SUPABASE_URL');
}
if (!supabaseAnonKey) {
  throw new Error('Missing environment variable NEXT_PUBLIC_SUPABASE_ANON_KEY');
}
if (!supabaseServiceRoleKey) {
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
    
    // Destructure prompt and optional initialMelodyText from the request body
    const { prompt, initialMelodyText } = await req.json();

    // Ensure prompt is provided
    if (!prompt) {
         console.error('Missing prompt in generate-melody-task route request body');
         return NextResponse.json({ error: 'Prompt is required' }, { status: 400 });
    }

    // Insert task into Supabase database (store the user's direct prompt)
    const { data: task, error: taskError } = await supabase
      .from('tasks')
      .insert([
        {
          user_id: profileId,
          prompt: prompt, // Store the user's direct prompt
          status: 'PENDING',
        },
      ])
      .select('id')
      .single();

    if (taskError || !task) {
      console.error('Error inserting task in generate-melody-task route:', taskError);
      return NextResponse.json({ error: 'Failed to create task' }, { status: 500 });
    }

    const taskId = task.id;

    console.log(`Task created for user ${userId} with ID: ${taskId}. Attempting to call Edge Function.`);

    const edgeFunctionUrl = `${supabaseUrl}/functions/v1/generate-melody-tasks`; // Changed to plural 'tasks'
    
    console.log(`API Route: Attempting to call Edge Function at URL: ${edgeFunctionUrl}`);

    // Prepare the body to send to the Edge Function
    const edgeFunctionBody: any = {
      taskId: taskId,
      prompt: prompt, // Always send the user's prompt
    };

    // Include initialMelodyText if it was provided in the request body
    if (initialMelodyText !== undefined) {
        edgeFunctionBody.initialMelodyText = initialMelodyText;
    }

    fetch(edgeFunctionUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${supabaseAnonKey}`,
      },
      body: JSON.stringify(edgeFunctionBody), // Send the constructed body
    })
      .then(response => {
        if (!response.ok) {
          console.error(`Error calling Edge Function for task ${taskId}: Status ${response.status} ${response.statusText}`);
          // Consider updating task status to reflect that the Edge Function call failed
          // Note: This fetch is intentionally not awaited to allow the API route to respond quickly.
          // Error handling for the fetch itself should ideally update the task status from the Edge Function side
          // if the function is successfully invoked but fails internally.
        } else {
          console.log(`Successfully triggered Edge Function for task ${taskId}`);
        }
      })
      .catch(edgeError => {
        console.error(`Network error or exception when calling Edge Function for task ${taskId} (fetch failed):`, edgeError);
        // Note: Similar to the response.ok check, this catch handles network errors *from the API route's perspective*. 
        // Robust error handling for the task completion/failure should be in the Edge Function.
      });

    // Respond immediately with the task ID
    return NextResponse.json({ taskId: taskId }, { status: 202 });

  } catch (error: any) {
    console.error('An unexpected error occurred in generate-melody-task route:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
