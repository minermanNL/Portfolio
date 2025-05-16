import type { Metadata } from 'next';
import { AdvancedMelodyToolsClient } from '@/components/dashboard/AdvancedMelodyToolsClient';

export const metadata: Metadata = {
  title: 'Advanced Melody Tools - Tricion Studio',
  description: 'Manual text to MIDI conversion and vocal generation tools.',
};

export default function AdvancedMelodyToolsPage() {
  return <AdvancedMelodyToolsClient />;
}
