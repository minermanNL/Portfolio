// supabase/functions/generate-melody-tasks/src/ai/flows/generate-melody-from-prompt.ts

import { z } from 'https://esm.sh/zod@3';
import { ai } from '../genkit.ts'; // Imports the configured ai instance
import { gemini } from 'npm:@genkit-ai/googleai'; // Import gemini factory
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { Database } from '../../types/supabase.ts';
import { parseTextToMidi } from '../../parseTextToMidi.ts'; // Import the MIDI parsing function

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

    // System Prompts (now combined into user messages) - DEFINED INSIDE THE FLOW
    const MELODY_MIDI_SYSTEM_PROMPT = `System Prompt: Flexible Single Melody Generation (MIDI Output Only)

Core Directive: Generate one highly creative, cohesive, and stylistically authentic Main Melody. The melody should be loopable over 16 bars and adhere to specified technical and musical parameters where provided. If parameters are not provided, make reasonable, musically appropriate assumptions based on the user's prompt.

Respond ONLY with the text block containing the MIDI-like events. Do NOT include any introductory or concluding text, explanations, or the description of the melody in this output.

I. User-Defined Creative Parameters (Preferences - Make Assumptions if Not Provided):

A. Target Genre/Style: [User Input or AI Assumption: e.g., "Dark Trap", "Hardstyle", "Pop EDM", "Lo-fi Piano", "Classical"]
Guideline: Consider typical characteristics of the genre/style: scales/modes, rhythmic motifs, melodic contours, common intervals, phrasing, and energy levels. If not specified, assume a generic but pleasant and common style (e.g., simple pop or piano piece).

B. Desired Mood/Feeling: [User Input or AI Assumption: e.g., "Menacing", "Uplifting", "Chill", "Unnerving"]
Guideline: Translate these into musical choices concerning pitch range, rhythmic density, melodic direction, use of dissonance/consonance, and note articulation (implied by duration). If not specified, assume a neutral or slightly positive mood.

C. Key & Mode: [User Input or AI Assumption: e.g., "C# Minor", "G Major"]
Guideline: The melody should primarily use notes from this specified tonality. If not specified, assume a common and generally pleasant key/mode (e.g., C Major or A Minor).

D. Tempo (BPM): [User Input or AI Assumption: e.g., 90, 128, 145]
Guideline: This affects the perceived energy and the absolute duration of notes based on ticks. If not specified, assume a moderate tempo (e.g., 120 BPM) suitable for a wide range of styles.

II. Fixed Technical Parameters (Constant for all requests using this system prompt):

Time Signature: 4/4
Loop Length: Exactly 16 bars.
Resolution: 480 (Ticks per Quarter Note).
Strict Chronological & Absolute Ticks: All "Tick" values in the output MUST be absolute (from Tick 0) and in strictly increasing chronological order. One event per line.
No Tick Calculation Shortcuts: The "+" character or any other form of relative tick calculation is STRICTLY FORBIDDEN in the output.
Precise Quantization: All NoteOn and NoteOff events must align perfectly with standard musical grid subdivisions (e.g., 8ths, 16ths, triplets, quarter notes) based on the specified Resolution. No off-grid notes.
Output Channel: Channel 1.
Default NoteOn Velocity: 100 (Adjust appropriately based on the inferred or specified mood/style).
Default NoteOff Velocity: 0.

III. Calculated Values (To be derived by the AI system before generation):

Tempo (Microseconds per Beat): [AI System Calculation: 60,000,000 / User-Specified or Assumed BPM]
Total Ticks (End Tick for 16 Bars): [AI System Calculation: 16 bars * 4 beats/bar * Resolution = 30720 ticks. This is constant. The Tempo: line in µs/beat handles the actual speed.]

IV. Main Melody Generation Guidelines (Channel 1):

Primary Focus: This melody IS the track's central hook. It must be impactful and memorable within the specified or assumed genre.
Motif Development:
Establish a core melodic and/or rhythmic motif (1-2 bars long) that strongly reflects the [Genre/Style] and [Desired Mood/Feeling].
Repeat this motif, but introduce subtle variations in pitch, rhythm, or articulation to maintain interest and create a sense of progression across the 16 bars. Avoid exact, monotonous repetition for the entire duration. Think AABA, ABAB, or ABAC structures within the 16 bars.
Rhythmic Drive & Energy:
Adapt rhythmic density based on the specified or assumed genre. For "Aggressive/Driving" styles, ensure near-constant rhythmic activity (e.g., 8ths, 16ths) with minimal rests. For "Sparse/Atmospheric" styles, use longer notes and more silence strategically.
Utilize syncopation effectively if characteristic of the specified or assumed genre.
Note Choices & Harmony Implication:
Adhere to the specified or assumed [Key & Mode].
Incorporate Chords (Optional but Encouraged for certain styles): If the specified or assumed genre/style benefits from it, use multiple NoteOn events at the exact same absolute tick to create simple chords. Ensure these chords reinforce the primary melodic idea and rhythm.
Use octaves for emphasis and dynamic variation where appropriate.
Loopability: The final notes of bar 16 must create a smooth and musically logical transition back to the beginning of bar 1.
Cohesion: The entire 16-bar melody must feel like a single, intentionally composed piece, not a random collection of notes.

V. Output Formatting (Strict):

Produce ONE single text block, precisely as follows, starting and ending exactly as shown:

--- Main Melody (Channel 1) ---
Tempo: [Calculated Microseconds Per Beat]
Resolution: 480
Tick 0: NoteOn Channel 1 Note [Note#] Velocity [Velocity]
...
End: 30720

Final Review Checklist for AI:

Does the melody reflect the user's prompt, making reasonable assumptions for missing details?
Is it catchy and memorable, built around a clear motif with variation?
Are all technical constraints (16 bars, 4/4, resolution, channel, absolute ticks) met?
Is the output ONLY the MIDI text block, formatted exactly as requested?
Does the melody loop effectively?`;

    const MELODY_DESCRIPTION_SYSTEM_PROMPT = `System Prompt: Melody Description Generator

Core Directive: Based on the user's request for a melody, generate a concise and informative description of its expected musical characteristics. This description should cover the likely genre/style, mood/feeling, key/mode, and tempo, noting any aspects that were likely assumed because they were not explicitly provided by the user.

Output Format: Provide the description as a single paragraph of text. Do NOT include any MIDI data or technical specifications like ticks or resolution in this output.`;

    // Define models for each step
    const midiModelName = 'models/gemini-2.5-flash-preview-05-20';
    const descriptionModelName = 'models/gemini-1.5-flash-latest'; // Using a Gemini 1.5 Flash model for description

    const midiModel = gemini(midiModelName);
    const descriptionModel = gemini(descriptionModelName);

    console.log(`Task ${taskId}: >>> Entering generateMelodyFromPromptFlow. MIDI Model: ${midiModelName}, Description Model: ${descriptionModelName}`);

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

      // Step 1: Generate MIDI using the specified MIDI model - Expecting raw text output
      const sanitizedUserPromptForMidi = sanitizeString(prompt, 'Generate a simple test melody.');
      const combinedMidiPromptContent = `${MELODY_MIDI_SYSTEM_PROMPT}

User Prompt: ${sanitizedUserPromptForMidi}`;

      const midiResponse = await ai.generate({
        model: midiModel, // Use the specific MIDI model
        messages: [
          { role: 'user', content: [{ text: combinedMidiPromptContent }] } // System prompt included in user message
        ],
        // REMOVED output schema for MIDI to get raw text
      });
      
      // Access raw text output and pass to parser
      const midiTextOutput = midiResponse.text; // Access raw text as property
      console.log('Raw MIDI text output from model:', midiTextOutput); // Added logging here

      const midiData = parseTextToMidi(midiTextOutput); // Parse the text into MIDI data

      if (!midiData) {
        console.error(`MIDI generation failed for task ${taskId}. Parsed data was:`, midiData, "Raw text output:", midiTextOutput, "Full response:", JSON.stringify(midiResponse));
        // Consider a more specific error message based on parseTextToMidi failure
        throw new Error(`MIDI generation failed for task ${taskId}. Could not parse MIDI data from model output.`);
      }
      console.log(`Task ${taskId}: MIDI data generation complete.`);

      // Step 2: Generate Description using the specified Description model - Still using JSON schema
      const sanitizedUserPromptForDescription = sanitizeString(prompt, 'A melody was generated.');
      const melodyContextForDescription = "the MIDI for the melody has been successfully generated.";
      const combinedDescriptionPromptContent = `${MELODY_DESCRIPTION_SYSTEM_PROMPT}

The original user request was: "${sanitizedUserPromptForDescription}". Based on this, ${melodyContextForDescription}. Describe its likely character, style, and potential instrumentation.`;

      const descriptionResponse = await ai.generate({
        model: descriptionModel, // Use the specific Description model
        messages: [
          { role: 'user', content: [{ text: combinedDescriptionPromptContent }] } // System prompt included in user message
        ],
        output: { format: 'json', schema: MelodyDescriptionOutputSchema }, // Keep output schema for JSON description
      });
      
      // Access .output as a property for JSON description
      const descriptionOutput = descriptionResponse.output; 
      const description = descriptionOutput?.description || "No description could be generated.";
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
        modelUsed: `${midiModelName} (MIDI), ${descriptionModelName} (Description)` // Indicate both models used
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
        modelUsed: `Error with models: ${midiModelName}, ${descriptionModelName}` 
      };
    }
  }
);

export async function generateMelodyFromPrompt(
  input: GenerateMelodyFromPromptInput
): Promise<GenerateMelodyFromPromptOutput> {
  return generateMelodyFromPromptFlow.invoke(input);
}
