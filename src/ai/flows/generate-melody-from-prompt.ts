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

export async function generateMelodyFromPrompt(
  input: GenerateMelodyFromPromptInput
): Promise<GenerateMelodyFromPromptOutput> {
  return generateMelodyFromPromptFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateMelodyFromPromptPrompt',
  input: {schema: GenerateMelodyFromPromptInputSchema},
  output: {schema: GenerateMelodyFromPromptOutputSchema},
  prompt: `You are a composer's assistant. Generate a melody in MIDI format based on the user's prompt. The melody should match the mood, style, and instrumentation described in the prompt.  Return the MIDI data and a description of how the melody was generated.\n\nPrompt: {{{prompt}}}`, 
});

const generateMelodyFromPromptFlow = ai.defineFlow(
  {
    name: 'generateMelodyFromPromptFlow',
    inputSchema: GenerateMelodyFromPromptInputSchema,
    outputSchema: GenerateMelodyFromPromptOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
