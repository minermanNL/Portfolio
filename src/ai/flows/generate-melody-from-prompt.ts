'use server';

/**
 * @fileOverview Generates a melody based on a text prompt, using different models for MIDI and description.
 *
 * - generateMelodyFromPrompt - A function that handles the melody generation process.
 * - GenerateMelodyFromPromptInput - The input type for the generateMelodyFromPrompt function.
 * - GenerateMelodyFromPromptOutput - The return type for the generateMelodyFromPrompt function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateMelodyFromPromptInputSchema = z.object({
  prompt: z.string().describe('A text prompt describing the desired melody.'),
});
export type GenerateMelodyFromPromptInput = z.infer<
  typeof GenerateMelodyFromPromptInputSchema
>;

// Final output schema for the flow (combines midi and description)
const GenerateMelodyFromPromptOutputSchema = z.object({
  midiData: z.string().describe('The generated melody in MIDI format.'),
  description: z.string().describe('A description of how the melody was generated')
});
export type GenerateMelodyFromPromptOutput = z.infer<
  typeof GenerateMelodyFromPromptOutputSchema
>;

// Schema for the MIDI generation prompt's output
const MelodyMidiOutputSchema = z.object({
  midiData: z.string().describe('The generated melody in MIDI format text.'),
});

// Schema for the Description generation prompt's output
const MelodyDescriptionOutputSchema = z.object({
    description: z.string().describe('A description of the generated melody.')
});

// --- System Prompt for MIDI Generation (using 2.5 Flash) ---
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

// --- System Prompt for Description Generation (using 2.0 Flash-Lite) ---
const melodyDescriptionSystemPrompt = `System Prompt: Melody Description Generator

Core Directive: Based on the user's request for a melody, generate a concise and informative description of its expected musical characteristics. This description should cover the likely genre/style, mood/feeling, key/mode, and tempo, noting any aspects that were likely assumed because they were not explicitly provided by the user.

Output Format: Provide the description as a single paragraph of text. Do NOT include any MIDI data or technical specifications like ticks or resolution in this output.

User Prompt: {{{prompt}}}`; // Takes the original user prompt as input


// Define the prompt for MIDI data generation (using 2.5 Flash)
const generateMelodyMidiPrompt = ai.definePrompt({
  name: 'generateMelodyMidiPrompt',
  input: {schema: GenerateMelodyFromPromptInputSchema},
  output: {schema: MelodyMidiOutputSchema},
  // Combine the system prompt and user prompt template
  prompt: `${melodyMidiSystemPrompt}

User Prompt: {{{prompt}}}`,
});

// Define the prompt for Description generation (using 2.0 Flash-Lite)
const generateMelodyDescriptionPrompt = ai.definePrompt({
    name: 'generateMelodyDescriptionPrompt',
    input: {schema: GenerateMelodyFromPromptInputSchema},
    output: {schema: MelodyDescriptionOutputSchema},
    prompt: melodyDescriptionSystemPrompt,
});


// Main flow orchestrating the two prompts
const generateMelodyFromPromptFlow = ai.defineFlow(
  {
    name: 'generateMelodyFromPromptFlow',
    inputSchema: GenerateMelodyFromPromptInputSchema,
    outputSchema: GenerateMelodyFromPromptOutputSchema,
  },
  async input => {
    // 1. Generate MIDI data using 2.5 Flash
    const midiResult = await generateMelodyMidiPrompt(input, {
      model: 'googleai/gemini-2.5-flash-preview-04-17',
      timeout: 240000,
      generation_config: {
        thinking_budget: 0,
      },
    });

    // 2. Generate description using 2.0 Flash-Lite (re-use the original user input)
    const descriptionResult = await generateMelodyDescriptionPrompt(input, {
        model: 'googleai/gemini-2.0-flash-lite',
        timeout: 60000, // Description generation should be faster
         generation_config: {
          thinking_budget: 0,
        },
    });

    // Combine results into the final output format
    return {
        midiData: midiResult.output?.midiData || '',
        description: descriptionResult.output?.description || 'Could not generate description.',
    };
  }
);

export async function generateMelodyFromPrompt(
  input: GenerateMelodyFromPromptInput
): Promise<GenerateMelodyFromPromptOutput> {
  return generateMelodyFromPromptFlow(input);
}
