"use client";

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useAuthSession } from '@/hooks/useAuthSession';
import { LogOut, User as UserIcon, Settings, ChevronDown } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

// Function to get first letters for Avatar Fallback
const getInitials = (name?: string | null) => {
  if (!name) return 'U';
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase();
};

const getPageTitle = (pathname: string) => {
  if (pathname.startsWith('/dashboard/generate')) return 'AI Melody Generator';
  if (pathname.startsWith('/dashboard/library')) return 'Melody Library';
  if (pathname.startsWith('/dashboard/profile')) return 'User Profile';
  if (pathname.startsWith('/dashboard/subscription')) return 'Subscription Management';
  if (pathname === '/dashboard') return 'Overview';
  return 'Tricion Studio';
}


export function AppNavbar() {
  const { user, signOut } = useAuthSession();
  const pathname = usePathname();
  const pageTitle = getPageTitle(pathname);

  return (
    <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b bg-card px-6 shadow-sm">
      <div>
        <h1 className="text-xl font-semibold text-foreground">{pageTitle}</h1>
      </div>
      {user && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-10 rounded-full flex items-center gap-2 px-2">
              <Avatar className="h-8 w-8">
                <AvatarImage src={user.user_metadata?.avatar_url || `https://picsum.photos/seed/${user.id}/40/40`} alt={user.email || 'User'} data-ai-hint="profile avatar" />
                <AvatarFallback>{getInitials(user.email)}</AvatarFallback>
              </Avatar>
              <span className="hidden sm:inline-block text-sm font-medium text-foreground">{user.email}</span>
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none text-foreground">
                  {user.user_metadata?.full_name || user.email}
                </p>
                <p className="text-xs leading-none text-muted-foreground">
                  {user.email}
                </p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/dashboard/profile">
                <UserIcon className="mr-2 h-4 w-4" />
                <span>Profile</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
               <Link href="/dashboard/subscription">
                <Settings className="mr-2 h-4 w-4" />
                <span>Billing</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={signOut} className="text-destructive focus:text-destructive focus:bg-destructive/10">
              <LogOut className="mr-2 h-4 w-4" />
              <span>Log out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </header>
  );
}
