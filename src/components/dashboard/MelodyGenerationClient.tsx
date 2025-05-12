"use client";

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { generateMelodyFromPrompt, GenerateMelodyFromPromptOutput } from '@/ai/flows/generate-melody-from-prompt';
import { Sparkles, Download, FileAudio, Loader2 } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';

const melodyGenerationSchema = z.object({
  prompt: z.string().min(10, { message: 'Prompt must be at least 10 characters long.' }).max(500, { message: 'Prompt cannot exceed 500 characters.' }),
});

type MelodyGenerationFormValues = z.infer<typeof melodyGenerationSchema>;

export function MelodyGenerationClient() {
  const [isLoading, setIsLoading] = useState(false);
  const [melodyResult, setMelodyResult] = useState<GenerateMelodyFromPromptOutput | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const form = useForm<MelodyGenerationFormValues>({
    resolver: zodResolver(melodyGenerationSchema),
    defaultValues: {
      prompt: '',
    },
  });

  const onSubmit = async (data: MelodyGenerationFormValues) => {
    setIsLoading(true);
    setMelodyResult(null);
    setError(null);
    try {
      const result = await generateMelodyFromPrompt({ prompt: data.prompt });
      if (result && result.midiData) {
        setMelodyResult(result);
        toast({
          title: 'Melody Generated!',
          description: 'Your AI-powered melody is ready.',
        });
      } else {
        throw new Error("Failed to generate melody or received empty data.");
      }
    } catch (err: any) {
      const errorMessage = err.message || 'An unknown error occurred during melody generation.';
      setError(errorMessage);
      toast({
        title: 'Generation Failed',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownloadMidi = () => {
    if (melodyResult?.midiData) {
      // This is a placeholder. In a real app, midiData would be a URL or actual MIDI file content.
      // If it's base64 encoded MIDI:
      // const byteCharacters = atob(melodyResult.midiData);
      // const byteNumbers = new Array(byteCharacters.length);
      // for (let i = 0; i < byteCharacters.length; i++) {
      //   byteNumbers[i] = byteCharacters.charCodeAt(i);
      // }
      // const byteArray = new Uint8Array(byteNumbers);
      // const blob = new Blob([byteArray], {type: 'audio/midi'});
      // const url = URL.createObjectURL(blob);
      // const a = document.createElement('a');
      // a.href = url;
      // a.download = 'generated_melody.mid';
      // document.body.appendChild(a);
      // a.click();
      // document.body.removeChild(a);
      // URL.revokeObjectURL(url);
      
      // For now, just log it or show a message
      console.log("MIDI Data (simulated download):", melodyResult.midiData);
      toast({ title: "Download Simulated", description: "MIDI data logged to console. Implement actual download."});
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
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Generating...
                </>
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
              <p className="text-sm text-muted-foreground mt-1">(MIDI Data: {melodyResult.midiData.substring(0,50)}...)</p>
            </div>
          </CardContent>
          <CardFooter>
            <Button onClick={handleDownloadMidi} variant="outline">
              <Download className="mr-2 h-5 w-5" />
              Download MIDI (Simulated)
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
       {isLoading && <div className="flex justify-center py-8"><LoadingSpinner size={48} /></div>}
    </div>
  );
}
