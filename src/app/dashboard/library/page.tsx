import type { Metadata } from 'next';
import { MelodyList } from '@/components/dashboard/MelodyList';

export const metadata: Metadata = {
  title: 'Melody Library - Tricion Studio',
  description: 'Browse, search, and manage your melodies at Tricion Studio.',
};

export default function MelodyLibraryPage() {
  return <MelodyList />;
}
