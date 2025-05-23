"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Download, FileAudio, Music, Repeat2, FileText, Loader2, Copy, ClipboardPaste } from 'lucide-react'; // Added ClipboardPaste icon
import { parseTextToMidi } from '@/parseTextToMidi'; // Assuming this is client-side compatible

// Import the Supabase client used on the frontend
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Database } from '@/types/supabase';

// Configure cookie options to only look for cookies starting with 'sb-'
const supabase = createClientComponentClient<Database>({
  cookieOptions: {
    name: 'sb'
  }
});

export function AdvancedMelodyToolsClient() {
  const [manualTextInput, setManualTextInput] = useState('');
  const [manualMidiBlob, setManualMidiBlob] = useState<Blob | null>(null);

  const [midiFileForText, setMidiFileForText] = useState<File | null>(null); // State for the selected MIDI file for conversion TO text
  const [llmTextOutput, setLlmTextOutput] = useState(''); // State for the generated text output FROM MIDI
  const [isConvertingToText, setIsConvertingToText] = useState(false); // Loading state for MIDI to Text conversion

  // States for Iterative Generation
  const [currentIterativeTaskId, setCurrentIterativeTaskId] = useState<string | null>(null); // Task ID for the current iterative generation job
  const [iterateBaseMidiFile, setIterateBaseMidiFile] = useState<File | null>(null); // Base MIDI file for iteration
  const [iterateBaseTextInput, setIterateBaseTextInput] = useState(''); // Base text input for iteration
  const [iterativePromptInput, setIterativePromptInput] = useState(''); // New prompt for iteration
  const [isGeneratingIterative, setIsGeneratingIterative] = useState(false); // Loading state for iterative generation
  const [iterativeOutputText, setIterativeOutputText] = useState(''); // State for the generated text output from iteration
  const [iterativeOutputMidiBlob, setIterativeOutputMidiBlob] = useState<Blob | null>(null); // State for the generated MIDI blob from iteration

  const { toast } = useToast();

  // --- Manual Text to MIDI Conversion ---
  const handleManualConvert = () => {
    if (!manualTextInput.trim()) {
      toast({
        title: 'Input Required',
        description: 'Please enter text output to convert.',
        variant: 'destructive',
      });
      return;
    }

    try {
      // Assuming parseTextToMidi directly returns Uint8Array or ArrayBuffer for Blob construction.
      // If parseTextToMidi returns a base64 string, you need to decode it first:
      const midiBase64String = parseTextToMidi(manualTextInput); // This is now base64 string
      const byteCharacters = atob(midiBase64String);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray.buffer], { type: 'audio/midi' });

      setManualMidiBlob(blob);
       toast({
          title: 'Conversion Successful',
          description: 'Text output converted to MIDI.',
        });
    } catch (e: any) {
       console.error("Error converting manual text to MIDI:", e);
       setManualMidiBlob(null); // Clear previous result on error
       toast({
          title: 'Conversion Failed',
          description: `Could not process text input: ${e.message}`,
          variant: 'destructive',
        });
    }
  };

  const handleDownloadManualMidi = () => {
    if (manualMidiBlob) {
      try {
        const url = URL.createObjectURL(manualMidiBlob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'manual_converted_melody.mid'; // Suggested filename
        document.body.appendChild(a);
        a.click();

        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        toast({ title: "Download Started", description: "Your manually converted MIDI file should be downloading."});

      } catch (e: any) {
        console.error("Error downloading manual MIDI:", e);
        toast({
          title: 'Download Failed',
          description: `Could not download MIDI file: ${e.message}`,
          variant: 'destructive',
        });
      }
    } else {
       toast({
          title: 'Download Failed',
          description: 'No manually converted MIDI data available to download.',
          variant: 'destructive',
        });
    }
  };

  const handlePasteIntoManualText = async () => {
     try {
      const text = await navigator.clipboard.readText();
      setManualTextInput(text);
      toast({
        title: 'Pasted!',
        description: 'Text pasted from clipboard.',
      });
    } catch (err) {
      console.error('Failed to paste text:', err);
       toast({
        title: 'Paste Failed',
        description: 'Failed to paste text from clipboard.',
        variant: 'destructive',
      });
    }
  };

  // --- MIDI to LLM Text Conversion ---
  const handleFileChangeForText = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setMidiFileForText(event.target.files[0]);
      setLlmTextOutput(''); // Clear previous output on new file selection
    } else {
      setMidiFileForText(null);
      setLlmTextOutput('');
    }
  };

  const handleConvertToText = async () => {
    if (!midiFileForText) {
      toast({
        title: 'File Required',
        description: 'Please upload a MIDI file to convert.',
        variant: 'destructive',
      });
      return;
    }

    setIsConvertingToText(true);
    setLlmTextOutput(''); // Clear previous output

    const formData = new FormData();
    formData.append('midiFile', midiFileForText);

    // Get current session to include JWT in request
    const { data: { session } } = await supabase.auth.getSession();
    const jwt = session?.access_token;

    const headers: Record<string, string> = {}; // FormData does not need Content-Type JSON
    if (jwt) {
      headers['Authorization'] = `Bearer ${jwt}`;
    } else {
        // If no session, show an error immediately
        setError('You must be logged in to convert MIDI to text.');
        setIsConvertingToText(false);
        toast({
             title: 'Authentication Required',
             description: 'Please log in to use the MIDI to Text conversion.',
             variant: 'destructive',
        });
        return;
    }


    try {
      const response = await fetch('/api/midi-to-text', {
        method: 'POST',
        headers: headers, // Pass the headers with Authorization
        body: formData,
      });

      if (!response.ok) {
        // If response is not OK, try to read as text first for HTML errors
        const errorText = await response.text();
        console.error('Server responded with an error:', response.status, errorText);
        try {
          // If the text is JSON, parse it for detailed error
          const errorData = JSON.parse(errorText);
          throw new Error(errorData.details || errorData.error || 'Conversion failed. Check server logs.');
        } catch (jsonError) {
          // If it's not JSON (e.g., HTML error page), throw the text content
          throw new Error(`Server error: ${response.status} - ${errorText.substring(0,100)}...`);
        }
      }

      const result = await response.json();
      setLlmTextOutput(result.textDescription);

      toast({
        title: 'Conversion Successful',
        description: 'MIDI file converted to text.',
      });

    } catch (error: any) {
      console.error('Error converting MIDI to text (client-side):', error);
      toast({
        title: 'Conversion Failed',
        description: `Error: ${error.message}`,
        variant: 'destructive',
      });
      setLlmTextOutput('Error converting MIDI to text: ' + error.message);
    } finally {
      setIsConvertingToText(false);
    }
  };

   const handleCopyToClipboard = async () => {
    if (!llmTextOutput) {
      toast({
        title: 'Nothing to copy',
        description: 'The output area is empty.',
        variant: 'destructive',
      });
      return;
    }
    try {
      await navigator.clipboard.writeText(llmTextOutput);
      toast({
        title: 'Copied!',
        description: 'Text output copied to clipboard.',
      });
    } catch (err) {
      console.error('Failed to copy text:', err);
       toast({
        title: 'Copy Failed',
        description: 'Failed to copy text to clipboard.',
        variant: 'destructive',
      });
    }
  };

  // --- Polling Mechanism for Iterative Generation Task ---
  const pollTaskStatus = async (taskId: string) => {
    const MAX_POLLING_ATTEMPTS = 60; // Poll for up to 5 minutes (60 * 5s)
    const POLLING_INTERVAL = 5000; // Poll every 5 seconds
    let attempts = 0;

    // Get current session to include JWT in polling request
    const { data: { session } } = await supabase.auth.getSession();
    const jwt = session?.access_token;

    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (jwt) {
      headers['Authorization'] = `Bearer ${jwt}`;
    }

    const checkStatus = async () => {
      if (attempts >= MAX_POLLING_ATTEMPTS) {
        console.error(`Polling timed out for task ${taskId}`);
        toast({
          title: 'Iteration Failed',
          description: 'Task status check timed out. Please try again.',
          variant: 'destructive',
        });
        setIsGeneratingIterative(false);
        setCurrentIterativeTaskId(null);
        setIterativeOutputText('Error: Task timed out.');
        return;
      }

      attempts++;
      console.log(`Polling status for task ${taskId}, attempt ${attempts}...`);

      try {
        const response = await fetch(`/api/melody-status/${taskId}`, {
          headers: headers, // Include authorization headers for polling
        });
        const result = await response.json();

        if (!response.ok) {
           console.error('Polling API error:', response.status, result);
           // If unauthorized, stop polling and inform user
           if (response.status === 401) {
             throw new Error('Unauthorized. Please log in.');
           }
           throw new Error(result.details || result.error || `API error: ${response.status}`);
        }

        console.log('Polling result:', result);

        if (result.status === 'COMPLETED') { // Changed from 'SUCCEEDED' to 'COMPLETED'
          setIterativeOutputText(result.text_description || 'Generation succeeded.'); // The API might return text_description or just description
          if (result.midi_data) {
            // Convert base64 to Blob
            const byteCharacters = atob(result.midi_data);
            const byteNumbers = new Array(byteCharacters.length);
            for (let i = 0; i < byteCharacters.length; i++) {
              byteNumbers[i] = byteCharacters.charCodeAt(i);
            }
            const byteArray = new Uint8Array(byteNumbers);
            setIterativeOutputMidiBlob(new Blob([byteArray.buffer], { type: 'audio/midi' })); // Use buffer for robustness
          }
          toast({ title: 'Iteration Successful', description: 'Melody generated successfully.' });
          setIsGeneratingIterative(false);
          setCurrentIterativeTaskId(null);
        } else if (result.status === 'FAILED') {
          setIterativeOutputText(`Error: ${result.error_message || 'Generation failed.'}`);
          toast({ title: 'Iteration Failed', description: result.error_message || 'An error occurred during generation.', variant: 'destructive' });
          setIsGeneratingIterative(false);
          setCurrentIterativeTaskId(null);
        } else { // PENDING, PROCESSING, etc.
          setTimeout(checkStatus, POLLING_INTERVAL);
        }
      } catch (error: any) {
        console.error(`Error polling task ${taskId}:`, error);
        toast({ title: 'Polling Error', description: `Failed to get task status: ${error.message}`, variant: 'destructive' });
        setIsGeneratingIterative(false);
        setCurrentIterativeTaskId(null);
        setIterativeOutputText(`Error: Polling failed - ${error.message}`);
      }
    };

    checkStatus();
  };

  // --- Iterative MIDI Generation ---
   const handleIterateMidiFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setIterateBaseMidiFile(event.target.files[0]);
       // Clear base text input and any previous output when a new MIDI file is selected
      setIterateBaseTextInput('');
      setIterativeOutputText('');
      setIterativeOutputMidiBlob(null);
    } else {
      setIterateBaseMidiFile(null);
    }
  };

  const handlePasteIntoIterateBaseText = async () => {
     try {
      const text = await navigator.clipboard.readText();
      setIterateBaseTextInput(text);
      // Clear base MIDI file input and any previous output when text is pasted
      setIterateBaseMidiFile(null);
      setIterativeOutputText('');
      setIterativeOutputMidiBlob(null);
      toast({
        title: 'Pasted!',
        description: 'Text pasted from clipboard.',
      });
    } catch (err) {
      console.error('Failed to paste text:', err);
       toast({
        title: 'Paste Failed',
        description: 'Failed to paste text from clipboard.',
        variant: 'destructive',
      });
    }
  };

   const handleIterateGeneration = async () => {
    // Validate inputs: requires either a base MIDI file OR base text, AND an iterative prompt
    if (!iterativePromptInput.trim()) {
       toast({
        title: 'Input Required',
        description: 'Please enter a prompt for iteration.',
        variant: 'destructive',
      });
      return;
    }

    if (!iterateBaseMidiFile && !iterateBaseTextInput.trim()) {
         toast({
        title: 'Input Required',
        description: 'Please upload a base MIDI file or paste base LLM text.',
        variant: 'destructive',
      });
      return;
    }

    setIsGeneratingIterative(true);
    setIterativeOutputText(''); // Clear previous output
    setIterativeOutputMidiBlob(null);

    // Get current session to include JWT in submission request
    const { data: { session } } = await supabase.auth.getSession();
    const jwt = session?.access_token;

    const authHeaders: Record<string, string> = { 'Content-Type': 'application/json' };
    if (jwt) {
      authHeaders['Authorization'] = `Bearer ${jwt}`;
    } else {
        // If no session, the backend will return 401 anyway, but we can show an error immediately
        setError('You must be logged in to generate melodies.');
        setIsGeneratingIterative(false);
        toast({
             title: 'Authentication Required',
             description: 'Please log in to submit a generation task.',
             variant: 'destructive',
        });
        return;
    }


    let initialMelodyText = '';

    try {
      // Step 1: Get initialMelodyText from either MIDI file conversion or pasted text
      if (iterateBaseMidiFile) {
         const formData = new FormData();
         formData.append('midiFile', iterateBaseMidiFile);

         // Note: For FormData, 'Content-Type' header is usually handled automatically by the browser
         // when you pass a FormData object. Manually setting it might cause issues.
         // Just ensure Authorization header is present.
         const midiToTextHeaders: Record<string, string> = {};
         if (jwt) {
           midiToTextHeaders['Authorization'] = `Bearer ${jwt}`;
         }


         const convertResponse = await fetch('/api/midi-to-text', {
            method: 'POST',
            headers: midiToTextHeaders, // Use headers with Authorization
            body: formData,
         });

         if (!convertResponse.ok) {
            const errorText = await convertResponse.text();
            console.error('MIDI to Text Conversion Error:', convertResponse.status, errorText);
             let errorMessage = `Conversion failed: ${convertResponse.status}`; // Default error message
             try {
                const errorData = JSON.parse(errorText);
                errorMessage = errorData.details || errorData.error || errorMessage;
             } catch (jsonError) {
                 // If not JSON, use the text
                 errorMessage = `Conversion server error: ${convertResponse.status} - ${errorText.substring(0,100)}...`;
             }
             throw new Error(errorMessage);
         }

         const convertResult = await convertResponse.json();
         initialMelodyText = convertResult.textDescription; // Assuming the API returns this structure
         console.log('Successfully converted MIDI to text for iteration base.');

      } else if (iterateBaseTextInput.trim()) {
        initialMelodyText = iterateBaseTextInput.trim();
         console.log('Using pasted text as iteration base.');
      }

      // Step 2: Call the generate-melody-task API route with iteration context
      const generateResponse = await fetch('/api/generate-melody-task', {
        method: 'POST',
        headers: authHeaders, // Use the pre-prepared authHeaders for JSON content
        body: JSON.stringify({
          prompt: iterativePromptInput.trim(),
          initialMelodyText: initialMelodyText,
        }),
      });

      if (!generateResponse.ok) {
         const errorText = await generateResponse.text();
         console.error('Generate Task API Error:', generateResponse.status, errorText);
          let errorMessage = `Generation request failed: ${generateResponse.status}`; // Default error
           try {
                const errorData = JSON.parse(errorText);
                errorMessage = errorData.details || errorData.error || errorMessage;
             } catch (jsonError) {
                 errorMessage = `Generation server error: ${generateResponse.status} - ${errorText.substring(0,100)}...`;
             }
         throw new Error(errorMessage);
      }

      const generateResult = await generateResponse.json();
      // The API route now returns { taskId: string }
      console.log('Successfully created iterative generation task.', generateResult);

      toast({
        title: 'Generation Task Created',
        description: `Task ID: ${generateResult.taskId}. Processing started...`,
      });

      setCurrentIterativeTaskId(generateResult.taskId);
      pollTaskStatus(generateResult.taskId); // Start polling

    } catch (error: any) {
      console.error('Error during iterative generation process:', error);
      toast({
        title: 'Iteration Failed',
        description: `Error: ${error.message}`,
        variant: 'destructive',
      });
       // Set output text to error message for visibility
       setIterativeOutputText(`Error: ${error.message}`);
    } finally {
      // The loading state should be managed by the polling function's completion or failure.
      // Do not set to false here, as it would stop the spinner immediately after task submission,
      // not after the task is actually done.
      // setIsGeneratingIterative(false); // REMOVED: Managed by pollTaskStatus
    }
   };

   // Placeholder for downloading the iterative output MIDI
    const handleDownloadIterativeMidi = () => {
      if (iterativeOutputMidiBlob) {
        try {
          const url = URL.createObjectURL(iterativeOutputMidiBlob);
          const a = document.createElement('a');
          a.href = url;
          a.download = 'iterated_melody.mid'; // Suggested filename
          document.body.appendChild(a);
          a.click();

          document.body.removeChild(a);
          URL.revokeObjectURL(url);

          toast({ title: "Download Started", description: "Your iterated MIDI file should be downloading."});

        } catch (e: any) {
          console.error("Error downloading iterative MIDI:", e);
          toast({
            title: 'Download Failed',
            description: `Could not download MIDI file: ${e.message}`,
            variant: 'destructive',
          });
        }
      } else {
         toast({
            title: 'Download Failed',
            description: 'No iterated MIDI data available to download.',
            variant: 'destructive',
          });
      }
    };


  return (
    <div className="space-y-8">
      {/* Manual Text to MIDI Conversion Section */}
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl flex items-center"><Music className="mr-2 h-6 w-6 text-purple-500" /> Convert Text to MIDI</CardTitle>
          <CardDescription>Manually paste AI text output here to convert it into a MIDI file.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
           <div className="space-y-2">
              <Label htmlFor="manualTextInput" className="text-lg font-medium">Paste AI Text Output</Label>
                 <Textarea
                  id="manualTextInput"
                  placeholder="Paste the text output from the AI here..."
                  value={manualTextInput}
                  onChange={(e) => setManualTextInput(e.target.value)}
                  className="min-h-[150px] text-base"
                 />
            </div>
            {/* Container for Convert and Paste buttons */}
            <div className="flex flex-col sm:flex-row items-center gap-4">
               <Button onClick={handleManualConvert} className="w-full sm:w-auto bg-purple-500 hover:bg-purple-600 text-white text-lg py-3 px-6">
                <FileAudio className="mr-2 h-5 w-5" />
                Convert to MIDI
              </Button>
                <Button
                 onClick={handlePasteIntoManualText}
                 variant="outline"
                 size="lg"
                 className="w-full sm:w-auto"
                 title="Paste from Clipboard"
               >
                  <ClipboardPaste className="mr-2 h-5 w-5" /> Paste Text
               </Button>
            </div>
        </CardContent>
        {manualMidiBlob && (
           <CardFooter className="flex items-center justify-between">
             <span className="text-sm text-muted-foreground">Conversion successful.</span>
             <Button onClick={handleDownloadManualMidi} variant="outline">
                <Download className="mr-2 h-5 w-5" />
                Download Manual MIDI
             </Button>
           </CardFooter>
        )}
      </Card>

      {/* Iterate Input for MIDI Generation */}
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl flex items-center"><Repeat2 className="mr-2 h-6 w-6 text-green-500" /> Iterate for MIDI Generation</CardTitle>
          <CardDescription>Refine or generate new MIDI based on existing MIDI or LLM text.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">

             {/* Base Input Source */}
             <div className="space-y-2">
                <Label className="text-lg font-medium">Base Melody Input</Label>
                 <p className="text-sm text-muted-foreground">Provide the existing melody as a MIDI file or LLM text.</p>
                <div className="flex flex-col sm:flex-row items-center gap-4">
                  {/* Upload MIDI File Input */}
                   <div className="flex-1 space-y-1">
                       <Label htmlFor="iterateBaseMidiUpload" className="text-sm font-medium">Upload MIDI File (.mid)</Label>
                        <input
                          id="iterateBaseMidiUpload"
                          type="file"
                          accept=".mid,.midi"
                          onChange={handleIterateMidiFileChange}
                          disabled={isGeneratingIterative}
                        />
                    </div>
                     <span className="text-muted-foreground">OR</span>
                   {/* Paste LLM Text Input */}
                   <div className="flex-1 space-y-1">
                       <Label htmlFor="iterateBaseTextInput" className="text-sm font-medium">Paste LLM Text</Label>
                        <div className="flex gap-2">
                           <Textarea
                            id="iterateBaseTextInput"
                            placeholder="Paste LLM generated text describing a melody..."
                            value={iterateBaseTextInput}
                            onChange={(e) => setIterateBaseTextInput(e.target.value)}
                            className="min-h-[100px] text-base flex-1"
                            disabled={isGeneratingIterative || !!iterateBaseMidiFile} // Disable if generating or MIDI file is selected
                           />
                            <Button
                               onClick={handlePasteIntoIterateBaseText}
                               variant="outline"
                               size="icon"
                               disabled={isGeneratingIterative || !!iterateBaseMidiFile} // Disable if generating or MIDI file is selected
                               title="Paste from Clipboard"
                             >
                                <ClipboardPaste className="h-5 w-5" />
                             </Button>
                        </div>
                    </div>
                </div>
                 {(iterateBaseMidiFile || iterateBaseTextInput.trim()) && !isGeneratingIterative && (
                     <p className="text-sm text-green-600">Base input provided.</p>
                 )}
            </div>

             {/* Iteration Prompt Input */}
             <div className="space-y-2">
                <Label htmlFor="iterativePromptInput" className="text-lg font-medium">Iteration Prompt</Label>
                 <Textarea
                  id="iterativePromptInput"
                  placeholder="e.g., 'make it sadder', 'add a bridge in a minor key', 'change the rhythm'..."
                  value={iterativePromptInput}
                  onChange={(e) => setIterativePromptInput(e.target.value)}
                  className="min-h-[100px] text-base"
                  disabled={isGeneratingIterative}
                 />
            </div>

          </div>

           {/* Process Button */}
           <div className="flex justify-center mt-6">
              <Button
                 onClick={handleIterateGeneration}
                 disabled={isGeneratingIterative || (!iterateBaseMidiFile && !iterateBaseTextInput.trim()) || !iterativePromptInput.trim()}
                 className="w-full sm:w-auto bg-green-500 hover:bg-green-600 text-white text-lg py-3 px-6"
              >
                 {isGeneratingIterative ? (
                    <span className="flex items-center">
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Processing...
                    </span>
                  ) : (
                    <>
                      <Repeat2 className="mr-2 h-5 w-5" />
                      Process Iteration
                    </>
                  )}
              </Button>
           </div>

           {/* Placeholder for Iteration Output */}
            <div className="space-y-2 mt-6">
                <Label className="text-lg font-medium">Iteration Output</Label>
                 <Textarea
                  placeholder="Iterated melody text output will appear here..."
                  className="min-h-[150px] text-base bg-muted"
                  readOnly
                  value={iterativeOutputText}
                 />
                 {iterativeOutputMidiBlob && (
                    <div className="flex justify-end">
                         <Button onClick={handleDownloadIterativeMidi} variant="outline">
                            <Download className="mr-2 h-5 w-5" />
                            Download Iterated MIDI
                         </Button>
                    </div>
                 )}
            </div>

        </CardContent>
      </Card>

      {/* MIDI to LLM Text Conversion */}
       <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl flex items-center"><FileText className="mr-2 h-6 w-6 text-orange-500" /> MIDI to LLM Text Conversion</CardTitle>
          <CardDescription>Upload a MIDI file and convert it into an LLM-style text description.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
           <div className="space-y-2">
              <Label htmlFor="midiUploadForText" className="text-lg font-medium">Upload MIDI File</Label>
              <input
                id="midiUploadForText"
                type="file"
                accept=".mid,.midi"
                onChange={handleFileChangeForText}
                disabled={isConvertingToText}
              />
           </div>
           {/* Container for Convert and Copy buttons */}
           <div className="flex flex-col sm:flex-row items-center gap-4">
             <Button
               onClick={handleConvertToText}
               disabled={!midiFileForText || isConvertingToText}
               className="w-full sm:w-auto bg-orange-500 hover:bg-orange-600 text-white text-lg py-3 px-6"
             >
              {isConvertingToText ? (
                <span className="flex items-center">
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Converting...
                </span>
              ) : (
                <>
                  <FileText className="mr-2 h-5 w-5" />
                  Convert to Text
                </>
              )}

             </Button>
              <Button
                onClick={handleCopyToClipboard}
                disabled={!llmTextOutput}
                variant="outline"
                size="lg"
                className="w-full sm:w-auto"
              >
                 <Copy className="mr-2 h-5 w-5" /> Copy Text
               </Button>
           </div>
           <div className="space-y-2">
              <Label htmlFor="llmTextOutput" className="text-lg font-medium">LLM Text Output</Label>
              <Textarea
                id="llmTextOutput"
                placeholder="Generated LLM text description will appear here..."
                className="min-h-[150px] text-base bg-muted"
                readOnly
                value={llmTextOutput}
              />
               {/* Removed absolute positioned copy button */}
            </div>
        </CardContent>
       </Card>

        {/* Placeholder for Vocal Generation - Assuming this is separate */}
       {/* <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl flex items-center"><FileAudio className="mr-2 h-6 w-6 text-blue-500" /> Vocal Generation</CardTitle>
          <CardDescription>Generate vocals based on a melody.</CardDescription>
        </CardHeader>
        <CardContent>
           <p>Content for vocal generation tools goes here.</p>
        </CardContent>
       </Card> */}
    </div>
  );
}