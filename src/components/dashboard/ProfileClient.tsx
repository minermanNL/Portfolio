"use client";

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useToast } from '@/hooks/use-toast';
import { useAuthSession } from '@/hooks/useAuthSession';
import type { UserProfile } from '@/types';
import { User, Mail, Globe, Save, Loader2, Edit2 } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { Skeleton } from '@/components/ui/skeleton';


// Placeholder for API functions - in a real app these would call your backend
const fetchUserProfile = async (userId: string, supabase: any): Promise<UserProfile | null> => {
  // Example using Supabase client directly for profiles table
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();
  if (error && error.code !== 'PGRST116') { // PGRST116: single row not found
     console.error("Error fetching profile:", error);
     throw error;
  }
  return data;
};

const updateUserProfile = async (userId: string, updates: Partial<UserProfile>, supabase: any): Promise<UserProfile> => {
  const { data, error } = await supabase
    .from('profiles')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', userId)
    .select()
    .single();

  if (error) {
    console.error("Error updating profile:", error);
    throw error;
  }
  return data;
};


const profileSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters").max(50, "Username too long").optional().or(z.literal('')),
  full_name: z.string().min(2, "Full name must be at least 2 characters").max(100, "Full name too long").optional().or(z.literal('')),
  website: z.string().url("Invalid URL format").optional().or(z.literal('')),
  // avatar_url might be handled separately (e.g., file upload)
});

type ProfileFormValues = z.infer<typeof profileSchema>;

export function ProfileClient() {
  const { user, supabase, isLoading: authLoading } = useAuthSession();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
  });

  useEffect(() => {
    if (user && user.id) {
      setIsLoadingData(true);
      fetchUserProfile(user.id, supabase)
        .then(data => {
          setProfile(data);
          if (data) {
            form.reset({
              username: data.username || '',
              full_name: data.full_name || '',
              website: data.website || '',
            });
          }
        })
        .catch(err => {
          toast({ title: "Error", description: "Could not fetch profile: " + err.message, variant: "destructive" });
        })
        .finally(() => setIsLoadingData(false));
    } else if (!authLoading) {
      setIsLoadingData(false); // Not logged in, or no user ID
    }
  }, [user, supabase, form, toast, authLoading]);

  const onSubmit = async (data: ProfileFormValues) => {
    if (!user || !user.id) return;
    setIsSubmitting(true);
    try {
      const updatedProfile = await updateUserProfile(user.id, data, supabase);
      setProfile(updatedProfile);
      setIsEditing(false);
      toast({
        title: 'Profile Updated',
        description: 'Your profile information has been saved.',
      });
    } catch (err: any) {
      toast({
        title: 'Update Failed',
        description: err.message || 'Could not update profile.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const getInitials = (name?: string | null) => {
    if (!name) return user?.email?.charAt(0).toUpperCase() || 'U';
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  if (authLoading || isLoadingData) {
    return (
      <Card className="shadow-lg">
        <CardHeader className="items-center text-center">
          <Skeleton className="h-24 w-24 rounded-full mb-4" />
          <Skeleton className="h-6 w-48 mb-2" />
          <Skeleton className="h-4 w-64" />
        </CardHeader>
        <CardContent className="space-y-6 p-6">
          {[1,2,3].map(i => (
            <div key={i} className="space-y-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-10 w-full" />
            </div>
          ))}
        </CardContent>
        <CardFooter className="flex justify-end">
           <Skeleton className="h-10 w-24" />
        </CardFooter>
      </Card>
    );
  }

  if (!user) {
    return (
      <Card className="shadow-lg">
        <CardContent className="p-8 text-center">
          <p className="text-muted-foreground">Please log in to view your profile.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-lg max-w-2xl mx-auto">
      <CardHeader className="items-center text-center">
        <Avatar className="h-24 w-24 mb-4 border-2 border-accent">
          <AvatarImage src={profile?.avatar_url || `https://picsum.photos/seed/${user.id}/100/100`} alt={profile?.full_name || user.email || 'User'} data-ai-hint="profile picture"/>
          <AvatarFallback className="text-3xl bg-muted">{getInitials(profile?.full_name)}</AvatarFallback>
        </Avatar>
        <CardTitle className="text-2xl">{profile?.full_name || user.email}</CardTitle>
        <CardDescription>Manage your personal information and account settings.</CardDescription>
      </CardHeader>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <CardContent className="space-y-6 p-6">
          <div className="space-y-2">
            <Label htmlFor="email" className="flex items-center"><Mail className="mr-2 h-4 w-4 text-muted-foreground"/> Email</Label>
            <Input id="email" type="email" value={user.email || ''} disabled className="bg-muted/50"/>
            <p className="text-xs text-muted-foreground">Email cannot be changed here.</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="username" className="flex items-center"><User className="mr-2 h-4 w-4 text-muted-foreground"/> Username</Label>
            <Input id="username" {...form.register('username')} placeholder="Your unique username" disabled={!isEditing} />
            {form.formState.errors.username && <p className="text-sm text-destructive">{form.formState.errors.username.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="full_name" className="flex items-center"><User className="mr-2 h-4 w-4 text-muted-foreground"/> Full Name</Label>
            <Input id="full_name" {...form.register('full_name')} placeholder="Your full name" disabled={!isEditing} />
            {form.formState.errors.full_name && <p className="text-sm text-destructive">{form.formState.errors.full_name.message}</p>}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="website" className="flex items-center"><Globe className="mr-2 h-4 w-4 text-muted-foreground"/> Website</Label>
            <Input id="website" type="url" {...form.register('website')} placeholder="https://your-website.com" disabled={!isEditing}/>
            {form.formState.errors.website && <p className="text-sm text-destructive">{form.formState.errors.website.message}</p>}
          </div>
          {/* Avatar upload could be added here */}
        </CardContent>
        <CardFooter className="flex justify-end gap-2 p-6">
          {isEditing ? (
            <>
              <Button type="button" variant="outline" onClick={() => { setIsEditing(false); form.reset(profile ? {username: profile.username || '', full_name: profile.full_name || '', website: profile.website || ''} : {}); }}>Cancel</Button>
              <Button type="submit" disabled={isSubmitting} className="bg-accent hover:bg-accent/90 text-accent-foreground">
                {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                Save Changes
              </Button>
            </>
          ) : (
            <Button type="button" onClick={() => setIsEditing(true)}>
              <Edit2 className="mr-2 h-4 w-4" /> Edit Profile
            </Button>
          )}
        </CardFooter>
      </form>
    </Card>
  );
}
