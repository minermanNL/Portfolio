"use client";

import { useState, useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { GenerateMelodyFromPromptOutput } from '@/ai/flows/generate-melody-from-prompt'; // Keep for type
import { Sparkles, Download, FileAudio, Loader2, TimerIcon, ArrowRight, Music, Mic } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { useAuthSession } from '@/hooks/useAuthSession'; // Import the hook

const melodyGenerationSchema = z.object({
  prompt: z.string().min(10, { message: 'Prompt must be at least 10 characters long.' }).max(500, { message: 'Prompt cannot exceed 500 characters.' }),
});

type MelodyGenerationFormValues = z.infer<typeof melodyGenerationSchema>;

interface TaskStatusResponse {
  id: string;
  status: string; // 'PENDING', 'PROCESSING', 'COMPLETED', 'FAILED'
  midi_data?: string; // This will now contain the base64 encoded MIDI bytes
  description?: string;
  error_message?: string;
  created_at: string;
  updated_at: string;
}

const POLLING_INTERVAL = 5000; // Poll every 5 seconds

export function MelodyGenerationClient() {
  const { session, isLoading: isSessionLoading } = useAuthSession(); // Use the hook
  const [isGenerating, setIsGenerating] = useState(false); // Use a separate state for submission/polling
  const [melodyResult, setMelodyResult] = useState<GenerateMelodyFromPromptOutput | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [taskId, setTaskId] = useState<string | null>(null);
  const [pollingStatus, setPollingStatus] = useState<string | null>(null);
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const { toast } = useToast();

  const form = useForm<MelodyGenerationFormValues>({
    resolver: zodResolver(melodyGenerationSchema),
    defaultValues: {
      prompt: '',
    },
  });

  // Polling Logic
  useEffect(() => {
    if (!taskId || !['PENDING', 'PROCESSING'].includes(pollingStatus || '')) {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
        pollingIntervalRef.current = null;
      }
      return;
    }

    const poll = async () => {
      const jwt = session?.access_token; // Get JWT from the session hook

      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (jwt) {
        headers['Authorization'] = `Bearer ${jwt}`;
      }

      try {
        const response = await fetch(`/api/melody-status/${taskId}`, {
             headers: headers,
        });

        if (!response.ok) {
            console.error(`Polling error: Status ${response.status}`);
             // If 401 (Unauthorized) or 404 (Not Found - might be RLS issue or task deleted)
            if (response.status === 401 || response.status === 404) {
                 setError(`Polling failed or task not found/authorized. Status: ${response.status}. Please log in again if necessary.`);
                 setIsGenerating(false); // Stop generation loading state
                 setTaskId(null);
                 setPollingStatus('STOPPED_ERROR'); // Indicate polling stopped due to error
                 if (pollingIntervalRef.current) {
                     clearInterval(pollingIntervalRef.current);
                     pollingIntervalRef.current = null;
                 }
            }
            return;
        }

        const taskData = await response.json() as TaskStatusResponse;
        setPollingStatus(taskData.status);

        if (taskData.status === 'COMPLETED') {
          setMelodyResult({
            midiData: taskData.midi_data || '',
            description: taskData.description || 'No description provided.',
          });
          toast({
            title: 'Melody Generated!',
            description: 'Your AI-powered melody is ready.',
          });
          setIsGenerating(false); // Stop generation loading state
          setTaskId(null); // Stop polling
        } else if (taskData.status === 'FAILED') {
          setError(taskData.error_message || 'Melody generation failed for an unknown reason.');
          toast({
            title: 'Generation Failed',
            description: taskData.error_message || 'An error occurred during melody generation.',
            variant: 'destructive',
          });
          setIsGenerating(false); // Stop generation loading state
          setTaskId(null); // Stop polling
        }
      } catch (err: any) {
        console.error('Exception during polling:', err);
        setError('An error occurred while polling for the task status.');
        setIsGenerating(false); // Stop generation loading state
        setTaskId(null);
        setPollingStatus('STOPPED_ERROR'); // Indicate polling stopped due to error
        if (pollingIntervalRef.current) {
            clearInterval(pollingIntervalRef.current);
            pollingIntervalRef.current = null;
        }
      }
    };

    // Only start polling if session is loaded and valid
    if (!isSessionLoading && session) {
        poll();
        pollingIntervalRef.current = setInterval(poll, POLLING_INTERVAL);
    }

    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
      }
    };
  }, [taskId, pollingStatus, toast, session, isSessionLoading]); // Add session and isSessionLoading as dependencies

  const onSubmit = async (data: MelodyGenerationFormValues) => {
    setIsGenerating(true); // Start generation loading state
    setMelodyResult(null);
    setError(null);
    setTaskId(null);
    setPollingStatus(null); // Reset previous status

    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
    }

    // Use session from the hook
    const jwt = session?.access_token;

    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (jwt) {
      headers['Authorization'] = `Bearer ${jwt}`;
    } else {
        // If no session from the hook, display error immediately
        setError('You must be logged in to generate melodies.');
        setIsGenerating(false); // Stop generation loading state
        toast({
             title: 'Authentication Required',
             description: 'Please log in to submit a generation task.',
             variant: 'destructive',
        });
        return;
    }

    try {
      const response = await fetch('/api/generate-melody-task', {
        method: 'POST',
        headers: headers, // Use the headers with Authorization
        body: JSON.stringify({ prompt: data.prompt }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Failed to submit task: ${response.status} ${response.statusText}`);
      }

      const result = await response.json();
      if (result.taskId) {
        setTaskId(result.taskId);
        setPollingStatus('PENDING'); // Trigger polling useEffect
        // isGenerating remains true to show polling status
        toast({
          title: 'Melody Task Submitted',
          description: 'Your melody is being queued for generation. We will notify you shortly.',
        });
      } else {
        throw new Error('Failed to receive a valid task ID from the server.');
      }
    } catch (err: any) {
      console.error('Submission Error:', err);
      setError(err.message || 'An unknown error occurred while submitting the task.');
      toast({
        title: 'Submission Failed',
        description: err.message || 'Could not submit your melody generation task.',
        variant: 'destructive',
      });
      setIsGenerating(false); // Stop generation loading state
    }
  };

  const handleDownloadMidi = () => {
    if (melodyResult?.midiData) {
      try {
        const base64MidiString = melodyResult.midiData; // Already the base64 string

        // Decode base64 string to a binary string
        const binaryString = window.atob(base64MidiString);

        // Convert the binary string to a Uint8Array
        const len = binaryString.length;
        const bytes = new Uint8Array(len);
        for (let i = 0; i < len; i++) {
            bytes[i] = binaryString.charCodeAt(i);
        }

        // Create a Blob from the Uint8Array
        // Use the bytes.buffer to get the underlying ArrayBuffer for robustness
        const blob = new Blob([bytes.buffer], { type: 'audio/midi' });

        // Create an Object URL for the Blob
        const url = URL.createObjectURL(blob);

        // Create a link and trigger the download
        const a = document.createElement('a');
        a.href = url;
        a.download = 'generated_melody.mid'; // Set the desired filename
        document.body.appendChild(a);
        a.click();

        // Clean up by removing the link and revoking the Object URL
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

  // Determine button state and text based on session loading and generation state
  const isSubmitButtonDisabled = isSessionLoading || isGenerating || !session;

  let buttonText = "Generate Melody";
  if (isSessionLoading) {
    buttonText = "Loading Session...";
  } else if (!session) {
    buttonText = "Log in to Generate";
  } else if (isGenerating) {
    if (pollingStatus === 'PENDING') buttonText = "Task Queued, Waiting...";
    else if (pollingStatus === 'PROCESSING') buttonText = "Generating Melody...";
    else if (taskId && !pollingStatus) buttonText = "Initializing Task...";
    else if (pollingStatus === 'STOPPED_ERROR') buttonText = "Error Polling Status";
    else buttonText = "Submitting Task...";
  }


  const showInProgressAlert = isGenerating && taskId && (pollingStatus === 'PENDING' || pollingStatus === 'PROCESSING');
   const showPollingErrorAlert = pollingStatus === 'STOPPED_ERROR'; // Use the new STOPPED_ERROR status

  return (
    <div className="space-y-8">
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl flex items-center"><Sparkles className="mr-2 h-6 w-6 text-accent" /> AI Melody Generator</CardTitle>
          <CardDescription>Describe the melody you want to create. Your request will be processed asynchronously.</CardDescription>
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
                disabled={isGenerating || isSessionLoading || !session} // Disable based on generation and session state
              />
              {form.formState.errors.prompt && (
                <p className="text-sm text-destructive">{form.formState.errors.prompt.message}</p>
              )}
            </div>
            <Button type="submit" className="w-full md:w-auto bg-accent hover:bg-accent/90 text-accent-foreground text-lg py-3 px-6" disabled={isSubmitButtonDisabled}>
              {isGenerating || isSessionLoading ? (
                <span className="flex items-center">
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  {buttonText}
                </span>
              ) : (
                <>
                  <Sparkles className="mr-2 h-5 w-5" />
                  {buttonText}
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Display login requirement message if session is not loaded and no session exists */}
      {!isSessionLoading && !session && (
         <Alert variant="default" className="shadow-md mt-4">
           <AlertTitle>Login Required</AlertTitle>
           <AlertDescription>Please log in to use the AI Melody Generator.</AlertDescription>
         </Alert>
      )}

      {showInProgressAlert && (
        <Alert className="shadow-md mt-4 animate-in fade-in duration-300">
          <TimerIcon className="h-5 w-5 mr-2" />
          <AlertTitle>Generation in Progress (Task ID: {taskId?.substring(0,8)}...)</AlertTitle>
          <AlertDescription>
            Status: <span className="font-semibold uppercase">{pollingStatus}</span>.
            Your melody is being generated. This might take a few moments. The UI will update automatically.
          </AlertDescription>
        </Alert>
      )}
       {showPollingErrorAlert && (
         <Alert variant="destructive" className="shadow-md mt-4">
           <AlertTitle>Polling Issue</AlertTitle>
           <AlertDescription>{error || 'Could not retrieve task status. Polling stopped. It might be an authentication, network, or server issue.'}</AlertDescription>
         </Alert>
       )}

      {error && !showPollingErrorAlert && (
         <Alert variant="destructive" className="shadow-md mt-4">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {melodyResult && (
        <Card className="shadow-lg animate-in fade-in duration-500 mt-4">
          <CardHeader>
            <CardTitle className="text-xl flex items-center"><FileAudio className="mr-2 h-6 w-6 text-primary" /> Generated Melody Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-semibold text-muted-foreground">Description:</h4>
              <p className="text-foreground/90">{melodyResult.description}</p>
            </div>
            <div className="p-4 border rounded-md bg-secondary/50 text-center">
              <p className="text-muted-foreground">MIDI player/visualizer would appear here.</p>
              {melodyResult.midiData && (
                 <p className="text-sm text-muted-foreground mt-1 truncate">MIDI Data Preview (Base64): {melodyResult.midiData.substring(0, 150)}...</p>
               )}
            </div>
          </CardContent>
          <CardFooter>
            <Button onClick={handleDownloadMidi} variant="outline" disabled={!melodyResult.midiData}>
              <Download className="mr-2 h-5 w-5" />
              Download MIDI
            </Button>
          </CardFooter>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8">
           <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="text-xl flex items-center"><Music className="mr-2 h-6 w-6 text-purple-500" /> Manual Text to MIDI</CardTitle>
              <CardDescription>Manually convert AI text output to MIDI.</CardDescription>
            </CardHeader>
            <CardContent>
               <Link href="/dashboard/advanced-tools" passHref>
                 <Button variant="outline" className="w-full">
                    Go to Tool <ArrowRight className="ml-2 h-4 w-4" />
                 </Button>
               </Link>
            </CardContent>
           </Card>

            <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="text-xl flex items-center"><Mic className="mr-2 h-6 w-6 text-blue-500" /> Vocal Generation</CardTitle>
              <CardDescription>Generate vocal melodies or convert text to speech.</CardDescription>
            </CardHeader>
            <CardContent>
               <Link href="/dashboard/vocal-generation" passHref>
                 <Button variant="outline" className="w-full">
                    Go to Tool <ArrowRight className="ml-2 h-4 w-4" />
                 </Button>
               </Link>
            </CardContent>
           </Card>
       </div>

       {!isGenerating && !isSessionLoading && !session && !melodyResult && !error && !showInProgressAlert && !showPollingErrorAlert && (
        <Card className="shadow-md mt-4">
          <CardContent className="py-12 text-center">
            <Sparkles className="mx-auto h-12 w-12 text-muted-foreground/50 mb-4" />
            <p className="text-lg text-muted-foreground">
              Describe your melody above to get started, or explore other tools.
            </p>
          </CardContent>
        </Card>
      )}

       {!isGenerating && !isSessionLoading && session && !melodyResult && !error && !showInProgressAlert && !showPollingErrorAlert && (
         <Card className="shadow-md mt-4">
           <CardContent className="py-12 text-center">
             <Sparkles className="mx-auto h-12 w-12 text-muted-foreground/50 mb-4" />
             <p className="text-lg text-muted-foreground">
               Enter a prompt above to generate a melody!
             </p>
           </CardContent>
         </Card>
       )}
    </div>
  );
}