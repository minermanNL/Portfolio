// supabase/functions/generate-melody-tasks/src/ai/flows/generate-melody-from-prompt.ts

import { z } from 'https://esm.sh/zod@3';
import { ai } from '../genkit.ts'; // Imports the configured ai instance
import { gemini } from 'npm:@genkit-ai/googleai'; // Import gemini factory
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { Database } from '../../types/supabase.ts';
import { parseTextToMidi } from '../../parseTextToMidi.ts'; // Import the MIDI parsing function
import refineMelodyPromptFlow  from './refine-melody-prompt.ts'; // Import the new refinement flow

console.log('Type of refineMelodyPromptFlow:', typeof refineMelodyPromptFlow, refineMelodyPromptFlow);

// Zod Schemas
const GenerateMelodyFromPromptInputSchema = z.object({
  taskId: z.string(),
  prompt: z.string(),
});
export type GenerateMelodyFromPromptInput = z.infer<typeof GenerateMelodyFromPromptInputSchema>;

// REMOVED MelodyMidiOutputSchema - no longer parsing MIDI as JSON directly

const MelodyDescriptionOutputSchema = z.object({
  description: z.string().describe("A textual description of the generated melody from the model.")
});

const GenerateMelodyFromPromptOutputSchema = z.object({
  taskId: z.string(),
  midiData: z.string().describe("Final base64 encoded MIDI data for the task."),
  description: z.string().describe("Final description for the task."),
  modelProvider: z.string().optional(),
  modelUsed: z.string().optional(),
});
export type GenerateMelodyFromPromptOutput = z.infer<typeof GenerateMelodyFromPromptOutputSchema>;

// Supabase client
const supabaseUrl = Deno.env.get('NEXT_PUBLIC_SUPABASE_URL');
const supabaseServiceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
if (!supabaseUrl || !supabaseServiceRoleKey) throw new Error('Supabase config missing in flow');
const supabase = createClient<Database>(supabaseUrl, supabaseServiceRoleKey);

