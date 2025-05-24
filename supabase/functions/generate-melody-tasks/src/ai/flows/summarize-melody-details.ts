'use server';

/**
 * @fileOverview Summarizes the key characteristics of a melody.
 *
 * - summarizeMelodyDetails - A function that takes melody details and returns a summary.
 * - SummarizeMelodyDetailsInput - The input type for the summarizeMelodyDetails function.
 * - SummarizeMelodyDetailsOutput - The return type for the summarizeMelodyDetails function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SummarizeMelodyDetailsInputSchema = z.object({
  melodyDetails: z
    .string()
    .describe('Detailed information about the melody, including key, tempo, and instrumentation.'),
});
export type SummarizeMelodyDetailsInput = z.infer<typeof SummarizeMelodyDetailsInputSchema>;

const SummarizeMelodyDetailsOutputSchema = z.object({
  summary: z
    .string()
    .describe('A concise summary of the melody, highlighting its key characteristics.'),
});
export type SummarizeMelodyDetailsOutput = z.infer<typeof SummarizeMelodyDetailsOutputSchema>;

export async function summarizeMelodyDetails(input: SummarizeMelodyDetailsInput): Promise<SummarizeMelodyDetailsOutput> {
  return summarizeMelodyDetailsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'summarizeMelodyDetailsPrompt',
  input: {schema: SummarizeMelodyDetailsInputSchema},
  output: {schema: SummarizeMelodyDetailsOutputSchema},
  prompt: `You are a music expert. Summarize the following melody details but don't make it long or make up untrue statements, highlighting the key characteristics such as key, tempo, and instrumentation.\n\nMelody Details: {{{melodyDetails}}}`,
});

const summarizeMelodyDetailsFlow = ai.defineFlow(
  {
    name: 'summarizeMelodyDetailsFlow',
    inputSchema: SummarizeMelodyDetailsInputSchema,
    outputSchema: SummarizeMelodyDetailsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
