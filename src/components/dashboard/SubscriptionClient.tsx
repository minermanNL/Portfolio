"use client";

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { useAuthSession } from '@/hooks/useAuthSession';
import type { Subscription, SubscriptionStatus } from '@/types';
import { CreditCard, AlertTriangle, CheckCircle2, ExternalLink, Loader2, CalendarDays, Info } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
// Import necessary Supabase client
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

// Helper to format date string
const formatDate = (dateString?: string | null) => {
  if (!dateString) return 'N/A';
  try {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric', month: 'long', day: 'numeric'
    });
  } catch (error) {
    console.error("Invalid date string:", dateString, error);
    return 'Invalid Date';
  }
};

const getStatusBadgeVariant = (status: SubscriptionStatus) => {
  switch (status) {
    case 'active': return 'default'; // Greenish, uses primary color from theme which is dark blue. Let's use success for shadcn.
    case 'trialing': return 'default';
    case 'past_due': return 'destructive';
    case 'canceled': return 'secondary';
    case 'inactive': return 'outline';
    default: return 'outline';
  }
}

// Shadcn badge does not have success variant by default, using 'default' for active
// We can add custom color for 'active' if needed, or rely on text + icon

export function SubscriptionClient() {
  const { user, isLoading: authLoading } = useAuthSession();
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const { toast } = useToast();
  const supabase = createClientComponentClient();

  useEffect(() => {
    if (user && user.id) {
      setIsLoadingData(true);
      fetchSubscriptionDetails(user.id)
        .then(data => {
          setSubscription(data);
          console.log("Fetched subscription data:", data);
        })
        .catch(err => {
          toast({ title: "Error", description: "Could not fetch subscription details: " + err.message, variant: "destructive" });
          console.error("Failed to fetch subscription details:", err);
        })
        .finally(() => setIsLoadingData(false));
    } else if (!authLoading) {
      setIsLoadingData(false);
    }
  }, [user, toast, authLoading]);

  const fetchSubscriptionDetails = async (userId: string): Promise<Subscription | null> => {
    const { data, error } = await supabase.from('subscriptions').select('*').eq('user_id', userId).single();
    if (error && error.code !== 'PGRST116') throw error; // Ignore "no rows found" error
    return data as Subscription | null;
  };

  const handleManageSubscription = () => {
    if (subscription?.manage_url) {
      window.open(subscription.manage_url, '_blank');
    } else {
      toast({ title: "Error", description: "Management URL not available.", variant: "destructive" });
    }
  };

  if (authLoading || isLoadingData) {
    return (
      <Card className="shadow-lg max-w-lg mx-auto">
        <CardHeader>
          <Skeleton className="h-8 w-3/4 mb-2" />
          <Skeleton className="h-4 w-1/2" />
        </CardHeader>
        <CardContent className="space-y-4 p-6">
          <div className="flex items-center justify-between">
            <Skeleton className="h-6 w-1/4" /> <Skeleton className="h-6 w-1/3" />
          </div>
          <div className="flex items-center justify-between">
            <Skeleton className="h-6 w-1/4" /> <Skeleton className="h-6 w-1/3" />
          </div>
           <div className="flex items-center justify-between">
            <Skeleton className="h-6 w-1/4" /> <Skeleton className="h-6 w-1/3" />
          </div>
        </CardContent>
        <CardFooter className="p-6">
          <Skeleton className="h-10 w-full" />
        </CardFooter>
      </Card>
    );
  }
  
  if (!user) {
     return (
      <Card className="shadow-lg max-w-lg mx-auto">
        <CardContent className="p-8 text-center">
          <p className="text-muted-foreground">Please log in to view your subscription details.</p>
        </CardContent>
      </Card>
    );
  }


  return (
    <Card className="shadow-lg max-w-lg mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl flex items-center"><CreditCard className="mr-2 h-6 w-6 text-accent" /> Subscription Status</CardTitle>
        <CardDescription>View your current plan and manage your billing details.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4 p-6">
        {subscription ? (
          <>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground font-medium">Current Plan:</span>
              <span className="font-semibold text-primary">{subscription.plan_name || 'N/A'}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground font-medium">Status:</span>
              <Badge variant={getStatusBadgeVariant(subscription.status)} className="capitalize text-sm px-3 py-1">
                {subscription.status === 'active' && <CheckCircle2 className="mr-1.5 h-4 w-4 text-green-500"/>}
                {subscription.status === 'past_due' && <AlertTriangle className="mr-1.5 h-4 w-4 text-red-500"/>}
                {subscription.status}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground font-medium">
                {subscription.status === 'canceled' || subscription.status === 'inactive' ? 'Ended On:' : 'Renews On:'}
              </span>
              <span className="flex items-center">
                <CalendarDays className="mr-1.5 h-4 w-4 text-muted-foreground" />
                {formatDate(subscription.current_period_end)}
              </span>
            </div>
            {subscription.status === 'past_due' && (
              <p className="text-sm text-destructive flex items-center"><AlertTriangle className="mr-1.5 h-4 w-4"/> Please update your payment information.</p>
            )}
          </>
        ) : (
          <div className="text-center py-8">
            <Info className="mx-auto h-10 w-10 text-muted-foreground/50 mb-3" />
            <p className="text-muted-foreground text-lg">You do not have an active subscription.</p>
            <p className="text-sm text-muted-foreground/80 mt-1">Consider subscribing to unlock premium features!</p>
          </div>
        )}
      </CardContent>
      <CardFooter className="p-6">
        {subscription && subscription.manage_url ? (
          <Button onClick={handleManageSubscription} className="w-full bg-accent hover:bg-accent/90 text-accent-foreground">
            Manage Subscription <ExternalLink className="ml-2 h-4 w-4" />
          </Button>
        ) : subscription ? (
           <Button disabled className="w-full">Management Link Unavailable</Button>
        ) : (
          <Button asChild className="w-full bg-primary hover:bg-primary/90">
            <Link href="/pricing">
            view Plans
            </Link>
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
