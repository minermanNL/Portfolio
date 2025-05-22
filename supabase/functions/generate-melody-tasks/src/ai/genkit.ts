// supabase/functions/generate-melody-tasks/src/ai/genkit.ts

import { genkit } from 'npm:genkit';
import { googleAI, gemini } from 'npm:@genkit-ai/googleai'; // Imported gemini

const geminiApiKey = Deno.env.get('GEMINI_API_KEY');

if (!geminiApiKey) {
  console.error('Genkit Configuration Error: Missing env var GEMINI_API_KEY.');
  throw new Error('Missing env var GEMINI_API_KEY for Genkit/GoogleAI configuration.');
}

export const ai = genkit({
  plugins: [
    googleAI({
      apiKey: geminiApiKey,
    }),
  ],
  defaultModel: gemini("models/gemini-2.5-flash-preview-05-20"), // Changed to use gemini() factory with documented model ID
  logLevel: 'debug',
  enableTracingAndMetrics: true,
});

console.log('Genkit instance (ai) initialized successfully with Gemini 2.5 Flash Preview (May 20th).');
