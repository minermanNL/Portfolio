import type { Metadata } from 'next';
import { ProfileClient } from '@/components/dashboard/ProfileClient';

export const metadata: Metadata = {
  title: 'User Profile - Tricion Studio',
  description: 'Manage your profile information at Tricion Studio.',
};

export default function ProfilePage() {
  return <ProfileClient />;
}
