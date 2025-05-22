// supabase/functions/generate-melody-tasks/src/ai/flows/generate-melody-from-prompt.ts

// Core Genkit and Zod imports
import { z } from 'https://esm.sh/zod@3';
import { ai } from '../genkit.ts'; // Imports the configured ai instance

// Supabase imports
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
  midiBase64: z.string().describe("The base64 encoded MIDI data from the model.") 
});

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


// --- System Prompts (FULL CONTENT) ---
const melodyMidiSystemPrompt = `System Prompt: Flexible Single Melody Generation (MIDI Output Only)

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

const melodyDescriptionSystemPrompt = `System Prompt: Melody Description Generator

Core Directive: Based on the user's request for a melody, generate a concise and informative description of its expected musical characteristics. This description should cover the likely genre/style, mood/feeling, key/mode, and tempo, noting any aspects that were likely assumed because they were not explicitly provided by the user.

Output Format: Provide the description as a single paragraph of text. Do NOT include any MIDI data or technical specifications like ticks or resolution in this output.`;


// --- Prompt Definitions (CRITICAL CHANGE: Using template strings for prompts) ---
// This relies on Genkit's dotprompt system to handle message construction
const generateMelodyMidiPrompt = ai.definePrompt(
  {
    name: 'generateMelodyMidi',
    inputSchema: z.object({ userPrompt: z.string() }), // Input to the prompt
    outputSchema: MelodyMidiOutputSchema,
    config: {
      temperature: 0.75,
      candidateCount: 1,
    },
    // Use the prompt string directly. Genkit's dotprompt will handle messages structure.
    // The 'userPrompt' from inputSchema will be available as '{{userPrompt}}' in the template.
    prompt: `${melodyMidiSystemPrompt}

User Prompt: {{{userPrompt}}}`, // <--- USING TEMPLATE STRING WITH userPrompt placeholder
  }
);

const generateMelodyDescriptionPrompt = ai.definePrompt(
  {
    name: 'generateMelodyDescription',
    inputSchema: z.object({ // Input to the prompt
      originalPrompt: z.string(),
      melodyContext: z.string(),
    }),
    outputSchema: MelodyDescriptionOutputSchema,
    config: {
      temperature: 0.6,
    },
    // Use the prompt string directly.
    // Placeholders '{{originalPrompt}}' and '{{melodyContext}}' will be filled from inputSchema.
    prompt: `${melodyDescriptionSystemPrompt}

Original User Prompt: {{{originalPrompt}}}
Melody Context: {{{melodyContext}}}`, // <--- USING TEMPLATE STRING WITH PLACEHOLDERS
  }
);

// Flow Definition
export const generateMelodyFromPromptFlow = ai.defineFlow(
  {
    name: 'generateMelodyFromPromptFlow',
    inputSchema: GenerateMelodyFromPromptInputSchema,
    outputSchema: GenerateMelodyFromPromptOutputSchema,
  },
  async (input) => {
    const { taskId, prompt } = input;
    const targetModelName = 'googleai/gemini-2.5-flash-preview-05-20'; 
    console.log(`Task ${taskId}: >>> Entering generateMelodyFromPromptFlow. Using model: ${targetModelName}`);

    try {
      await supabase.from('tasks').update({ 
        status: 'PROCESSING', 
        updated_at: new Date().toISOString() 
      }).eq('id', taskId);
      console.log(`Task ${taskId}: Status updated to PROCESSING.`);

      // Step 1: Generate MIDI
      const midiResponse = await ai.generate({
        prompt: generateMelodyMidiPrompt,
        input: { userPrompt: prompt }, // Provide input that matches prompt's inputSchema
        model: targetModelName,           // Pass model name string directly.
        output: { format: 'json', schema: MelodyMidiOutputSchema }, 
      });
      
      const midiOutput = midiResponse.output(); 
      const midiData = midiOutput?.midiBase64;

      if (!midiData) {
        console.error(`MIDI generation failed for task ${taskId}. Output was:`, midiOutput, "Full response:", JSON.stringify(midiResponse));
        throw new Error(`MIDI generation failed for task ${taskId}. No midiBase64 data produced.`);
      }
      console.log(`Task ${taskId}: MIDI data generation complete.`);

      // Step 2: Generate Description
      const descriptionResponse = await ai.generate({
        prompt: generateMelodyDescriptionPrompt, // Pass the defined prompt object
        input: { 
          melodyContext: "a MIDI melody", // Provide input that matches prompt's inputSchema
          originalPrompt: prompt 
        },
        model: targetModelName,
        output: { format: 'json', schema: MelodyDescriptionOutputSchema },
      });
      
      const descriptionOutput = descriptionResponse.output();
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
        modelUsed: targetModelName 
      };
    } catch (error: any) {
      console.error(`Task ${taskId}: CRITICAL Error in melody generation flow: ${error.message}\nStack: ${error.stack}`);
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
          console.error(`DB fallback error: ${dbErr.message}`); 
        }
      }
      return { 
        taskId, 
        midiData: '', 
        description: `Error: ${error.message}`, 
        modelProvider: 'unknown', 
        modelUsed: targetModelName 
      };
    }
  }
);

export async function generateMelodyFromPrompt(
  input: GenerateMelodyFromPromptInput
): Promise<GenerateMelodyFromPromptOutput> {
  return generateMelodyFromPromptFlow.invoke(input);
}