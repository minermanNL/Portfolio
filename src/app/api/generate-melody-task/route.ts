// src/app/api/generate-melody-task/route.ts
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import { Database } from '@/types/supabase'; // Make sure this path is correct

// Placeholder for triggering the background generation process
// This function will be implemented in a later step
// import { triggerBackgroundMelodyGeneration } from '@/lib/melodyBackgroundProcessor';

export async function POST(req: NextRequest) {
  const cookieStore = cookies();
  const supabase = createRouteHandlerClient<Database>({ cookies: () => cookieStore });

  try {
    // Get the authenticated user's session
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();

    if (sessionError || !session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id;

    // Fetch the profile ID using the auth user ID
    // Assuming the profile ID is the same as the auth user ID based on your schema
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', userId)
      .single();

    if (profileError || !profile) {
      console.error('Error fetching profile:', profileError);
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
    }

    const profileId = profile.id;
    const { prompt } = await req.json();


    // Insert the task into the database
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
      console.error('Error inserting task:', taskError);
      return NextResponse.json({ error: 'Failed to create task' }, { status: 500 });
    }

    const taskId = task.id;

    // --- Placeholder for initiating background generation ---
    // This is where you would call a function to trigger the actual
    // melody generation process in the background, passing the taskId.
    console.log(`Task created with ID: ${taskId}. Background processing will be triggered later.`);
    // Example: triggerBackgroundMelodyGeneration(taskId);

    return NextResponse.json({ taskId: taskId }, { status: 202 }); // 202 Accepted

  } catch (error) {
    console.error('An unexpected error occurred:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}