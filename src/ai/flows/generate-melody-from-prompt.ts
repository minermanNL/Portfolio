'use server';

/**
 * @fileOverview Generates a melody based on a text prompt.
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

const GenerateMelodyFromPromptOutputSchema = z.object({
  midiData: z.string().describe('The generated melody in MIDI format.'),
  description: z.string().describe('A description of how the melody was generated')
});
export type GenerateMelodyFromPromptOutput = z.infer<
  typeof GenerateMelodyFromPromptOutputSchema
>;

// Define the detailed system prompt for melody generation
const melodySystemPrompt = `System Prompt: Advanced Single Melody Generation

Core Directive: Generate one highly creative, cohesive, and stylistically authentic Main Melody. The melody must be loopable over 16 bars and adhere strictly to all specified technical and musical parameters.

I. Foundational Constraints (Non-Negotiable):

AI Originality Acknowledgement: Your generation is based on learned patterns. Strive for maximum novelty and distinctiveness within the bounds of your training data for the specified genre.
Blank Slate Generation: Each request is a new creative endeavor. Do not recall or directly modify outputs from previous, unrelated prompts.
Strict Chronological & Absolute Ticks: All "Tick" values in the output MUST be absolute (from Tick 0) and in strictly increasing chronological order. One event per line.
No Tick Calculation Shortcuts: The "+" character or any other form of relative tick calculation is STRICTLY FORBIDDEN in the output.
Precise Quantization: All NoteOn and NoteOff events must align perfectly with standard musical grid subdivisions (e.g., 8ths, 16ths, triplets, quarter notes) based on the specified Resolution. No off-grid notes.
Output Format Adherence: Produce exactly one text block, clearly labeled, containing the MIDI-like events. This block must include Tempo:, Resolution:, and End:, lines with correctly calculated values.
II. User-Defined Creative Parameters (To be provided with each request):

A. Target Genre/Style: [User Input: e.g., "Dark Trap (Ken Carson style)", "Euphoric Hardstyle Lead", "Summer Pop EDM (Kygo style)", "Melancholic Lo-fi Piano", "Aggressive Jumpstyle Riff", "Classical Baroque Fugue Subject"]
Implication: Deeply analyze the defining characteristics of this genre: typical scales/modes, rhythmic motifs, melodic contours, common intervals, phrasing, and energy levels.
B. Desired Mood/Feeling: [User Input: e.g., "Menacing, Hypnotic, Driving", "Uplifting, Energetic, Anthemic", "Chill, Nostalgic, Dreamy", "Unnerving, Anxious, Sparse"]
Implication: Translate these adjectives into musical choices concerning pitch range, rhythmic density, melodic direction, use of dissonance/consonance, and note articulation (implied by duration).
C. Key & Mode: [UserInput: e.g., "C# Minor", "G Major", "A Phrygian Dominant", "F Lydian"]
Implication: The melody must primarily use notes from this specified tonality. Characteristic accidentals (e.g., raised 7th in harmonic minor) are permissible if stylistically appropriate for the genre.
D. Tempo (BPM): [User Input: e.g., 90, 128, 145, 150, 170]
Implication: This directly affects the perceived energy and the absolute duration of notes based on ticks.
III. Fixed Technical Parameters (Constant for all requests using this system prompt):

Time Signature: 4/4
Loop Length: Exactly 16 bars.
Resolution: 480 (Ticks per Quarter Note).
Output Channel: Channel 1.
Default NoteOn Velocity: 100 (unless the specified genre/mood strongly implies a softer approach, e.g., "very soft lullaby," in which case adjust appropriately but consistently).
Default NoteOff Velocity: 0.
IV. Calculated Values (To be derived by the AI system before generation):

Tempo (Microseconds per Beat): [AI System Calculation: 60,000,000 / User-Specified BPM]
Total Ticks (End Tick for 16 Bars): [AI System Calculation: 16 bars * 4 beats/bar * Resolution = 30720 ticks. This is constant. The Tempo: line in µs/beat handles the actual speed.]

V. Main Melody Generation Guidelines (Channel 1):

Primary Focus: This melody IS the track's central hook. It must be impactful and memorable within the specified genre.
Motif Development:
Establish a core melodic and/or rhythmic motif (1-2 bars long) that strongly reflects the [Genre/Style] and [Desired Mood/Feeling].
Repeat this motif, but introduce subtle variations in pitch, rhythm, or articulation to maintain interest and create a sense of progression across the 16 bars. Avoid exact, monotonous repetition for the entire duration. Think AABA, ABAB, or ABAC structures within the 16 bars.
Rhythmic Drive & Energy:
Adapt rhythmic density based on genre. For "Aggressive/Driving" styles, ensure near-constant rhythmic activity (e.g., 8ths, 16ths) with minimal rests. For "Sparse/Atmospheric" styles, use longer notes and more silence strategically.
Utilize syncopation effectively if characteristic of the genre.
Note Choices & Harmony Implication:
Adhere to the [Key & Mode].
Incorporate Chords (Optional but Encouraged for certain styles): If the genre/style benefits from it (e.g., synth stabs in Hardstyle, piano chords in some pop/house), use multiple NoteOn events at the exact same absolute tick to create simple chords (e.g., Root-5th power chords, basic triads). This should be part of the "Main Melody" layer. Ensure these chords reinforce the primary melodic idea and rhythm, rather than creating a separate harmonic layer.
Use octaves for emphasis and dynamic variation where appropriate.
Loopability: The final notes of bar 16 must create a smooth and musically logical transition back to the beginning of bar 1.
Cohesion: The entire 16-bar melody must feel like a single, intentionally composed piece, not a random collection of notes.
VI. Output Formatting (Strict):

Produce one single text block, precisely as follows:

--- Main Melody (Channel 1) ---
Tempo: [Calculated Microseconds Per Beat]
Resolution: 480
Tick 0: NoteOn Channel 1 Note [Note#] Velocity [Velocity]
Tick [X]: NoteOff Channel 1 Note [Note#] Velocity 0
Tick [Y]: NoteOn Channel 1 Note [Note#] Velocity [Velocity]
Tick [Y]: NoteOn Channel 1 Note [Note#] Velocity [Velocity] // Optional: Example of chord notes at same tick
... (All subsequent events with absolute, chronological ticks) ...
End: 30720
Final Review Checklist for AI:

Does the melody strongly reflect the specified Genre, Mood, and Key/Mode?
Is it genuinely catchy and memorable, built around a clear motif with variation?
Are all technical constraints (16 bars, 4/4, resolution, channel) met?
Are all tick values absolute and strictly chronological?
Is the "+" character ABSENT from tick specifications?
Is the output formatted exactly as requested in one single block?
Does the melody loop effectively? `;

export async function generateMelodyFromPrompt(
  input: GenerateMelodyFromPromptInput
): Promise<GenerateMelodyFromPromptOutput> {
  return generateMelodyFromPromptFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateMelodyFromPromptPrompt',
  input: {schema: GenerateMelodyFromPromptInputSchema},
  output: {schema: GenerateMelodyFromPromptOutputSchema},
  // Combine the system prompt and user prompt template
  prompt: `${melodySystemPrompt}

User Prompt: {{{prompt}}}`,
});

const generateMelodyFromPromptFlow = ai.defineFlow(
  {
    name: 'generateMelodyFromPromptFlow',
    inputSchema: GenerateMelodyFromPromptInputSchema,
    outputSchema: GenerateMelodyFromPromptOutputSchema,
  },
  async input => {
    // Execute the prompt by calling the prompt object directly with a 4-minute timeout
    const result = await prompt(input, { model: 'googleai/gemini-2.5-flash-preview-04-17', timeout: 240000,
      generation_config: {
        thinking_budget: 0, // Set thinking budget to 0 for fastest response
      },
     });

    // Assuming the result structure has an 'output' property containing the parsed schema output
    const output = result.output;

    // The description might still be generated by this prompt,
    // but if a separate flash model description is needed, that would require another step/flow.
    // For now, we assume the prompt is generating both the midiData and description using pro.

    return output!; // Ensure output is not null/undefined
  }
);
