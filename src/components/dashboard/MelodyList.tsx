"use client";

import type { Melody } from '@/types';
import { MelodyCard } from './MelodyCard';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { useState, useMemo, useEffect } from 'react';
import { Search, ListFilter, XCircle, Music, Info } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";


// MOCK DATA - Replace with API call
const fetchMelodies = async (): Promise<Melody[]> => {
  await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API delay
  return [
    { id: '1', user_id: 'user1', title: 'Sunset Serenade', description: 'A calming melody for evening relaxation.', genre: 'Ambient', created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(), midi_data: {} },
    { id: '2', user_id: 'user1', title: 'Cyberpunk Dreams', description: 'Upbeat electronic track with a futuristic vibe.', genre: 'Electronic', created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5).toISOString(), midi_data: {} },
    { id: '3', user_id: 'user1', title: 'Forest Whisper', description: 'Gentle acoustic piece, evoking nature.', genre: 'Acoustic', created_at: new Date(Date.now() - 1000 * 60 * 30).toISOString(), midi_data: {} },
    { id: '4', user_id: 'user1', title: 'Retro Arcade Groove', description: '8-bit inspired chiptune fun.', genre: 'Chiptune', created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 10).toISOString(), midi_data: {} },
  ];
};


export function MelodyList() {
  const [melodies, setMelodies] = useState<Melody[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterGenre, setFilterGenre] = useState('all');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const loadMelodies = async () => {
      setIsLoading(true);
      setError(null);
      try {
        // In a real app, this would be an API call:
        // const fetchedMelodies = await api.getMelodies(); 
        const fetchedMelodies = await fetchMelodies();
        setMelodies(fetchedMelodies);
      } catch (err: any) {
        setError(err.message || "Failed to load melodies.");
        toast({ title: "Error", description: "Could not fetch melodies.", variant: "destructive" });
      } finally {
        setIsLoading(false);
      }
    };
    loadMelodies();
  }, [toast]);

  const availableGenres = useMemo(() => {
    const genres = new Set(melodies.map(m => m.genre).filter(Boolean) as string[]);
    return ['all', ...Array.from(genres)];
  }, [melodies]);

  const filteredMelodies = useMemo(() => {
    return melodies.filter(melody => {
      const matchesSearch = melody.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            melody.description?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesGenre = filterGenre === 'all' || melody.genre === filterGenre;
      return matchesSearch && matchesGenre;
    });
  }, [melodies, searchTerm, filterGenre]);

  const handlePlay = (melody: Melody) => {
    toast({ title: "Playback Requested", description: `Playing ${melody.title}` });
    // Implement actual playback logic
  };
  const handleEdit = (melody: Melody) => {
    toast({ title: "Edit Requested", description: `Editing ${melody.title}` });
    // Navigate to edit page or open modal
  };
  const handleDelete = (melodyId: string) => {
    // Optimistic UI update example
    const originalMelodies = [...melodies];
    setMelodies(prev => prev.filter(m => m.id !== melodyId));
    toast({ title: "Delete Requested", description: `Melody ${melodyId} marked for deletion.`});
    // Call API to delete. If fails, revert:
    // e.g. api.deleteMelody(melodyId).catch(() => { setMelodies(originalMelodies); toast({ ...error... })})
  };
  
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <LoadingSpinner size={48} />
        <p className="mt-4 text-muted-foreground">Loading your melodies...</p>
      </div>
    );
  }

  if (error) {
     return (
      <Alert variant="destructive" className="max-w-lg mx-auto">
        <Info className="h-4 w-4" />
        <AlertTitle>Failed to Load Melodies</AlertTitle>
        <AlertDescription>
          There was an issue fetching your melody library. Please try again later. ({error})
        </AlertDescription>
      </Alert>
    );
  }


  return (
    <div className="space-y-6">
      <Card className="shadow-sm">
        <CardContent className="p-4 md:p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-grow">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search melodies by title or description..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-10 w-full" // Added pr-10 for clear button
              />
              {searchTerm && (
                <Button variant="ghost" size="icon" className="absolute right-2 top-1/2 -translate-y-1/2 h-7 w-7" onClick={() => setSearchTerm('')}>
                  <XCircle className="h-4 w-4 text-muted-foreground" />
                </Button>
              )}
            </div>
            <div className="flex gap-4">
              <Select value={filterGenre} onValueChange={setFilterGenre}>
                <SelectTrigger className="w-full md:w-[180px]">
                  <ListFilter className="h-4 w-4 mr-2 text-muted-foreground" />
                  <SelectValue placeholder="Filter by genre" />
                </SelectTrigger>
                <SelectContent>
                  {availableGenres.map(genre => (
                    <SelectItem key={genre} value={genre}>
                      {genre === 'all' ? 'All Genres' : genre}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {filteredMelodies.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredMelodies.map(melody => (
            <MelodyCard key={melody.id} melody={melody} onPlay={handlePlay} onEdit={handleEdit} onDelete={handleDelete} />
          ))}
        </div>
      ) : (
        <Card className="shadow-sm">
          <CardContent className="py-12 text-center">
            <Music className="mx-auto h-12 w-12 text-muted-foreground/50 mb-4" />
            <p className="text-lg text-muted-foreground">
              {melodies.length === 0 ? "Your melody library is empty." : "No melodies match your search."}
            </p>
            <p className="text-sm text-muted-foreground/80">
              {melodies.length === 0 ? "Try generating some new melodies!" : "Adjust your search or filter criteria."}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
