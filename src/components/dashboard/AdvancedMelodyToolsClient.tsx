"use client";

import { useState, useEffect, useRef } from 'react'; // Import useRef
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Download, FileAudio, Music, Repeat2, FileText, Loader2, Copy, ClipboardPaste, TimerIcon } from 'lucide-react'; // Import TimerIcon
import { parseTextToMidi } from '@/parseTextToMidi';
import { useAuthSession } from '@/hooks/useAuthSession';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

// Polling interval for asynchronous tasks
const POLLING_INTERVAL = 5000; // Poll every 5 seconds

interface TaskStatusResponse {
  id: string;
  status: string; // 'PENDING', 'PROCESSING', 'COMPLETED', 'FAILED'
  midi_data?: string; // Base64 encoded MIDI bytes
  description?: string; // Text description of the MIDI
  text_description?: string; // Alias for description, often used for LLM text output
  error_message?: string;
  created_at: string;
  updated_at: string;
}

export function AdvancedMelodyToolsClient() {
  const { session, isLoading: isSessionLoading, supabase } = useAuthSession();

  const [password, setPassword] = useState('');
  const [isUnlocked, setIsUnlocked] = useState(false);
  const CORRECT_PASSWORD = "melody";

  const [manualTextInput, setManualTextInput] = useState('');
  const [manualMidiBlob, setManualMidiBlob] = useState<Blob | null>(null);

  const [midiFileForText, setMidiFileForText] = useState<File | null>(null);
  const [llmTextOutput, setLlmTextOutput] = useState('');
  const [isConvertingToText, setIsConvertingToText] = useState(false);
  const [error, setError] = useState<string | null>(null); // General error for the component

  // State for Iterative Generation Polling
  const [currentIterativeTaskId, setCurrentIterativeTaskId] = useState<string | null>(null);
  const [pollingStatusIterative, setPollingStatusIterative] = useState<string | null>(null); // New state for polling status
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null); // Ref for interval management

  const [iterateBaseMidiFile, setIterateBaseMidiFile] = useState<File | null>(null);
  const [iterateBaseTextInput, setIterateBaseTextInput] = useState('');
  const [iterativePromptInput, setIterativePromptInput] = useState('');
  const [isGeneratingIterative, setIsGeneratingIterative] = useState(false);
  const [iterativeOutputText, setIterativeOutputText] = useState('');
  const [iterativeOutputMidiBlob, setIterativeOutputMidiBlob] = useState<Blob | null>(null);

  const { toast } = useToast();

  // Polling Logic for Iterative Generation
  useEffect(() => {
    // Clear any existing interval if no task or task is completed/failed/stopped
    if (!currentIterativeTaskId || !['PENDING', 'PROCESSING'].includes(pollingStatusIterative || '')) {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
        pollingIntervalRef.current = null;
      }
      return;
    }

    const poll = async () => {
      // Ensure session is active before polling
      if (isSessionLoading || !session) {
        console.error('Polling cannot continue without an active session.');
        toast({ title: 'Polling Error', description: 'Session expired or not loaded. Polling stopped.', variant: 'destructive' });
        setIsGeneratingIterative(false);
        setCurrentIterativeTaskId(null);
        setPollingStatusIterative('STOPPED_ERROR');
        setError('Authentication required for polling. Please log in.');
        setIterativeOutputText('Error: Authentication required for polling.');
        return;
      }

      const jwt = session.access_token;
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (jwt) {
        headers['Authorization'] = `Bearer ${jwt}`;
      }

      try {
        const response = await fetch(`/api/melody-status/${currentIterativeTaskId}`, { headers: headers });
        const result: TaskStatusResponse = await response.json();

        if (!response.ok) {
          console.error('Polling API error:', response.status, result);
          if (response.status === 401) {
            setError('Unauthorized. Please log in again.');
            throw new Error('Unauthorized. Please log in.');
          }
          const errorMessage = result.details || result.error_message || `API error: ${response.status}`;
          setError(errorMessage);
          throw new Error(errorMessage);
        }

        setPollingStatusIterative(result.status); // Update status

        if (result.status === 'COMPLETED') {
          setIterativeOutputText(result.text_description || result.description || 'Generation succeeded.');
          if (result.midi_data) {
            const byteCharacters = atob(result.midi_data);
            const byteNumbers = new Array(byteCharacters.length);
            for (let i = 0; i < byteCharacters.length; i++) byteNumbers[i] = byteCharacters.charCodeAt(i);
            const byteArray = new Uint8Array(byteNumbers);
            setIterativeOutputMidiBlob(new Blob([byteArray.buffer], { type: 'audio/midi' }));
          }
          toast({ title: 'Iteration Successful', description: 'Melody generated successfully.' });
          setIsGeneratingIterative(false);
          setCurrentIterativeTaskId(null);
          setPollingStatusIterative('COMPLETED'); // Final status
          setError(null); // Clear general error on success
        } else if (result.status === 'FAILED') {
          const errorMessage = result.error_message || 'Generation failed.';
          setIterativeOutputText(`Error: ${errorMessage}`);
          setError(`Iteration Failed: ${errorMessage}`); // Use setError here for persistent display
          toast({ title: 'Iteration Failed', description: errorMessage, variant: 'destructive' });
          setIsGeneratingIterative(false);
          setCurrentIterativeTaskId(null);
          setPollingStatusIterative('FAILED'); // Final status
        }
        // If not COMPLETED or FAILED, setInterval will call poll again
      } catch (error: any) {
        console.error(`Error polling task ${currentIterativeTaskId}:`, error);
        const displayError = `Polling failed - ${error.message}`;
        toast({ title: 'Polling Error', description: displayError, variant: 'destructive' });
        setIsGeneratingIterative(false);
        setCurrentIterativeTaskId(null);
        setPollingStatusIterative('STOPPED_ERROR'); // Indicate polling stopped due to error
        setError(displayError); // Set general error for polling issues
        setIterativeOutputText(`Error: ${displayError}`);
      }
    };

    // Only start polling if session is loaded and valid, and task is active
    if (!isSessionLoading && session && currentIterativeTaskId && ['PENDING', 'PROCESSING'].includes(pollingStatusIterative || '')) {
        poll(); // Call immediately on mount/dependency change
        pollingIntervalRef.current = setInterval(poll, POLLING_INTERVAL);
    }

    // Cleanup function: clear interval when component unmounts or dependencies change
    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
      }
    };
  }, [currentIterativeTaskId, pollingStatusIterative, session, isSessionLoading, toast]); // Dependencies for useEffect

  const handleUnlock = () => {
    if (password === CORRECT_PASSWORD) {
      setIsUnlocked(true);
      toast({ title: "Unlocked", description: "Advanced tools are now accessible." });
    } else {
      setIsUnlocked(false);
      setPassword('');
      toast({ title: "Incorrect Password", description: "Please try again.", variant: "destructive" });
    }
  };

  const handleManualConvert = () => {
    if (!manualTextInput.trim()) {
      toast({ title: 'Input Required', description: 'Please enter text output to convert.', variant: 'destructive' });
      return;
    }
    try {
      const midiBase64String = parseTextToMidi(manualTextInput);
      const byteCharacters = atob(midiBase64String);
      const len = byteCharacters.length;
      const bytes = new Uint8Array(len);
      for (let i = 0; i < len; i++) {
          bytes[i] = byteCharacters.charCodeAt(i);
      }
      const blob = new Blob([bytes.buffer], { type: 'audio/midi' });
      setManualMidiBlob(blob);
      toast({ title: 'Conversion Successful', description: 'Text output converted to MIDI.' });
    } catch (e: any) {
      console.error("Error converting manual text to MIDI:", e);
      setManualMidiBlob(null);
      toast({ title: 'Conversion Failed', description: `Could not process text input: ${e.message}`, variant: 'destructive' });
    }
  };

  const handleDownloadManualMidi = () => {
    if (manualMidiBlob) {
      try {
        const url = URL.createObjectURL(manualMidiBlob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'manual_converted_melody.mid';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        toast({ title: "Download Started", description: "Your manually converted MIDI file should be downloading." });
      } catch (e: any) {
        console.error("Error downloading manual MIDI:", e);
        toast({ title: 'Download Failed', description: `Could not download MIDI file: ${e.message}`, variant: 'destructive' });
      }
    } else {
      toast({ title: 'Download Failed', description: 'No manually converted MIDI data available to download.', variant: 'destructive' });
    }
  };

  const handlePasteIntoManualText = async () => {
    try {
      const text = await navigator.clipboard.readText();
      setManualTextInput(text);
      toast({ title: 'Pasted!', description: 'Text pasted from clipboard.' });
    } catch (err) {
      console.error('Failed to paste text:', err);
      toast({ title: 'Paste Failed', description: 'Failed to paste text from clipboard.', variant: 'destructive' });
    }
  };

  const handleFileChangeForText = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setMidiFileForText(event.target.files[0]);
      setLlmTextOutput('');
    } else {
      setMidiFileForText(null);
      setLlmTextOutput('');
    }
  };

  const handleConvertToText = async () => {
    if (!midiFileForText) {
      toast({ title: 'File Required', description: 'Please upload a MIDI file to convert.', variant: 'destructive' });
      return;
    }
    if (isSessionLoading) {
      toast({ title: 'Session Loading', description: 'Please wait for session to load.', variant: 'default' });
      return;
    }
    if (!session) {
      setError('You must be logged in to convert MIDI to text.');
      toast({ title: 'Authentication Required', description: 'Please log in to use this feature.', variant: 'destructive' });
      return;
    }

    setIsConvertingToText(true);
    setLlmTextOutput('');
    setError(null);

    const formData = new FormData();
    formData.append('midiFile', midiFileForText);
    const jwt = session.access_token;
    const headers: Record<string, string> = {};
    if (jwt) {
      headers['Authorization'] = `Bearer ${jwt}`;
    }

    try {
      const response = await fetch('/api/midi-to-text', {
        method: 'POST',
        headers: headers,
        body: formData,
      });
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Server responded with an error:', response.status, errorText);
        try {
          const errorData = JSON.parse(errorText);
          throw new Error(errorData.details || errorData.error || 'Conversion failed. Check server logs.');
        } catch (jsonError) {
          throw new Error(`Server error: ${response.status} - ${errorText.substring(0, 100)}...`);
        }
      }
      const result = await response.json();
      setLlmTextOutput(result.textDescription);
      toast({ title: 'Conversion Successful', description: 'MIDI file converted to text.' });
    } catch (error: any) {
      console.error('Error converting MIDI to text (client-side):', error);
      setError(`Error converting MIDI to text: ${error.message}`);
      toast({ title: 'Conversion Failed', description: `Error: ${error.message}`, variant: 'destructive' });
      setLlmTextOutput('Error converting MIDI to text: ' + error.message);
    } finally {
      setIsConvertingToText(false);
    }
  };

  const handleCopyToClipboard = async () => {
    if (!llmTextOutput) {
      toast({ title: 'Nothing to copy', description: 'The output area is empty.', variant: 'destructive' });
      return;
    }
    try {
      await navigator.clipboard.writeText(llmTextOutput);
      toast({ title: 'Copied!', description: 'Text output copied to clipboard.' });
    } catch (err) {
      console.error('Failed to copy text:', err);
      toast({ title: 'Copy Failed', description: 'Failed to copy text to clipboard.', variant: 'destructive' });
    }
  };

  const handleIterateMidiFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setIterateBaseMidiFile(event.target.files[0]);
      setIterateBaseTextInput(''); // Clear text input if file is chosen
      setIterativeOutputText('');
      setIterativeOutputMidiBlob(null);
      setError(null); // Clear any previous error
    } else {
      setIterateBaseMidiFile(null);
    }
  };

  const handlePasteIntoIterateBaseText = async () => {
    try {
      const text = await navigator.clipboard.readText();
      setIterateBaseTextInput(text);
      setIterateBaseMidiFile(null); // Clear file input if text is pasted
      setIterativeOutputText('');
      setIterativeOutputMidiBlob(null);
      setError(null); // Clear any previous error
      toast({ title: 'Pasted!', description: 'Text pasted from clipboard.' });
    } catch (err) {
      console.error('Failed to paste text:', err);
      toast({ title: 'Paste Failed', description: 'Failed to paste text from clipboard.', variant: 'destructive' });
    }
  };

  const handleIterateGeneration = async () => {
    if (!iterativePromptInput.trim()) {
      toast({ title: 'Input Required', description: 'Please enter a prompt for iteration.', variant: 'destructive' });
      return;
    }
    if (!iterateBaseMidiFile && !iterateBaseTextInput.trim()) {
      toast({ title: 'Input Required', description: 'Please upload a base MIDI or paste base text.', variant: 'destructive' });
      return;
    }
    if (isSessionLoading) {
      toast({ title: 'Session Loading', description: 'Please wait for session to load.', variant: 'default' });
      return;
    }
    if (!session) {
      setError('You must be logged in to generate melodies.');
      toast({ title: 'Authentication Required', description: 'Please log in to use this feature.', variant: 'destructive' });
      return;
    }

    setIsGeneratingIterative(true);
    setIterativeOutputText('');
    setIterativeOutputMidiBlob(null);
    setError(null); // Clear general error
    setPollingStatusIterative(null); // Reset polling status

    const jwt = session.access_token;
    const authHeaders: Record<string, string> = { 'Content-Type': 'application/json' };
    if (jwt) {
      authHeaders['Authorization'] = `Bearer ${jwt}`;
    }

    let initialMelodyText = '';
    try {
      if (iterateBaseMidiFile) {
        // Step 1: Convert MIDI to text if MIDI file is provided as base
        const formData = new FormData();
        formData.append('midiFile', iterateBaseMidiFile);
        const midiToTextHeaders: Record<string, string> = {};
        if (jwt) midiToTextHeaders['Authorization'] = `Bearer ${jwt}`;
        const convertResponse = await fetch('/api/midi-to-text', {
          method: 'POST', headers: midiToTextHeaders, body: formData,
        });
        if (!convertResponse.ok) {
          const errorText = await convertResponse.text();
          let errorMessage = `MIDI to text conversion failed: ${convertResponse.status}`;
          try { const errorData = JSON.parse(errorText); errorMessage = errorData.details || errorData.error || errorMessage; } catch (jsonError) { errorMessage = `Conversion server error: ${convertResponse.status} - ${errorText.substring(0,200)}...`; }
          throw new Error(errorMessage);
        }
        const convertResult = await convertResponse.json();
        initialMelodyText = convertResult.textDescription;
      } else if (iterateBaseTextInput.trim()) {
        initialMelodyText = iterateBaseTextInput.trim();
      }

      // Step 2: Request iterative generation task
      const generateResponse = await fetch('/api/generate-melody-task', {
        method: 'POST', headers: authHeaders,
 body: JSON.stringify({
 prompt: iterativePromptInput.trim(), existingMidiText: initialMelodyText.trim()
 }),
      });
      if (!generateResponse.ok) {
        const errorText = await generateResponse.text();
        let errorMessage = `Generation request failed: ${generateResponse.status}`;
        try { const errorData = JSON.parse(errorText); errorMessage = errorData.details || errorData.error || errorMessage; } catch (jsonError) { errorMessage = `Generation server error: ${generateResponse.status} - ${errorText.substring(0,200)}...`; }
        throw new Error(errorMessage);
      }
      const generateResult = await generateResponse.json();
      toast({ title: 'Generation Task Created', description: `Task ID: ${generateResult.taskId}. Processing started...` });
      setCurrentIterativeTaskId(generateResult.taskId);
      setPollingStatusIterative('PENDING'); // Set status to PENDING to trigger polling useEffect
      // No direct call to pollTaskStatus here; useEffect will handle it
    } catch (error: any) {
      console.error('Error during iterative generation process:', error);
      const displayError = `Iterative generation error: ${error.message}`;
      setError(displayError);
      toast({ title: 'Iteration Failed', description: displayError, variant: 'destructive' });
      setIterativeOutputText(`Error: ${displayError}`);
      setIsGeneratingIterative(false);
      setPollingStatusIterative('FAILED'); // Indicate initial request failed
    }
  };

  const handleDownloadIterativeMidi = () => {
    if (iterativeOutputMidiBlob) {
      try {
        const url = URL.createObjectURL(iterativeOutputMidiBlob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'iterated_melody.mid';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        toast({ title: "Download Started", description: "Your iterated MIDI file should be downloading." });
      } catch (e: any) {
        console.error("Error downloading iterative MIDI:", e);
        toast({ title: 'Download Failed', description: `Could not download MIDI file: ${e.message}`, variant: 'destructive' });
      }
    } else {
      toast({ title: 'Download Failed', description: 'No iterated MIDI data available to download.', variant: 'destructive' });
    }
  };

  // Disable feature buttons if session is loading or not present
  const featuresDisabled = isSessionLoading || !session;

  const showIterativeInProgressAlert = isGeneratingIterative && currentIterativeTaskId && (pollingStatusIterative === 'PENDING' || pollingStatusIterative === 'PROCESSING');
  const showIterativePollingErrorAlert = pollingStatusIterative === 'STOPPED_ERROR';
  const showIterativeFailedAlert = pollingStatusIterative === 'FAILED' && !isGeneratingIterative && error;
  const showIterativeCompletedAlert = pollingStatusIterative === 'COMPLETED' && !isGeneratingIterative && iterativeOutputText && !error;


  return (
    <div className="space-y-8 p-4 md:p-8"> {/* Added p-4 md:p-8 for consistent padding */}
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl">Advanced Tools Access</CardTitle>
          <CardDescription>Enter the password to unlock advanced melody tools. Some tools require login.</CardDescription>
        </CardHeader>
        <CardContent className="flex items-center gap-4">
          <div className="flex-1">
            <Label htmlFor="password" className="sr-only">Password</Label>
            <input
              id="password" type="password" placeholder="Enter Password" value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyPress={(e) => { if (e.key === 'Enter') handleUnlock(); }}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              disabled={isUnlocked}
            />
          </div>
          <div>
            <Button onClick={handleUnlock} disabled={isUnlocked}>Unlock</Button>
          </div>
        </CardContent>
        {isUnlocked && <CardFooter><span className="text-sm text-green-600">Advanced tools unlocked.</span></CardFooter>}
      </Card>

      {isSessionLoading && (
        <Alert>
          <Loader2 className="h-5 w-5 animate-spin mr-2" />
          <AlertTitle>Loading Session...</AlertTitle>
          <AlertDescription>Please wait while we check your login status.</AlertDescription>
        </Alert>
      )}

      {!isSessionLoading && !session && (
        <Alert variant="destructive">
          <AlertTitle>Login Required</AlertTitle>
          <AlertDescription>You must be logged in to use the advanced tools. Please log in and try again.</AlertDescription>
        </Alert>
      )}

      {/* General Error Display */}
      {error && (
         <Alert variant="destructive" className="mt-4">
           <AlertTitle>Error</AlertTitle>
           <AlertDescription>{error}</AlertDescription>
         </Alert>
      )}

      {/* Iterative Generation Card */}
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl flex items-center"><Repeat2 className="mr-2 h-6 w-6 text-green-500" /> Iterate for MIDI Generation</CardTitle>
          <CardDescription>Refine or generate new MIDI based on existing MIDI or LLM text. Requires login.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="text-lg font-medium">Base Melody Input</Label>
              <p className="text-sm text-muted-foreground">Provide the existing melody as a MIDI file or LLM text.</p>
              <div className="flex flex-col sm:flex-row items-center gap-4">
                <div className="flex-1 space-y-1">
                  <Label htmlFor="iterateBaseMidiUpload" className="text-sm font-medium">Upload MIDI File (.mid)</Label>
                  <input id="iterateBaseMidiUpload" type="file" accept=".mid,.midi" onChange={handleIterateMidiFileChange} disabled={isGeneratingIterative || featuresDisabled} />
                </div>
                <span className="text-muted-foreground">OR</span>
                <div className="flex-1 space-y-1">
                  <Label htmlFor="iterateBaseTextInput" className="text-sm font-medium">Paste LLM Text</Label>
                  <div className="flex gap-2">
                    <Textarea
                      id="iterateBaseTextInput" placeholder="Paste LLM generated text..."
                      value={iterateBaseTextInput} onChange={(e) => setIterateBaseTextInput(e.target.value)}
                      className="min-h-[100px] text-base flex-1"
                      disabled={isGeneratingIterative || !!iterateBaseMidiFile || featuresDisabled} // Disable text input if file is selected
                    />
                    <Button onClick={handlePasteIntoIterateBaseText} variant="outline" size="icon" disabled={isGeneratingIterative || !!iterateBaseMidiFile || featuresDisabled} title="Paste from Clipboard">
                      <ClipboardPaste className="h-5 w-5" />
                    </Button>
                  </div>
                </div>
              </div>
              {(iterateBaseMidiFile || iterateBaseTextInput.trim()) && !isGeneratingIterative && <p className="text-sm text-green-600">Base input provided.</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="iterativePromptInput" className="text-lg font-medium">Iteration Prompt</Label>
              <Textarea
                id="iterativePromptInput" placeholder="e.g., 'make it sadder, add a bassline in the key of C minor'"
                value={iterativePromptInput} onChange={(e) => setIterativePromptInput(e.target.value)}
                className="min-h-[100px] text-base" disabled={isGeneratingIterative || featuresDisabled}
              />
            </div>
          </div>
          <div className="flex justify-center mt-6">
            <Button
              onClick={handleIterateGeneration}
              disabled={isGeneratingIterative || (!iterateBaseMidiFile && !iterateBaseTextInput.trim()) || !iterativePromptInput.trim() || featuresDisabled}
              className="w-full sm:w-auto bg-green-500 hover:bg-green-600 text-white text-lg py-3 px-6"
            >
              {isGeneratingIterative ? (
                <span className="flex items-center"><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Processing...</span>
              ) : (
                <><Repeat2 className="mr-2 h-5 w-5" /> Process Iteration</>
              )}
            </Button>
          </div>

          {/* Iterative Generation Progress/Error Alerts */}
          {showIterativeInProgressAlert && (
            <Alert className="shadow-md mt-4 animate-in fade-in duration-300">
              <TimerIcon className="h-5 w-5 mr-2" />
              <AlertTitle>Iteration in Progress (Task ID: {currentIterativeTaskId?.substring(0,8)}...)</AlertTitle>
              <AlertDescription>
                Status: <span className="font-semibold uppercase">{pollingStatusIterative}</span>.
                Your melody is being iterated. This might take a few moments.
              </AlertDescription>
            </Alert>
          )}
          {showIterativePollingErrorAlert && (
            <Alert variant="destructive" className="shadow-md mt-4">
              <AlertTitle>Polling Issue</AlertTitle>
              <AlertDescription>{error || 'Could not retrieve task status. Polling stopped. It might be an authentication, network, or server issue.'}</AlertDescription>
            </Alert>
          )}
          {showIterativeFailedAlert && (
            <Alert variant="destructive" className="shadow-md mt-4">
              <AlertTitle>Iteration Failed</AlertTitle>
              <AlertDescription>{iterativeOutputText || 'An error occurred during iteration.'}</AlertDescription>
            </Alert>
          )}
          {showIterativeCompletedAlert && (
            <Alert className="shadow-md mt-4">
              <AlertTitle>Iteration Completed</AlertTitle>
              <AlertDescription>Melody iteration successful. Check the output below.</AlertDescription>
            </Alert>
          )}

          <div className="space-y-2 mt-6">
            <Label className="text-lg font-medium">Iteration Output</Label>
            <Textarea placeholder="Iterated melody text output..." className="min-h-[150px] text-base bg-muted" readOnly value={iterativeOutputText} />
            {iterativeOutputMidiBlob && (
              <div className="flex justify-end">
                <Button onClick={handleDownloadIterativeMidi} variant="outline"><Download className="mr-2 h-5 w-5" /> Download Iterated MIDI</Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {isUnlocked && (
        <>
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="text-2xl flex items-center"><Music className="mr-2 h-6 w-6 text-purple-500" /> Convert Text to MIDI</CardTitle>
              <CardDescription>Manually paste AI text output here to convert it into a MIDI file. (Local conversion, no login needed)</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="manualTextInput" className="text-lg font-medium">Paste AI Text Output</Label>
                <Textarea id="manualTextInput" placeholder="Paste the text output..." value={manualTextInput} onChange={(e) => setManualTextInput(e.target.value)} className="min-h-[150px] text-base" />
              </div>
              <div className="flex flex-col sm:flex-row items-center gap-4">
                <Button onClick={handleManualConvert} className="w-full sm:w-auto bg-purple-500 hover:bg-purple-600 text-white text-lg py-3 px-6">
                  <FileAudio className="mr-2 h-5 w-5" /> Convert to MIDI
                </Button>
                <Button onClick={handlePasteIntoManualText} variant="outline" size="lg" className="w-full sm:w-auto" title="Paste from Clipboard">
                  <ClipboardPaste className="mr-2 h-5 w-5" /> Paste Text
                </Button>
              </div>
            </CardContent>
            {manualMidiBlob && (
              <CardFooter className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Conversion successful.</span>
                <Button onClick={handleDownloadManualMidi} variant="outline"><Download className="mr-2 h-5 w-5" /> Download Manual MIDI</Button>
              </CardFooter>
            )}
          </Card>

          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="text-2xl flex items-center"><FileText className="mr-2 h-6 w-6 text-orange-500" /> MIDI to LLM Text Conversion</CardTitle>
              <CardDescription>Upload a MIDI file and convert it into an LLM-style text description. Requires login.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="midiUploadForText" className="text-lg font-medium">Upload MIDI File</Label>
                <input id="midiUploadForText" type="file" accept=".mid,.midi" onChange={handleFileChangeForText} disabled={isConvertingToText || featuresDisabled} />
              </div>
              <div className="flex flex-col sm:flex-row items-center gap-4">
                <Button onClick={handleConvertToText} disabled={!midiFileForText || isConvertingToText || featuresDisabled} className="w-full sm:w-auto bg-orange-500 hover:bg-orange-600 text-white text-lg py-3 px-6">
                  {isConvertingToText ? (
                    <span className="flex items-center"><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Converting...</span>
                  ) : (
                    <><FileText className="mr-2 h-5 w-5" /> Convert to Text</>
                  )}
                </Button>
                <Button onClick={handleCopyToClipboard} disabled={!llmTextOutput || featuresDisabled} variant="outline" size="lg" className="w-full sm:w-auto">
                  <Copy className="mr-2 h-5 w-5" /> Copy Text
                </Button>
              </div>
              <div className="space-y-2">
                <Label htmlFor="llmTextOutput" className="text-lg font-medium">LLM Text Output</Label>
                <Textarea id="llmTextOutput" placeholder="Generated LLM text description..." className="min-h-[150px] text-base bg-muted" readOnly value={llmTextOutput} />
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}