// supabase/functions/generate-melody-tasks/src/ai/flows/refine-melody-prompt.ts

import { z } from 'npm:genkit'; // Using npm:genkit for z for consistency
import { ai } from '../genkit.ts'; // Imports the configured ai instance
import { gemini } from 'npm:@genkit-ai/googleai'; // Import gemini factory

// Define input and output schemas
const RefinePromptInput = z.string();
const RefinePromptOutput = z.string();

const refineMelodyPromptFlow = ai.defineFlow(
  {
    name: 'refineMelodyPromptFlow',
    inputSchema: RefinePromptInput,
    outputSchema: RefinePromptOutput,
  },
  async (prompt) => {
    const systemPrompt = `Goal: Refine user's melody prompt into a detailed creative brief for the MIDI generator.
Instruction: Produce a single descriptive paragraph. Output this as the refined prompt text directly.
Refinement:
Expand Details: From user input, infer/amplify genre, mood, and instrument.
Example: "piano melody" -> "catchy, emotionally resonant piano melody in a minor key, suitable for modern trap or cinematic track, with arpeggios, sustained chords, rhythmic variation, and a memorable motif."
Conditionally add: "constant energy, minimal rests, syncopated/punchy" for aggressive styles.
Append Directive: End with: "follow your system prompt keeping this in mind."`;

    // Instantiate a supported Gemini model
    const refinementModel = gemini('models/gemini-2.0-flash-lite'); // Using 2.0 Flash Lite as requested

    const response = await ai.generate({
      model: refinementModel,
      messages: [
        { role: 'user', content: [{ text: systemPrompt }] },
        { role: 'user', content: [{ text: prompt }] },
      ],
    });

    // --- CRITICAL FIX HERE ---
    // Changed from response.text() to response.text (accessing as a property)
    const refinedPrompt = response.text; // Access the text property directly

    if (!refinedPrompt) {
      throw new Error("Prompt refinement failed.");
    }

    return refinedPrompt;
  }
);

export default refineMelodyPromptFlow;