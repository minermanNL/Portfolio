import { SignupForm } from '@/components/auth/SignupForm';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Sign Up - Tricion Studio',
  description: 'Create your Tricion Studio account.',
};

export default function SignupPage() {
  return <SignupForm />;
}
