import type { Metadata } from 'next';
import { VocalGenerationClient } from '@/components/dashboard/VocalGenerationClient';

export const metadata: Metadata = {
  title: 'Vocal Generation - Tricion Studio',
  description: 'Generate vocal melodies or convert text to speech.',
};

export default function VocalGenerationPage() {
  return <VocalGenerationClient />;
}