// Flow Definition
export const generateMelodyFromPromptFlow = ai.defineFlow(
  {
    name: 'generateMelodyFromPromptFlow',
    inputSchema: GenerateMelodyFromPromptInputSchema,
    outputSchema: GenerateMelodyFromPromptOutputSchema,
  },
  async (input) => {
    const { taskId, prompt } = input;
    console.log(`Task ${taskId}: Received prompt: "${prompt}"`);


    // System Prompts (now combined into user messages) - DEFINED INSIDE THE FLOW
    const MELODY_MIDI_SYSTEM_PROMPT = `System Prompt: MIDI Loop Generation (Melody/Drum)

Core Directive: Generate one creative, cohesive, 16-bar loopable MIDI sequence (Main Melody or Drum Loop per user request). Adhere to specified/assumed parameters. Respond ONLY with the MIDI text block. No intros/outros/explanations.

I. User Parameters (Assume if Unspecified):
A. Output Type: ["Main Melody" or "Drum Loop"] (Default: "Main Melody"; Infer "Drum Loop" from "beat/drum/rhythm").
B. Target Genre/Style: [e.g., "Dark Trap", "Pop EDM"] (Default: generic pleasant). Consider scales, motifs, energy.
C. Desired Mood/Feeling: [e.g., "Menacing", "Uplifting", "Chill"] (Default: neutral/positive). Translate to pitch, density, direction, articulation.
D. Key & Mode (Melody Only): [e.g., "C# Minor", "G Major"] (Default: C Maj/A Min). Melody uses this tonality.
E. Tempo (BPM): [e.g., 90, 128, 145] (Default: 120 BPM). Affects energy.

II. Fixed Technicals:
Time Sig: 4/4; Loop: 16 bars (End: 30720); Resolution: 480.
Ticks: Absolute, chronological, 1 event/line. NO "+" char.
Quantization: Strict.
NoteOff Vel: 0. ALL NoteOn events MUST have a corresponding NoteOff event to define duration.

III. Calculated by AI:
Tempo (µs/beat): 60M / BPM.

IV. Generation Guidelines:

A. If "Main Melody":
Ch: 1; Default NoteOn Vel: 100 (adjust for mood).
Focus: Impactful, memorable hook.
Motif: 1-2 bars, reflects Genre/Mood; repeat with subtle variations (AABA/ABAB). Avoid monotony.
Rhythm: Adapt density. "Aggressive/Driving": near-constant (8ths/16ths), minimal rests, syncopation. "Sparse/Atmospheric": longer notes, silence.
Harmony: Adhere to Key/Mode.
Chords: ONLY if user EXPLICITLY requests OR genre STRONGLY implies (e.g., piano chords, synth stabs), use multiple NoteOn at same tick (Root+5th/triads). ELSE, single-line. Chords reinforce melody.
Octaves: For emphasis.
Loop/Cohesion: Smooth, intentional.

B. If "Drum Loop":
Ch: 10 (MIDI Percussion). Default NoteOn Vel: 100 (adjust intensity).
Focus: Dynamic, groove-focused genre pattern.
Notes: Standard MIDI drums (Kick:36, Snare:38, CHat:42, OHat:46, Clap:39 etc.).
Rhythm: Adapt to genre (Trap: sync. hats, K/Sn; EDM/Hardstyle: driving K, off-beat hats/snares). Avoid over-complex fills.
Variation: Subtle velocity/pattern shifts.
Loop/Cohesion: Tight, genre-appropriate.

V. Output Formatting (Strict):
--- [Main Melody (Channel 1)] ---
Tempo: [Calculated µs/beat]
Resolution: 480
Tick 0: NoteOn Channel [Ch#] Note [Note#] Velocity [Vel]
...
Tick [X]: NoteOff Channel [Ch#] Note [Note#] Velocity 0
...
End: 30720

VI. Final AI Check:
Output type matches intent? Technicals met? Catchy, cohesive, stylistic?
Melody Chords: Only if explicitly requested/strongly implied? Loops well? Output ONLY MIDI block?
All NoteOn events have a corresponding NoteOff?
`;

    const MELODY_DESCRIPTION_SYSTEM_PROMPT = `System Prompt: Melody Description Generator

Core Directive: Based on the user's request for a melody, generate a concise and informative description of its expected musical characteristics. This description should cover the likely genre/style, mood/feeling, key/mode, and tempo, noting any aspects that were likely assumed because they were not explicitly provided by the user. should be short

Output Format: Provide the description as a single paragraph of text. Do NOT include any MIDI data or technical specifications like ticks or resolution in this output.`;

    // Define models for each step
    const refinementModelName = 'models/gemini-2.0-flash-lite'; // Model used for prompt refinement
    const midiModelName = 'models/gemini-2.5-flash-preview-05-20';
    const descriptionModelName = 'models/gemini-2.0-flash-lite'; // Using a Gemini 2.0 Flash lite model for description

    const midiModel = gemini(midiModelName);
    const descriptionModel = gemini(descriptionModelName);

    console.log(`Task ${taskId}: >>> Entering generateMelodyFromPromptFlow. Refinement Model: ${refinementModelName}, MIDI Model: ${midiModelName}, Description Model: ${descriptionModelName}`);

    // Robust string sanitization helper - ensure 'prompt' and system prompts are always strings
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

      // Step 1: Refine the user prompt using the refinement flow
      console.log(`Task ${taskId}: Starting prompt refinement.`);
      const refinedPrompt = await refineMelodyPromptFlow(prompt);
      console.log(`Task ${taskId}: Prompt refinement complete. Refined Prompt: "${refinedPrompt}"`); // Added quotes for clarity

      // --- ADDED DEBUGGING LOGS HERE ---
      console.log(`Task ${taskId}: Continuing after prompt refinement.`);
      const sanitizedRefinedPromptForMidi = sanitizeString(refinedPrompt, 'Generate a simple test melody.');
      console.log(`Task ${taskId}: Sanitized Refined Prompt for MIDI: "${sanitizedRefinedPromptForMidi}"`);

      const combinedMidiPromptContent = `${MELODY_MIDI_SYSTEM_PROMPT}

User Prompt: ${sanitizedRefinedPromptForMidi}`;
      console.log(`Task ${taskId}: Combined MIDI Prompt Content (first 200 chars): "${combinedMidiPromptContent.substring(0, 200)}..."`);
      console.log(`Task ${taskId}: Attempting MIDI generation with model: ${midiModelName}`);

      // Step 2: Generate MIDI using the specified MIDI model - Expecting raw text output
      const midiResponse = await ai.generate({
        model: midiModel, // Use the specific MIDI model
        messages: [
          { role: 'user', content: [{ text: combinedMidiPromptContent }] } // System prompt included in user message
        ],
      });

      console.log(`Task ${taskId}: MIDI generation model responded.`); // Log after model response
      // Access raw text output and pass to parser
      const midiTextOutput = midiResponse.text; // Access raw text as property
      console.log('Raw MIDI text output from model (first 200 chars):', midiTextOutput.substring(0, 200) + '...'); // Added logging here

      const midiData = parseTextToMidi(midiTextOutput); // Parse the text into MIDI data

      if (!midiData) {
        console.error(`MIDI generation failed for task ${taskId}. Parsed data was:`, midiData, "Raw text output:", midiTextOutput, "Full response:", JSON.stringify(midiResponse));
        // Consider a more specific error message based on parseTextToMidi failure
        throw new Error(`MIDI generation failed for task ${taskId}. Could not parse MIDI data from model output.`);
      }
      console.log(`Task ${taskId}: MIDI data generation complete.`);

      // Step 3: Generate Description using the specified Description model - Still using JSON schema
      // Use the refined prompt for description generation context
      console.log(`Task ${taskId}: Starting description generation.`); // Log before description generation
      const sanitizedRefinedPromptForDescription = sanitizeString(refinedPrompt, 'A melody was generated.');
      const melodyContextForDescription = "the MIDI for the melody has been successfully generated based on the refined prompt.";
      const combinedDescriptionPromptContent = `${MELODY_DESCRIPTION_SYSTEM_PROMPT}

The original user request was: "${sanitizeString(prompt)}". The refined prompt used for generation was: "${sanitizedRefinedPromptForDescription}". Based on this, ${melodyContextForDescription}. Describe its likely character, style, and potential instrumentation.`;
      console.log(`Task ${taskId}: Combined Description Prompt Content (first 200 chars): "${combinedDescriptionPromptContent.substring(0, 200)}..."`);

      const descriptionResponse = await ai.generate({
        model: descriptionModel, // Use the specific Description model
        messages: [
          { role: 'user', content: [{ text: combinedDescriptionPromptContent }] } // System prompt included in user message
        ],
        output: { format: 'json', schema: MelodyDescriptionOutputSchema }, // Keep output schema for JSON description
      });

      console.log(`Task ${taskId}: Description generation model responded.`); // Log after description model response
      // Access .output as a property for JSON description
      const descriptionOutput = descriptionResponse.output;
      const description = descriptionOutput?.description || "No description could be generated.";
      console.log(`Task ${taskId}: Description generation complete. Description: "${description}"`);

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
        modelUsed: `Refinement (${refinementModelName}), MIDI (${midiModelName}), Description (${descriptionModelName})` // Indicate all models used
      };
    } catch (error: any) {
      console.error(`Task ${taskId}: CRITICAL Error in melody generation flow: ${error.message}
Stack: ${error.stack}`);
      if (supabase) {
        try {
          await supabase.from('tasks').update({
            status: 'FAILED',
            error_message: `Flow error: ${error.message}`,
            updated_at: new Date().toISOString(),
          },
          { filter: { id: taskId, status: { ne: 'COMPLETED' } } }
          ).eq('id', taskId);
        } catch (dbErr: any) {
          console.error(`Task ${taskId}: DB fallback error: ${dbErr.message}`);
        }
      }
      return {
        taskId,
        midiData: '', // Return empty string on failure
        description: `Error: ${error.message}`,
        modelProvider: 'unknown',
        modelUsed: `Error with models: Refinement (${refinementModelName}), ${midiModelName}, ${descriptionModelName}`
      };
    }
  }
);

export async function generateMelodyFromPrompt(
  input: GenerateMelodyFromPromptInput
): Promise<GenerateMelodyFromPromptOutput> {
  return generateMelodyFromPromptFlow.invoke(input);
}