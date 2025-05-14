"use client";

import { LoginForm } from '@/components/auth/LoginForm';
import type { Metadata } from 'next';
import { useSearchParams } from 'next/navigation';

export default function LoginPage() {
  const searchParams = useSearchParams();
  const plan = searchParams.get('plan');
  return <LoginForm plan={plan} />;
}
