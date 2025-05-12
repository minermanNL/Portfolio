import type { User } from '@supabase/supabase-js';

export interface AppUser extends User {
  // You can extend User type here if needed, e.g. with profile data
  // For now, it's the same as Supabase User
}

export interface Melody {
  id: string;
  user_id: string;
  title: string;
  description?: string | null;
  genre?: string | null;
  midi_data?: any; // This would be more specific, e.g., string (URL or base64) or object
  created_at: string; 
  // Example: if you store a URL from a service like Suno
  audio_url?: string;
}

export interface UserProfile {
  id: string; // Corresponds to Supabase auth user ID
  updated_at?: string | null;
  username?: string | null;
  full_name?: string | null;
  avatar_url?: string | null;
  website?: string | null;
}

export type SubscriptionStatus = 'active' | 'inactive' | 'canceled' | 'past_due' | 'incomplete' | 'trialing' | null;

export interface Subscription {
  id: string;
  user_id: string;
  status: SubscriptionStatus;
  stripe_customer_id?: string | null;
  stripe_subscription_id?: string | null;
  plan_name?: string | null;
  created_at: string;
  current_period_end?: string | null; // Date string
  manage_url?: string; // URL to Stripe portal
}
