import type { Metadata } from 'next';
import { MelodyGenerationClient } from '@/components/dashboard/MelodyGenerationClient';

export const metadata: Metadata = {
  title: 'AI Melody Generator - Tricion Studio',
  description: 'Create unique melodies using AI at Tricion Studio.',
};

export default function MelodyGenerationPage() {
  return <MelodyGenerationClient />;
}
