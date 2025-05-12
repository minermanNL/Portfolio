"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, User, Library, Sparkles, CreditCard, LogOut, Settings, Music2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Logo } from '@/components/shared/Logo';
import { useAuthSession } from '@/hooks/useAuthSession';
import { cn } from '@/lib/utils';

const navItems = [
  { href: '/dashboard', label: 'Overview', icon: Home },
  { href: '/dashboard/generate', label: 'AI Generator', icon: Sparkles },
  { href: '/dashboard/library', label: 'Melody Library', icon: Library },
  { href: '/dashboard/profile', label: 'User Profile', icon: User },
  { href: '/dashboard/subscription', label: 'Subscription', icon: CreditCard },
];

export function AppSidebar() {
  const pathname = usePathname();
  const { signOut, user } = useAuthSession();

  return (
    <aside className="w-64 bg-sidebar text-sidebar-foreground p-4 flex flex-col justify-between shadow-lg fixed h-full">
      <div>
        <div className="mb-8 px-2">
          <Logo className="text-sidebar-foreground" iconSize={28} textSize="text-2xl" />
        </div>
        <nav className="space-y-2">
          {navItems.map((item) => (
            <Button
              key={item.label}
              variant={pathname === item.href ? 'secondary' : 'ghost'}
              className={cn(
                "w-full justify-start text-base py-6",
                pathname === item.href 
                  ? "bg-sidebar-primary text-sidebar-primary-foreground hover:bg-sidebar-primary/90" 
                  : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              )}
              asChild
            >
              <Link href={item.href}>
                <item.icon className="mr-3 h-5 w-5" />
                {item.label}
              </Link>
            </Button>
          ))}
        </nav>
      </div>
      <div className="mt-auto">
         <Button
          variant="ghost"
          className="w-full justify-start text-base py-6 text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
          onClick={signOut}
          disabled={!user}
        >
          <LogOut className="mr-3 h-5 w-5" />
          Log Out
        </Button>
      </div>
    </aside>
  );
}
