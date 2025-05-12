import type { Melody } from '@/types';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Music, Download, Edit3, Trash2, Clock } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { formatDistanceToNow } from 'date-fns';


interface MelodyCardProps {
  melody: Melody;
  onPlay?: (melody: Melody) => void;
  onEdit?: (melody: Melody) => void;
  onDelete?: (melodyId: string) => void;
}

export function MelodyCard({ melody, onPlay, onEdit, onDelete }: MelodyCardProps) {
  return (
    <Card className="shadow-md hover:shadow-xl transition-shadow duration-300 flex flex-col">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-xl mb-1 text-primary">{melody.title}</CardTitle>
            {melody.genre && <Badge variant="secondary" className="mb-2">{melody.genre}</Badge>}
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
        <Button variant="outline" size="sm" onClick={() => onPlay?.(melody)} className="w-full sm:w-auto">
          <Download className="mr-2 h-4 w-4" /> Play/Download
        </Button>
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
