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

// Log the imported flow to see what it is
console.log('Imported generateMelodyFromPromptFlow:', generateMelodyFromPromptFlow);
console.log('typeof generateMelodyFromPromptFlow:', typeof generateMelodyFromPromptFlow);
if (generateMelodyFromPromptFlow) {
  console.log('typeof generateMelodyFromPromptFlow.invoke:', typeof generateMelodyFromPromptFlow.invoke);
  console.log('generateMelodyFromPromptFlow.invoke directly:', generateMelodyFromPromptFlow.invoke);
  console.log('Does generateMelodyFromPromptFlow have invoke property?', 'invoke' in generateMelodyFromPromptFlow);
}

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
  let receivedPrompt = 'N/A'; // Store the received prompt for logging
  let initialMelodyTextReceived = false; // Flag to indicate if initialMelodyText was received

  try {
    const body = await req.json();
    taskId = body.taskId; // Assign taskId here if available from the request body
    const { prompt, initialMelodyText } = body; // Destructure both fields

    receivedPrompt = prompt; // Store the received prompt
    if (initialMelodyText !== undefined) {
        initialMelodyTextReceived = true;
    }

    console.log(`Edge Function processing task: ${taskId}. Prompt: "${receivedPrompt ? receivedPrompt.substring(0, 50) + '...' : 'N/A'}". Iteration context provided: ${initialMelodyTextReceived}`);

    if (!taskId || !receivedPrompt) {
       console.error(`Edge Function Error: Missing taskId or prompt in request body for task ${taskId}`);
       return new Response(JSON.stringify({ error: 'Task ID and prompt are required in the request body' }), {
        headers: { 'Content-Type': 'application/json' },
        status: 400,
      });
    }
    
    // Construct the prompt for the AI based on whether initialMelodyText is present
    let promptForAI: string;
    if (initialMelodyTextReceived) {
        promptForAI = `Original Melody:
${initialMelodyText}

User Request:
${receivedPrompt}`;
        console.log(`Edge Function: Constructed iterative prompt for AI for task ${taskId}`);
    } else {
        promptForAI = receivedPrompt;
        console.log(`Edge Function: Using direct prompt for AI for task ${taskId}`);
    }

    // Detailed check for invoke method
    console.log('Inside serve: typeof generateMelodyFromPromptFlow.invoke:', typeof generateMelodyFromPromptFlow?.invoke);
    console.log('Inside serve: generateMelodyFromPromptFlow.invoke directly:', generateMelodyFromPromptFlow?.invoke);

    let flowResult;
    if (generateMelodyFromPromptFlow && typeof generateMelodyFromPromptFlow.invoke === 'function') {
      console.log('Attempting to call generateMelodyFromPromptFlow.invoke() with constructed prompt.');
      // Pass the constructed promptForAI to the flow
      flowResult = await generateMelodyFromPromptFlow.invoke({ taskId, prompt: promptForAI });
    } else if (typeof generateMelodyFromPromptFlow === 'function') {
      console.log('Attempting to call generateMelodyFromPromptFlow directly as a function with constructed prompt.');
       // Pass the constructed promptForAI to the flow
      flowResult = await generateMelodyFromPromptFlow({ taskId, prompt: promptForAI }); // Direct call
    } else {
      console.error(
        'Edge Function Error: generateMelodyFromPromptFlow is neither invokable nor a direct function.',
        'Type of flow:', typeof generateMelodyFromPromptFlow,
        'Flow object:', generateMelodyFromPromptFlow
      );
      throw new Error('generateMelodyFromPromptFlow is not invokable or callable.');
    }

    console.log(`Edge Function finished processing task ${taskId}. Flow result status: ${flowResult.midiData ? 'Completed' : 'Failed'}`);

    // Here you might want to update the task in Supabase with the result (flowResult.midiData, etc.)
    // This part is not explicitly requested but is likely the next step.
    // For now, we just return the result.

    return new Response(JSON.stringify({
        message: 'Melody generation flow processed.',
        taskId: taskId,
        flowOutput: flowResult
    }), {
      headers: { 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error: any) {
    console.error(`Edge Function Error processing task ${taskId}: ${error.message}`);
    if (supabase) {
        try {
            const { error: fallbackError } = await supabase
                .from('tasks')
                .update({
                    status: 'FAILED',
                    error_message: `Edge Function top-level error: ${error.message}`,
                    updated_at: new Date().toISOString(),
                })
                .eq('id', taskId);

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

    return new Response(JSON.stringify({
        error: 'Failed to process melody generation task in Edge Function',
        details: error.message,
        taskId: taskId,
    }), {
      headers: { 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});