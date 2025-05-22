// supabase/functions/generate-melody-tasks/src/ai/flows/generate-melody-from-prompt.ts
'use server'; // This directive is typically for React Server Components, you can usually remove it.

// Import the already configured 'ai' instance
import { ai } from '../genkit.ts'; // <--- IMPORT THE CONFIGURED AI INSTANCE

import { z } from 'https://esm.sh/zod@3';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { Database } from '../../types/supabase.ts';

// Initialize Supabase client with service role key for backend operations
const supabaseUrl = Deno.env.get('NEXT_PUBLIC_SUPABASE_URL');
const supabaseServiceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

if (!supabaseUrl) {
  console.error('CRITICAL: Missing environment variable NEXT_PUBLIC_SUPABASE_URL in AI flow');
  throw new Error('CRITICAL: Missing environment variable NEXT_PUBLIC_SUPABASE_URL');
}
if (!supabaseServiceRoleKey) {
  console.error('CRITICAL: Missing environment variable SUPABASE_SERVICE_ROLE_KEY in AI flow');
  throw new Error('CRITICAL: Missing environment variable SUPABASE_SERVICE_ROLE_KEY');
}

const supabase = createClient<Database>(supabaseUrl, supabaseServiceRoleKey);

// --- Zod Schemas ---
const GenerateMelodyFromPromptInputSchema = z.object({
  prompt: z.string().describe('A text prompt describing the desired melody.'),
  taskId: z.string().describe('The ID of the task to track asynchronous generation.'),
});
export type GenerateMelodyFromPromptInput = z.infer<typeof GenerateMelodyFromPromptInputSchema>;

const MelodyMidiOutputSchema = z.object({
  midiBase64: z.string().describe("The base64 encoded MIDI data."),
});

const MelodyDescriptionOutputSchema = z.object({
  description: z.string().describe("A textual description of the generated melody."),
});

const GenerateMelodyFromPromptOutputSchema = z.object({
  taskId: z.string(),
  midiData: z.string().describe("Base64 encoded MIDI data."),
  description: z.string(),
  modelProvider: z.string().optional(),
  modelUsed: z.string().optional(),
});
export type GenerateMelodyFromPromptOutput = z.infer<typeof GenerateMelodyFromPromptOutputSchema>;


// --- System Prompts ---
const melodyMidiSystemPrompt = `You are an expert MIDI music generation assistant. Your goal is to create a short, expressive MIDI melody based on the user's prompt. Output only the MIDI data as a base64 encoded string within a JSON object matching the provided schema.`;
const melodyDescriptionSystemPrompt = `You are a musicologist. Based on the provided context about a generated melody and the original user prompt, create a concise and evocative description of the music. Output only the description within a JSON object matching the provided schema.`;


// --- Prompt Definitions ---
// Use 'ai.definePrompt'
const generateMelodyMidiPrompt = ai.definePrompt(
  {
    name: 'generateMelodyMidi',
    description: 'Generates MIDI data from a user prompt.',
    inputSchema: z.object({ userPrompt: z.string() }),
    outputSchema: MelodyMidiOutputSchema,
    config: {
      temperature: 0.75,
      candidateCount: 1,
    },
  },
  async (input) => {
    return {
      messages: [
        { role: 'system', content: melodyMidiSystemPrompt },
        { role: 'user', content: input.userPrompt },
      ],
    };
  }
);

const generateMelodyDescriptionPrompt = ai.definePrompt(
  {
    name: 'generateMelodyDescription',
    description: 'Generates a description for a melody.',
    inputSchema: z.object({ melodyContext: z.string(), originalPrompt: z.string() }),
    outputSchema: MelodyDescriptionOutputSchema,
    config: {
      temperature: 0.6,
    },
  },
  async (input) => {
    return {
      messages: [
        { role: 'system', content: melodyDescriptionSystemPrompt },
        { role: 'user', content: `The original user request was: "${input.originalPrompt}". Based on this, a melody was generated. Describe the likely character of this melody: ${input.melodyContext}` },
      ],
    };
  }
);

