// supabase/functions/generate-melody-tasks/index.ts

console.log("Supabase function script 'generate-melody-tasks' started - TOP OF FILE");

// Import necessary Deno and Supabase modules
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

// Import the pre-configured 'ai' instance from your genkit setup file
import { ai } from './src/ai/genkit.ts'; // <--- IMPORT THE CONFIGURED AI INSTANCE

// Import your Genkit flow and Supabase database types
import { generateMelodyFromPromptFlow } from './src/ai/flows/generate-melody-from-prompt.ts';
import { Database } from './src/types/supabase.ts';


let supabase: ReturnType<typeof createClient<Database>>; // Declare supabase variable outside try/catch

try {
  console.log('Edge Function "generate-melody-tasks" starting initialization'); // More specific log

  // Initialize Supabase client with Service Role Key
  const supabaseUrl = Deno.env.get('NEXT_PUBLIC_SUPABASE_URL');
  const supabaseServiceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

  if (!supabaseUrl) {
    console.error('Edge Function Initialization Error: Missing env var NEXT_PUBLIC_SUPABASE_URL');
    throw new Error('Missing env var NEXT_PUBLIC_SUPABASE_URL');
  }
  if (!supabaseServiceRoleKey) {
    console.error('Edge Function Initialization Error: Missing env var SUPABASE_SERVICE_ROLE_KEY');
    throw new Error('Missing env var SUPABASE_SERVICE_ROLE_KEY');
  }

  supabase = createClient<Database>(supabaseUrl, supabaseServiceRoleKey, {
    // global: { headers: { Authorization: `Bearer ${Deno.env.get('SUPABASE_ANON_KEY')}` } }, // Example if needed
  });

  // Ensure 'ai' instance was successfully imported (and thus configured)
  if (!ai) {
    console.error('Edge Function Initialization Error: Genkit AI instance (ai) not found after import.');
    throw new Error('Genkit AI instance failed to initialize. Check src/ai/genkit.ts.');
  }

  console.log('Edge Function initialization complete. Genkit instance is ready.'); // Log success

} catch (initError: any) {
    console.error(`Edge Function Initialization Failed: ${initError.message}`);
    throw initError;
}


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

  let taskId = 'unknown'; // Initialize taskId to help in error reporting

  try {
    const body = await req.json();
    taskId = body.taskId; // Assign taskId here if available from the request body
    const { prompt } = body;

    console.log(`Edge Function processing task: ${taskId} with prompt: "${prompt ? prompt.substring(0, 50) + '...' : 'N/A'}"`);

    if (!taskId || !prompt) {
       console.error(`Edge Function Error: Missing taskId or prompt in request body for task ${taskId}`);
       return new Response(JSON.stringify({ error: 'Task ID and prompt are required in the request body' }), {
        headers: { 'Content-Type': 'application/json' },
        status: 400,
      });
    }

    // --- Call the AI Generation Flow ---
    // Genkit flows are invoked using the .invoke() method on the flow object
    const flowResult = await generateMelodyFromPromptFlow.invoke({ taskId, prompt }); // <--- USE .invoke()

    console.log(`Edge Function finished processing task ${taskId}. Flow result status: ${flowResult.midiData ? 'Completed' : 'Failed'}`);


    // The flow itself is responsible for setting the task status in the DB.
    // We return a success HTTP response to acknowledge the Edge Function executed.
    return new Response(JSON.stringify({
        message: 'Melody generation flow initiated/completed',
        taskId: taskId,
        // Optionally return a summary of the flow result, but full results are typically in DB
        flowOutput: flowResult // Include flow output for direct debugging
    }), {
      headers: { 'Content-Type': 'application/json' },
      status: 200, // Indicate Edge Function call was successful
    });

  } catch (error: any) {
    console.error(`Edge Function Error processing task ${taskId}: ${error.message}`);
    // Fallback: If an error occurs that wasn't caught by the flow's internal error handling,
    // or if the flow failed to update the status, attempt to update the task status to FAILED.
    if (supabase) {
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
    } else {
     console.error(`Edge Function Fatal Error: Supabase client was not initialized, cannot perform fallback update for task ${taskId}.`);
    }

    // Return a 500 (Internal Server Error) response for unhandled errors.
    return new Response(JSON.stringify({
        error: 'Failed to process melody generation task in Edge Function',
        details: error.message,
        taskId: taskId, // Include taskId in error response for debugging
    }), {
      headers: { 'Content-Type': 'application/json' },
      status: 500, // Indicate server error
    });
  }
});