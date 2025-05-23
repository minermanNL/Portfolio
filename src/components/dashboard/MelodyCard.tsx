import type { Melody } from '@/types';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Music, Download, Edit3, Trash2, Clock, Play } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { formatDistanceToNow } from 'date-fns';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useToast } from '@/hooks/use-toast';

interface MelodyCardProps {
  melody: Melody;
  onPlay?: (melody: Melody) => void;
  onEdit?: (melody: Melody) => void;
  onDelete?: (melodyId: string) => void;
}

export function MelodyCard({ melody, onPlay, onEdit, onDelete }: MelodyCardProps) {
  const { toast } = useToast();

  const handleDownload = () => {
    try {
      // Decode the base64 MIDI data
      const byteCharacters = atob(melody.midi_data);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: 'audio/midi' });

      // Create a download link
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${melody.title || 'melody'}.mid`; // Use title or default name

      // Append to body, click, and remove
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // Clean up the object URL
      URL.revokeObjectURL(url);

    } catch (error) {
      console.error('Error downloading MIDI:', error);
      toast({ title: "Download Failed", description: "Could not download the melody MIDI data.", variant: "destructive" });
    }
  };

  const handlePlay = () => {
    console.log(`Attempting to play melody: ${melody.title}`);
    // TODO: Implement in-browser MIDI playback here
    // This will likely involve decoding melody.midi_data (base64)
    // and using a MIDI playback library or Web Audio API.
    toast({ title: "Playback Initiated", description: `Attempting to play "${melody.title}". (Playback functionality pending)` });
    onPlay?.(melody);
  };

  return (
    <Card className="shadow-md hover:shadow-xl transition-shadow duration-300 flex flex-col">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-xl mb-1 text-primary">{melody.title || 'Untitled Melody'}</CardTitle>
            {/* Access genre from metadata */}
            {melody.metadata?.genre && <Badge variant="secondary" className="mb-2">{melody.metadata.genre as string}</Badge>}
          </div>
          <Music className="h-8 w-8 text-accent flex-shrink-0" />
        </div>
        <CardDescription className="text-sm text-muted-foreground line-clamp-2 h-[40px]">
          {melody.description || 'No description available.'}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-grow">
        {/* Placeholder for a mini player or waveform visualizer */}
        <div className="h-10 bg-secondary/30 rounded-md flex items-center justify-center text-sm text-muted-foreground">
          Audio Preview Placeholder
        </div>
         <p className="text-xs text-muted-foreground mt-2 flex items-center">
          <Clock className="h-3 w-3 mr-1" /> 
          Created {formatDistanceToNow(new Date(melody.created_at), { addSuffix: true })}
        </p>
      </CardContent>
      <CardFooter className="flex flex-col sm:flex-row sm:justify-between gap-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="w-full sm:w-auto">
              <Play className="mr-2 h-4 w-4" /> Actions
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem onClick={handlePlay}>
              <Play className="mr-2 h-4 w-4" /> Play
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleDownload}>
              <Download className="mr-2 h-4 w-4" /> Download MIDI
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <div className="flex gap-2 w-full sm:w-auto">
          <Button variant="ghost" size="sm" onClick={() => onEdit?.(melody)} className="flex-1 sm:flex-none">
            <Edit3 className="mr-0 sm:mr-2 h-4 w-4" /> <span className="sm:inline hidden">Edit</span>
          </Button>
          <Button variant="ghost" size="sm" onClick={() => onDelete?.(melody.id)} className="text-destructive hover:text-destructive hover:bg-destructive/10 flex-1 sm:flex-none">
            <Trash2 className="mr-0 sm:mr-2 h-4 w-4" /> <span className="sm:inline hidden">Delete</span>
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}