// --- Flow Definition ---
// Use 'ai.defineFlow'
export const generateMelodyFromPromptFlow = ai.defineFlow(
  {
    name: 'generateMelodyFromPromptFlow',
    inputSchema: GenerateMelodyFromPromptInputSchema,
    outputSchema: GenerateMelodyFromPromptOutputSchema,
  },
  async (input) => {
    const { taskId, prompt } = input;

    console.log(`Task ${taskId}: >>> Entering generateMelodyFromPromptFlow`);
    console.log(`Task ${taskId}: generateMelodyFromPromptFlow started.`);

    try {
      console.log(`Task ${taskId}: About to attempt update status to PROCESSING.`);
      const { error: updateError } = await supabase
        .from('tasks') // Assuming your table is named 'tasks'
        .update({ status: 'PROCESSING', updated_at: new Date().toISOString() })
        .eq('id', taskId);

      if (updateError) {
        console.error(`Task ${taskId}: CRITICAL - Failed to update status to PROCESSING. Error: ${updateError.message}`);
        throw new Error(`Task ${taskId}: Failed to update status to PROCESSING - ${updateError.message}`);
      }
      console.log(`Task ${taskId}: Status successfully updated to PROCESSING.`);

      // Step 1: Generate MIDI
      // Use 'ai.generate' and 'ai.model'
      const midiResponse = await ai.generate({
        prompt: generateMelodyMidiPrompt,
        input: { userPrompt: prompt },
        model: ai.model('googleai/gemini-1.5-flash'), // Explicitly choose model for this step
      });
      const midiOutput = midiResponse.output(); // Get structured output if schema is defined
      const midiData = midiOutput?.midiBase64; // Access the property from the schema

      if (!midiData) {
        console.error(`MIDI generation failed for task ${taskId}. Output:`, midiOutput);
        throw new Error(`MIDI generation failed for task ${taskId}. No MIDI data produced or schema mismatch.`);
      }
      console.log(`Task ${taskId}: MIDI data generation complete.`);

      // Step 2: Generate Description
      // Use 'ai.generate' and 'ai.model'
      const descriptionResponse = await ai.generate({
        prompt: generateMelodyDescriptionPrompt,
        input: { melodyContext: "A MIDI melody was successfully generated.", originalPrompt: prompt },
        model: ai.model('googleai/gemini-1.5-flash'),
      });
      const descriptionOutput = descriptionResponse.output();
      const description = descriptionOutput?.description || "No description could be generated.";

      console.log(`Task ${taskId}: Description generation complete.`);
      console.log(`Task ${taskId}: MIDI data and description obtained.`);

      console.log(`Task ${taskId}: About to attempt update status to COMPLETED.`);
      const { error: completeError } = await supabase
        .from('tasks')
        .update({
          status: 'COMPLETED',
          midi_data: midiData, // Ensure your DB column matches
          description: description, // Ensure your DB column matches
          updated_at: new Date().toISOString(),
        })
        .eq('id', taskId);

      if (completeError) {
        console.error(`Task ${taskId}: CRITICAL - Failed to update status to COMPLETED. Error: ${completeError.message}`);
        throw new Error(`Task ${taskId}: Failed to update status to COMPLETED - ${completeError.message}`);
      }
      console.log(`Task ${taskId}: Status successfully updated to COMPLETED.`);

      return {
        taskId: taskId, // Return taskId as per output schema
        midiData: midiData,
        description: description,
        modelProvider: midiResponse.usage?.inputModel || 'googleai',
        modelUsed: midiResponse.usage?.inputModel || 'gemini-1.5-flash',
      };
    } catch (error: any) {
      console.error(`Task ${taskId}: CRITICAL Error in melody generation flow: ${error.message}`);
      console.log(`Task ${taskId}: About to attempt update status to FAILED.`);
      const { error: failError } = await supabase
        .from('tasks')
        .update({
          status: 'FAILED',
          error_message: error.message,
          updated_at: new Date().toISOString(),
        })
        .eq('id', taskId);

      if (failError) {
        console.error(`Task ${taskId}: CRITICAL - Also failed to update status to FAILED in catch block. Error: ${failError.message}`);
      } else {
        console.log(`Task ${taskId}: Status successfully updated to FAILED in catch block.`);
      }

      return {
        taskId: taskId, // Return taskId even on error as per output schema
        midiData: '', // Ensure output schema is satisfied
        description: `Error processing task ${taskId}: ${error.message}`,
      };
    }
  }
);

// If your index.ts calls `generateMelodyFromPromptFlow.invoke()`, you don't strictly need this wrapper.
// But it's fine to keep it if other parts of your app depend on this specific function signature.
export async function generateMelodyFromPrompt(
  input: GenerateMelodyFromPromptInput
): Promise<GenerateMelodyFromPromptOutput> {
  return generateMelodyFromPromptFlow.invoke(input); // <--- Make sure to invoke the flow
}