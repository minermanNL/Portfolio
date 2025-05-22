// supabase/functions/generate-melody-tasks/src/ai/flows/generate-melody-from-prompt.ts

import { z } from 'https://esm.sh/zod@3';
import { ai } from '../genkit.ts'; // Imports the configured ai instance
import { gemini } from 'npm:@genkit-ai/googleai'; // Import gemini factory
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { Database } from '../../types/supabase.ts';

// Zod Schemas
const GenerateMelodyFromPromptInputSchema = z.object({
  taskId: z.string(),
  prompt: z.string(),
});
export type GenerateMelodyFromPromptInput = z.infer<typeof GenerateMelodyFromPromptInputSchema>;

const MelodyMidiOutputSchema = z.object({ 
  midiBase64: z.string() 
});

const MelodyDescriptionOutputSchema = z.object({ 
  description: z.string() 
});

const GenerateMelodyFromPromptOutputSchema = z.object({
  taskId: z.string(),
  midiData: z.string(),
  description: z.string(),
  modelProvider: z.string(),
  modelUsed: z.string(),
});
export type GenerateMelodyFromPromptOutput = z.infer<typeof GenerateMelodyFromPromptOutputSchema>;

// Supabase client
const supabaseUrl = Deno.env.get('NEXT_PUBLIC_SUPABASE_URL');
const supabaseServiceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
if (!supabaseUrl || !supabaseServiceRoleKey) throw new Error('Supabase config missing in flow');
const supabase = createClient<Database>(supabaseUrl, supabaseServiceRoleKey);

// System Prompts (now combined into user messages)
const MELODY_MIDI_SYSTEM_PROMPT = `You are an expert MIDI music generation assistant. Generate MIDI data based on user prompts. Return only valid base64-encoded MIDI data.`;
const MELODY_DESCRIPTION_SYSTEM_PROMPT = `You are a musicologist. Describe the character and style of melodies based on the context provided.`;

// Flow Definition
export const generateMelodyFromPromptFlow = ai.defineFlow(
  {
    name: 'generateMelodyFromPromptFlow',
    inputSchema: GenerateMelodyFromPromptInputSchema,
    outputSchema: GenerateMelodyFromPromptOutputSchema,
  },
  async (input) => {
    const { taskId, prompt } = input;
    const targetModelName = 'models/gemini-2.5-flash-preview-05-20';
    const targetModel = gemini(targetModelName);

    console.log(`Task ${taskId}: >>> Entering generateMelodyFromPromptFlow. Using model: ${targetModelName}`);

    // Robust string sanitization helper
    const sanitizeString = (str: unknown, fallback = 'Invalid input'): string => {
      if (typeof str === 'string' && str.trim() !== '') return str.trim();
      console.warn(`Sanitization: Input was not a valid string or was empty. Using fallback: "${fallback}". Original input:`, str);
      return fallback;
    };

    try {
      await supabase.from('tasks').update({ 
        status: 'PROCESSING', 
        updated_at: new Date().toISOString() 
      }).eq('id', taskId);
      console.log(`Task ${taskId}: Status updated to PROCESSING.`);

      // Sanitize inputs for MIDI generation
      const sanitizedUserPromptForMidi = sanitizeString(prompt, 'Generate a simple C major scale.');
      const sanitizedSystemMidiPrompt = sanitizeString(MELODY_MIDI_SYSTEM_PROMPT);
      const combinedMidiPrompt = `${sanitizedSystemMidiPrompt}

User prompt: ${sanitizedUserPromptForMidi}`;

      const midiResponse = await ai.generate({
        model: targetModel,
        messages: [
          { role: 'user', content: [{ text: combinedMidiPrompt }] }
        ],
        output: { format: 'json', schema: MelodyMidiOutputSchema },
      });
      
      // Fixed: Call the response object directly to get schema-validated output
      const midiOutput = midiResponse();
      const midiData = midiOutput?.midiBase64;
      if (!midiData) throw new Error(`MIDI generation failed for task ${taskId}. No MIDI data returned from model.`);
      console.log(`Task ${taskId}: MIDI data generation complete.`);

      // Sanitize inputs for Description generation
      const sanitizedUserPromptForDescription = sanitizeString(prompt, 'A generic melody was generated.');
      const sanitizedSystemDescriptionPrompt = sanitizeString(MELODY_DESCRIPTION_SYSTEM_PROMPT);
      const melodyContextForDescription = "The MIDI for the melody has been successfully generated.";
      const userDescriptionMessageContent = `The original user request for the melody was: "${sanitizedUserPromptForDescription}". Based on this, a melody (context: ${melodyContextForDescription}) was generated. Please describe the likely character, style, and potential instrumentation for this melody.`;
      const combinedDescriptionPrompt = `${sanitizedSystemDescriptionPrompt}

${userDescriptionMessageContent}`;

      const descriptionResponse = await ai.generate({
        model: targetModel,
        messages: [
          { role: 'user', content: [{ text: combinedDescriptionPrompt }] }
        ],
        output: { format: 'json', schema: MelodyDescriptionOutputSchema },
      });
      
      // Fixed: Call the response object directly to get schema-validated output
      const descriptionOutput = descriptionResponse();
      const description = descriptionOutput?.description || "No description generated.";
      console.log(`Task ${taskId}: Description generation complete.`);

      await supabase.from('tasks').update({
        status: 'COMPLETED',
        midi_data: midiData,
        description: description,
        updated_at: new Date().toISOString(),
      }).eq('id', taskId);
      console.log(`Task ${taskId}: Status updated to COMPLETED.`);

      return { 
        taskId, 
        midiData, 
        description, 
        modelProvider: 'googleai', 
        modelUsed: targetModelName 
      };
    } catch (error: any) {
      console.error(`Task ${taskId}: CRITICAL Error in melody generation flow: ${error.message}, Stack: ${error.stack}`);
      if (supabase) {
        try {
          await supabase.from('tasks').update({
            status: 'FAILED',
            error_message: `Flow error: ${error.message}`,
            updated_at: new Date().toISOString(),
          }).eq('id', taskId);
        } catch (dbErr: any) { 
          console.error(`Task ${taskId}: DB fallback error: ${dbErr.message}`); 
        }
      }
      return { 
        taskId, 
        midiData: '',
        description: `Error: ${error.message}`,
        modelProvider: 'unknown',
        modelUsed: 'unknown' 
      };
    }
  }
);

export async function generateMelodyFromPrompt(
  input: GenerateMelodyFromPromptInput
): Promise<GenerateMelodyFromPromptOutput> {
  return generateMelodyFromPromptFlow.invoke(input);
}
