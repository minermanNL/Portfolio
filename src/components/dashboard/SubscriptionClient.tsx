"use client";

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { useAuthSession } from '@/hooks/useAuthSession';
import type { Subscription, SubscriptionStatus } from '@/types';
import { CreditCard, AlertTriangle, CheckCircle2, ExternalLink, Loader2, CalendarDays, Info } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';

// MOCK API Functions - Replace with actual backend calls
const fetchSubscriptionDetails = async (userId: string): Promise<Subscription | null> => {
  console.log("Fetching subscription for user:", userId);
  await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API delay
  
  // Simulate different states for testing
  const mockScenario = Math.random();
  if (mockScenario < 0.6) { // Active subscription
    return {
      id: 'sub_mock_123',
      user_id: userId,
      status: 'active',
      plan_name: 'Pro Monthly',
      created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 45).toISOString(), // 45 days ago
      current_period_end: new Date(Date.now() + 1000 * 60 * 60 * 24 * 15).toISOString(), // 15 days from now
      manage_url: 'https://billing.stripe.com/p/session/mock_manage_session_id', // Example Stripe portal link
      stripe_customer_id: "cus_mock",
      stripe_subscription_id: "sub_mock_id_from_stripe"
    };
  } else if (mockScenario < 0.8) { // Inactive/canceled
     return {
      id: 'sub_mock_456',
      user_id: userId,
      status: 'canceled',
      plan_name: 'Basic Yearly',
      created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 100).toISOString(),
      current_period_end: new Date(Date.now() - 1000 * 60 * 60 * 24 * 10).toISOString(), // Ended 10 days ago
      manage_url: 'https://billing.stripe.com/p/session/mock_manage_session_id_canceled',
      stripe_customer_id: "cus_mock_other",
      stripe_subscription_id: "sub_mock_id_from_stripe_other"
    };
  } else { // No subscription
    return null;
  }
};

// Helper to format date string
const formatDate = (dateString?: string | null) => {
  if (!dateString) return 'N/A';
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric', month: 'long', day: 'numeric'
  });
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

  useEffect(() => {
    if (user && user.id) {
      setIsLoadingData(true);
      fetchSubscriptionDetails(user.id)
        .then(data => {
          setSubscription(data);
        })
        .catch(err => {
          toast({ title: "Error", description: "Could not fetch subscription details: " + err.message, variant: "destructive" });
        })
        .finally(() => setIsLoadingData(false));
    } else if (!authLoading) {
      setIsLoadingData(false);
    }
  }, [user, toast, authLoading]);

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
            <a href="/pricing"> {/* Assuming a pricing page exists */}
              View Subscription Plans
            </a>
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
