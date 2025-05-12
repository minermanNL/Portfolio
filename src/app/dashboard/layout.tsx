"use client"; // This layout needs to be a client component to use hooks for auth check

import { AppSidebar } from '@/components/dashboard/AppSidebar';
import { AppNavbar } from '@/components/dashboard/AppNavbar';
import { useAuthSession } from '@/hooks/useAuthSession';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Skeleton } from '@/components/ui/skeleton'; // For loading state

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { session, isLoading } = useAuthSession();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !session) {
      router.replace('/login');
    }
  }, [session, isLoading, router]);

  if (isLoading) {
    // Basic full-page skeleton loader
    return (
      <div className="flex min-h-screen">
        <Skeleton className="w-64 h-screen" />
        <div className="flex-1 flex flex-col">
          <Skeleton className="h-16 w-full" />
          <div className="flex-1 p-6">
            <Skeleton className="h-32 w-full mb-4" />
            <Skeleton className="h-64 w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (!session) {
    // This should ideally not be visible for long due to redirect
    return null; 
  }

  return (
    <div className="flex min-h-screen bg-background">
      <AppSidebar />
      <div className="flex-1 flex flex-col ml-64"> {/* Adjust ml to match sidebar width */}
        <AppNavbar />
        <main className="flex-1 p-6 md:p-8 lg:p-10 bg-background overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
