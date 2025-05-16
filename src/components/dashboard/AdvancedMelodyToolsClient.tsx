"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Download, FileAudio, Music, Repeat2, FileText, Loader2, Copy, ClipboardPaste } from 'lucide-react'; // Added ClipboardPaste icon
import { parseTextToMidi } from '@/parseTextToMidi';

export function AdvancedMelodyToolsClient() {
  const [manualTextInput, setManualTextInput] = useState('');
  const [manualMidiBlob, setManualMidiBlob] = useState<Blob | null>(null);

  const [midiFileForText, setMidiFileForText] = useState<File | null>(null); // State for the selected MIDI file
  const [llmTextOutput, setLlmTextOutput] = useState(''); // State for the generated text output
  const [isConvertingToText, setIsConvertingToText] = useState(false); // Loading state for MIDI to Text conversion

  const [iterateTextInput, setIterateTextInput] = useState(''); // State for iterate text input
  const [iterateMidiFile, setIterateMidiFile] = useState<File | null>(null); // State for iterate MIDI file input

  const { toast } = useToast();

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
      const midiBytes = parseTextToMidi(manualTextInput);
      const blob = new Blob([midiBytes], { type: 'audio/midi' });
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

    try {
      const response = await fetch('/api/midi-to-text', {
        method: 'POST',
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

  const handlePasteIntoIterateText = async () => {
     try {
      const text = await navigator.clipboard.readText();
      setIterateTextInput(text);
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

  // Placeholder for Iterate MIDI File change handler
  const handleIterateMidiFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setIterateMidiFile(event.target.files[0]);
       // Clear text input if a MIDI file is selected for iteration
      setIterateTextInput('');
    } else {
      setIterateMidiFile(null);
    }
  };


  return (
    <div className="space-y-8">
      {/* Manual Text to MIDI Conversion Section (Existing) */}
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

      {/* Iterate Input for MIDI Generation (New Section) - Still placeholder */}
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl flex items-center"><Repeat2 className="mr-2 h-6 w-6 text-green-500" /> Iterate for MIDI Generation</CardTitle>
          <CardDescription>Refine or generate new MIDI based on existing MIDI or LLM text.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            {/* Input Type Selection (Placeholder) */}
            <div className="space-y-2">
               <Label className="text-lg font-medium">Input Source</Label>
               {/* Radio buttons or tabs for 'Upload MIDI' vs 'Paste Text' will go here later */}
               <p className="text-sm text-muted-foreground">Choose whether to upload a MIDI file or paste LLM text as the base for iteration.</p>
            </div>

             {/* Upload MIDI File Input */}
             <div className="space-y-2">
                <Label htmlFor="iterateMidiUpload" className="text-lg font-medium">Upload MIDI File</Label>
                 <input
                   id="iterateMidiUpload"
                   type="file"
                   accept=".mid,.midi"
                   onChange={handleIterateMidiFileChange} // Use the new handler
                   disabled // Keep disabled as processing is not implemented yet
                 />
             </div>

             {/* Paste LLM Text Input */}
             <div className="space-y-2">
                <Label htmlFor="iterateTextInput" className="text-lg font-medium">Or Paste LLM Text:</Label>
                 <Textarea
                  id="iterateTextInput"
                  placeholder="Paste LLM generated text describing a melody..."
                  value={iterateTextInput}
                  onChange={(e) => setIterateTextInput(e.target.value)}
                  className="min-h-[150px] text-base"
                  disabled // Keep disabled as processing is not implemented yet
                 />
             </div>
          </div>

           {/* Container for Process and Paste buttons */}
           <div className="flex flex-col sm:flex-row items-center gap-4">
              <Button disabled className="w-full sm:w-auto bg-green-500 hover:bg-green-600 text-white text-lg py-3 px-6">
                Process Input (Coming Soon)
              </Button>
               <Button
                 onClick={handlePasteIntoIterateText}
                 variant="outline"
                 size="lg"
                 className="w-full sm:w-auto"
                 title="Paste from Clipboard"
                 disabled={true} // Disable the paste button if the textarea is disabled
               >
                  <ClipboardPaste className="mr-2 h-5 w-5" /> Paste Text
               </Button>
           </div>

           {/* Placeholder for Iteration Output */}
            <div className="space-y-2 mt-6">
                <Label className="text-lg font-medium">Iteration Output</Label>
                 <Textarea
                  placeholder="Iterated melody (MIDI or text) will appear here..."
                  className="min-h-[150px] text-base bg-muted"
                  readOnly
                 />
            </div>

        </CardContent>
      </Card>

      {/* MIDI to LLM Text Conversion (New Section) - Integrated with placeholder backend */}
       <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl flex items-center"><FileText className="mr-2 h-6 w-6 text-orange-500" /> MIDI to LLM Text</CardTitle>
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
    </div>
  );
}
