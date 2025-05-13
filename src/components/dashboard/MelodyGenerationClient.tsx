"use client";

import { useState, useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { generateMelodyFromPrompt, GenerateMelodyFromPromptOutput } from '@/ai/flows/generate-melody-from-prompt';
import { Sparkles, Download, FileAudio, Loader2, TimerIcon } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { parseTextToMidi } from '@/parseTextToMidi'; // Corrected import path

const melodyGenerationSchema = z.object({
  prompt: z.string().min(10, { message: 'Prompt must be at least 10 characters long.' }).max(500, { message: 'Prompt cannot exceed 500 characters.' }),
});

type MelodyGenerationFormValues = z.infer<typeof melodyGenerationSchema>;

export function MelodyGenerationClient() {
  const [isLoading, setIsLoading] = useState(false);
  const [melodyResult, setMelodyResult] = useState<GenerateMelodyFromPromptOutput | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [timer, setTimer] = useState(240); // Timer state for visual countdown, set to 240 seconds (4 minutes)
  const timerRef = useRef<NodeJS.Timeout | null>(null); // Ref to store timer interval ID
  const { toast } = useToast();

  const form = useForm<MelodyGenerationFormValues>({
    resolver: zodResolver(melodyGenerationSchema),
    defaultValues: {
      prompt: '',
    },
  });

  // Effect to handle the countdown timer
  useEffect(() => {
    if (isLoading) {
      setTimer(240); // Reset timer to 240 seconds when loading starts
      timerRef.current = setInterval(() => {
        setTimer((prevTimer) => {
          if (prevTimer <= 1) {
            clearInterval(timerRef.current!); // Stop timer at 0
            return 0;
          }
          return prevTimer - 1;
        });
      }, 1000);
    } else {
      // Clear interval when loading stops
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      // Optionally reset timer display if needed when not loading
      // setTimer(240); // Could reset to 240 here if you want it to show 240 when idle
    }

    // Cleanup on component unmount
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [isLoading]); // Depend on isLoading state

  const onSubmit = async (data: MelodyGenerationFormValues) => {
    setIsLoading(true);
    setMelodyResult(null);
    setError(null);
    // Timer starts automatically due to useEffect when isLoading becomes true

    try {
      const result = await generateMelodyFromPrompt({ prompt: data.prompt });
      if (result && result.midiData) {
        setMelodyResult(result);
        toast({
          title: 'Melody Generated!',
          description: 'Your AI-powered melody is ready.',
        });
      } else {
        // Handle cases where result is null, undefined, or midiData is missing
        throw new Error(result?.description || "Failed to generate melody or received empty data.");
      }
    } catch (err: any) {
      // Check if the error is likely a timeout from the server action
      const isTimeout = err.message?.includes('504') || err.message?.includes('timed out') || err.message?.includes('deadline exceeded');
      const errorMessage = isTimeout 
        ? 'Melody generation is taking longer than expected. Please wait or try again. Check server logs for more details if this persists.' 
        : err.message || 'An unknown error occurred during melody generation.';
        
      setError(errorMessage);
      toast({
        title: isTimeout ? 'Generation Still Processing?' : 'Generation Failed',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
      // Timer cleanup is handled by the useEffect when isLoading becomes false
    }
  };

  const handleDownloadMidi = () => {
    if (melodyResult?.midiData) {
      try {
        // Use the imported parsing function
        // Create a Blob from the MIDI bytes
        const blob = new Blob([parseTextToMidi(melodyResult.midiData)], {type: 'audio/midi'});

        // Create a download URL
        const url = URL.createObjectURL(blob);

        // Create a temporary anchor element and trigger download
        const a = document.createElement('a');
        a.href = url;
        a.download = 'generated_melody.mid'; // Suggested filename
        document.body.appendChild(a);
        a.click();

        // Clean up
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        toast({ title: "Download Started", description: "Your MIDI file should be downloading."});

      } catch (e: any) {
        console.error("Error downloading MIDI:", e);
        toast({
          title: 'Download Failed',
          description: `Could not process MIDI data: ${e.message}`,
          variant: 'destructive',
        });
      }
    } else {
       toast({
          title: 'Download Failed',
          description: 'No melody data available to download.',
          variant: 'destructive',
        });
    }
  };

  return (
    <div className="space-y-8">
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl flex items-center"><Sparkles className="mr-2 h-6 w-6 text-accent" /> AI Melody Generator</CardTitle>
          <CardDescription>Describe the melody you want to create, and let our AI bring it to life.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="prompt" className="text-lg font-medium">Your Melody Prompt</Label>
              <Textarea
                id="prompt"
                placeholder="e.g., A melancholic piano melody in C minor, slow tempo, suitable for a rainy day scene..."
                {...form.register('prompt')}
                className="min-h-[120px] text-base"
                aria-invalid={form.formState.errors.prompt ? "true" : "false"}
              />
              {form.formState.errors.prompt && (
                <p className="text-sm text-destructive">{form.formState.errors.prompt.message}</p>
              )}
            </div>
            <Button type="submit" className="w-full md:w-auto bg-accent hover:bg-accent/90 text-accent-foreground text-lg py-3 px-6" disabled={isLoading}>
              {isLoading ? (
                <span className="flex items-center">
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Generating...
                  {timer >= 0 && ( // Display timer while counting down or at 0
                    <span className="ml-2 flex items-center text-sm">
                       <TimerIcon className="mr-1 h-4 w-4" /> {timer === 0 ? '<1' : timer}s
                    </span>
                  )}
                   {timer < 0 && ( // Should not happen with current logic, but for safety
                    <span className="ml-2 text-sm">Still working...</span>
                   )}
                </span>
              ) : (
                <>
                  <Sparkles className="mr-2 h-5 w-5" />
                  Generate Melody
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      {error && (
         <Alert variant="destructive" className="shadow-md">
          <AlertTitle>Error Generating Melody</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {melodyResult && (
        <Card className="shadow-lg animate-in fade-in duration-500">
          <CardHeader>
            <CardTitle className="text-xl flex items-center"><FileAudio className="mr-2 h-6 w-6 text-primary" /> Generated Melody Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-semibold text-muted-foreground">Description:</h4>
              <p className="text-foreground/90">{melodyResult.description}</p>
            </div>
            {/* Placeholder for MIDI player or visualizer */}
            <div className="p-4 border rounded-md bg-secondary/50 text-center">
              <p className="text-muted-foreground">MIDI player/visualizer would appear here.</p>
              {/* Removed console log and added truncated MIDI data preview */}
               {melodyResult.midiData && (
                 <p className="text-sm text-muted-foreground mt-1 truncate">MIDI Data: {melodyResult.midiData.substring(0, 200)}...</p>
               )}
            </div>
          </CardContent>
          <CardFooter>
            <Button onClick={handleDownloadMidi} variant="outline">
              <Download className="mr-2 h-5 w-5" />
              Download MIDI
            </Button>
          </CardFooter>
        </Card>
      )}
       {!isLoading && !melodyResult && !error && (
        <Card className="shadow-md">
          <CardContent className="py-12 text-center">
            <Sparkles className="mx-auto h-12 w-12 text-muted-foreground/50 mb-4" />
            <p className="text-lg text-muted-foreground">
              Your generated melody will appear here.
            </p>
            <p className="text-sm text-muted-foreground/80">
              Enter a prompt above and click "Generate Melody" to start.
            </p>
          </CardContent>
        </Card>
      )}
       {/* Display loading spinner below form when loading and no result/error yet */}
      {isLoading && !melodyResult && !error && <div className="flex justify-center py-8"><LoadingSpinner size={48} /></div>}
    </div>
  );
}
