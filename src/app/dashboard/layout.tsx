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
        <main className="flex-1 p-6 md:p-8 lg:p-10 overflow-y-auto relative overflow-hidden"> {/* Added relative overflow-hidden */}
          {/* Background Gradients */}
          <div className="absolute inset-0 rounded-none z-0"> {/* rounded-none because main content area is typically not rounded */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-primary/10 to-secondary/20"></div>
            <div className="absolute inset-0" style={{ background: 
              'radial-gradient(circle at 20% 20%, hsla(var(--primary) / 0.2) 0%, transparent 40%), radial-gradient(circle at 80% 80%, hsla(var(--secondary) / 0.2) 0%, transparent 40%), radial-gradient(circle at 50% 50%, hsla(var(--primary) / 0.1) 0%, hsla(var(--secondary) / 0.05) 50%, transparent 100%)' 
            }}></div>
          </div>

          {/* Content layered above background */}
          <div className="relative z-10">
             {children}
          </div>
        </main>
      </div>
    </div>
  );
}
