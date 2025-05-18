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

export type SubscriptionStatus = 'active' | 'canceled' | 'incomplete' | 'incomplete_expired' | 'past_due' | 'trialing' | 'unpaid';

export interface Price {
  id: string;
  product_id: string;
  active: boolean;
  currency: string;
  unit_amount: number | null;
  type: 'one_time' | 'recurring';
  interval: 'day' | 'week' | 'month' | 'year' | null;
  interval_count: number;
  trial_period_days: number | null;
}

export interface Product {
  id: string;
  active: boolean;
  name: string;
  description: string | null;
  image: string | null;
  metadata: Record<string, any> | null;
}

export interface Subscription {
  id: string;
  user_id: string;
  status: SubscriptionStatus;
  price_id: string;
  quantity: number | null;
  cancel_at_period_end: boolean;
  created: string;
  current_period_start: string;
  current_period_end: string;
  ended_at: string | null;
  cancel_at: string | null;
  canceled_at: string | null;
  trial_start: string | null;
  trial_end: string | null;
  manage_url: string | null;
  prices: Price;
  products: Product;
}

export interface Tier {
  tier: string;
  monthly_generations: number;
  max_melody_storage: number;
  concurrent_generations: number;
  max_api_keys: number;
  advanced_features: boolean;
}
