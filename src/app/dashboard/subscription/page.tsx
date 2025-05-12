import type { Metadata } from 'next';
import { SubscriptionClient } from '@/components/dashboard/SubscriptionClient';

export const metadata: Metadata = {
  title: 'Subscription - Tricion Studio',
  description: 'Manage your subscription details at Tricion Studio.',
};

export default function SubscriptionPage() {
  return <SubscriptionClient />;
}
