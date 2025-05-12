import { LoginForm } from '@/components/auth/LoginForm';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Login - Tricion Studio',
  description: 'Log in to your Tricion Studio account.',
};

export default function LoginPage() {
  return <LoginForm />;
}
