// supabase/functions/generate-melody-tasks/src/ai/genkit.ts

// Import the main 'genkit' named export (the factory function)
import { genkit } from 'npm:genkit@1.9.0';
// Import the Google AI plugin
import { googleAI } from 'npm:@genkit-ai/googleai@1.9.0';

// Initialize and export the configured Genkit instance
// This 'ai' object will have methods like .defineFlow, .definePrompt, .model
// The initialization happens when this module is imported.
const geminiApiKey = Deno.env.get('GEMINI_API_KEY');

if (!geminiApiKey) {
  console.error('Genkit Configuration Error: Missing env var GEMINI_API_KEY.');
  throw new Error('Missing env var GEMINI_API_KEY for Genkit/GoogleAI configuration.');
}

export const ai = genkit({ // 'genkit' here is the factory function we imported
  plugins: [
    googleAI({
      apiKey: geminiApiKey,
    }),
  ],
  defaultModel: "googleai/gemini-1.5-flash", // Set a default model here if desired
  logLevel: 'debug', // Or 'info', 'warn', 'error' for production
  enableTracingAndMetrics: true, // Recommended for observability
});

console.log('Genkit instance (ai) initialized successfully.');

// The 'configureGenkit' function is no longer needed as 'ai' is exported directly.