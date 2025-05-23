"use client";

import type { Melody } from '@/types';
import { MelodyCard } from './MelodyCard';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { useState, useMemo } from 'react';
import { Search, ListFilter, XCircle, Music } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent } from '@/components/ui/card'; // Ensure Card is imported

interface MelodyListProps {
  melodies: Melody[];
}

export function MelodyList({ melodies }: MelodyListProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterGenre, setFilterGenre] = useState('all');

  const { toast } = useToast();

  const availableGenres = useMemo(() => {
    const genres = new Set(melodies.map(m => m.metadata?.genre).filter(Boolean) as string[]);
    return ['all', ...Array.from(genres)];
  }, [melodies]);

  const filteredMelodies = useMemo(() => {
    return melodies.filter(melody => {
      const matchesSearch = melody.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            melody.description?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesGenre = filterGenre === 'all' || (melody.metadata?.genre as string) === filterGenre;
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
    // Note: In a real app, you'd want to send a delete request to the backend here
    toast({ title: "Delete Requested", description: `Melody ${melodyId} marked for deletion.`});
    console.log(`Attempted to delete melody with ID: ${melodyId}`);
  };

  return (
    <div className="space-y-6">
      {/* Filter and Search Card */}
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
                className="pl-10 pr-10 w-full"
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

      {/* Melody List or Empty State */}
      {filteredMelodies.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredMelodies.map(melody => (
            <MelodyCard
              key={melody.id}
              melody={melody}
              onPlay={() => handlePlay(melody)}
              onEdit={() => handleEdit(melody)}
              onDelete={() => handleDelete(melody.id)}
            />
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
