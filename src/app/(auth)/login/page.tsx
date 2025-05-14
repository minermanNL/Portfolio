"use client";

import { LoginForm } from '@/components/auth/LoginForm';
import type { Metadata } from 'next';
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react'; // Added import

// This component will contain the logic that uses useSearchParams
function LoginContent() {
  const searchParams = useSearchParams();
  const plan = searchParams.get('plan');
  return <LoginForm plan={plan} />;
}

export default function LoginPage() {
  return (
    // Wrap the component that uses useSearchParams in Suspense
    <Suspense fallback={<div>Loading...</div>}> {/* You can customize the fallback UI */}
      <LoginContent />
    </Suspense>
  );
}
