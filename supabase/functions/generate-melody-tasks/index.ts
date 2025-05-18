// supabase/functions/generate-melody-tasks/index.ts

// Import necessary Deno and Supabase modules
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'; // Use esm.sh for Supabase client

// Using direct relative paths. deno.json still useful for internal imports within src/.
import { generateMelodyFromPromptFlow } from './src/ai/flows/generate-melody-from-prompt.ts';
import { Database } from './src/types/supabase.ts';
// You might need to import other dependencies of your flow here if not handled by the above imports

console.log('Edge Function "generate-melody-tasks" started');

// Initialize Supabase client with Service Role Key
// Ensure SUPABASE_SERVICE_ROLE_KEY is set as an Edge Function secret in the Supabase dashboard
const supabaseUrl = Deno.env.get('NEXT_PUBLIC_SUPABASE_URL');
const supabaseServiceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

if (!supabaseUrl) {
  console.error('Edge Function Error: Missing env var NEXT_PUBLIC_SUPABASE_URL');
  throw new Error('Missing env var NEXT_PUBLIC_SUPABASE_URL');
}
if (!supabaseServiceRoleKey) {
  console.error('Edge Function Error: Missing env var SUPABASE_SERVICE_ROLE_KEY');
  throw new Error('Missing env var SUPABASE_SERVICE_ROLE_KEY');
}

const supabase = createClient<Database>(supabaseUrl, supabaseServiceRoleKey, {
  // Pass auth header if your flow logic still expects it (less likely with service role)
  // global: { headers: { Authorization: `Bearer ${Deno.env.get('SUPABASE_ANON_KEY')}` } }, // Example if needed
});


// Main Edge Function handler
serve(async (req) => {
  console.log('Edge Function received request');

  if (req.method !== 'POST') {
    console.warn(`Edge Function received non-POST request: ${req.method}`);
    return new Response(JSON.stringify({ error: 'Method Not Allowed' }), {
      headers: { 'Content-Type': 'application/json' },
      status: 405,
    });
  }

  try {
    const { taskId, prompt } = await req.json();
    console.log(`Edge Function processing task: ${taskId} with prompt: "${prompt ? prompt.substring(0, 50) + '...' : 'N/A'}"`);

    if (!taskId || !prompt) {
       console.error(`Edge Function Error: Missing taskId or prompt in request body for task ${taskId}`);
       return new Response(JSON.stringify({ error: 'Task ID and prompt are required in the request body' }), {
        headers: { 'Content-Type': 'application/json' },
        status: 400,
      });
    }

    // --- Call the AI Generation Flow ---
    // This calls the function containing the Genkit/AI logic and Supabase updates
    // This function WILL update the database status directly from the Edge Function using the service role key
    const flowResult = await generateMelodyFromPromptFlow({ taskId, prompt });
    // --- End Flow Call ---

    console.log(`Edge Function finished processing task ${taskId}. Flow result status: ${flowResult.midiData ? 'Completed' : 'Failed'}`);


    // The flow itself handles setting the task status in the DB.
    // We return a success response to acknowledge the Edge Function executed.
    return new Response(JSON.stringify({
        message: 'Melody generation flow initiated/completed',
        taskId: taskId,
        // Optionally return a summary of the flow result, but full results are in DB
        // flowOutput: flowResult
    }), {
      headers: { 'Content-Type': 'application/json' },
      status: 200, // Indicate Edge Function call was successful
    });

  } catch (error: any) {
    console.error(`Edge Function Error processing task: ${error.message}`);
    // If an error occurs here, the flow's catch block might not have been reached
    // or it failed to update status. Consider adding a final FAILED update here
    // as a fallback if your flow's internal error handling isn't sufficient.

    // Example fallback to update status to FAILED if it wasn't already handled:
    try {
        const { error: fallbackError } = await supabase
            .from('tasks')
            .update({
                status: 'FAILED',
                error_message: `Edge Function top-level error: ${error.message}`,
                updated_at: new Date().toISOString(),
            })
            .eq('id', taskId); // Use taskId captured earlier

        if (fallbackError) {
            console.error(`Edge Function Error: Also failed to update task ${taskId} to FAILED in fallback. Error: ${fallbackError.message}`);
        } else {
             console.log(`Edge Function: Task ${taskId} status set to FAILED due to top-level error.`);
        }
    } catch (fallbackUpdateError: any) {
         console.error(`Edge Function Fatal Error: Exception during fallback FAILED update for task ${taskId}. Error: ${fallbackUpdateError.message}`);
    }


    return new Response(JSON.stringify({
        error: 'Failed to process melody generation task in Edge Function',
        details: error.message,
        taskId: taskId, // Include taskId in error response
    }), {
      headers: { 'Content-Type': 'application/json' },
      status: 500, // Indicate server error
    });
  }
});
