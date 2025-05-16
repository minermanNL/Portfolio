import type { Metadata } from 'next';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from 'next/link';
import { Sparkles, Library, User, CreditCard } from 'lucide-react';
import Image from 'next/image';

export const metadata: Metadata = {
  title: 'Dashboard Overview - Tricion Studio',
  description: 'Welcome to your Tricion Studio dashboard.',
};

const quickLinks = [
  { href: '/dashboard/generate', label: 'Create New Melody', icon: Sparkles, description: 'Use AI to generate unique melodies.' },
  { href: '/dashboard/library', label: 'Browse Library', icon: Library, description: 'Explore your saved melodies.' },
  { href: '/dashboard/vocal-generation', label: 'Generate Vocals', icon: Sparkles, description: 'Use AI to generate vocals' },
  { href: '/dashboard/profile', label: 'Update Profile', icon: User, description: 'Manage your account details.' },
  { href: '/dashboard/subscription', label: 'Manage Subscription', icon: CreditCard, description: 'View your current plan and billing.' },
];

export default function DashboardOverviewPage() {
  return (
    <div className="space-y-8">
      <Card className="shadow-lg border-accent/50">
        <CardHeader className="pb-4">
          <CardTitle className="text-3xl font-bold text-primary">Welcome to Tricion Studio!</CardTitle>
          <CardDescription className="text-lg text-muted-foreground">
            This is your creative hub. Generate, explore, and manage your musical creations.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col md:flex-row items-center gap-6">
          <div className="flex-1">
            <p className="mb-6 text-foreground/90">
              Ready to compose your next masterpiece? Jump right into the AI Melody Generator or explore your existing library. 
              Your profile and subscription settings are also just a click away.
            </p>
            <Button size="lg" asChild className="bg-accent hover:bg-accent/90 text-accent-foreground">
              <Link href="/dashboard/generate">
                <Sparkles className="mr-2 h-5 w-5" />
                Generate Melody
              </Link>
            </Button>
          </div>
          <div className="flex-shrink-0">
             <Image 
              src="https://picsum.photos/300/200?music" 
              alt="Musical inspiration" 
              width={300} 
              height={200} 
              className="rounded-lg shadow-md object-cover"
              data-ai-hint="music studio"
            />
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {quickLinks.map(link => (
          <Card key={link.href} className="hover:shadow-xl transition-shadow duration-300">
            <CardHeader>
              <div className="flex items-center gap-3 mb-2">
                <link.icon className="h-8 w-8 text-accent" />
                <CardTitle className="text-xl text-primary">{link.label}</CardTitle>
              </div>
              <CardDescription className="text-muted-foreground">{link.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="outline" asChild className="w-full">
                <Link href={link.href}>Go to {link.label.split(' ')[0]}</Link>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Placeholder for recent activity or stats */}
      <Card>
        <CardHeader>
          <CardTitle className="text-xl text-primary">Recent Activity</CardTitle>
          <CardDescription className="text-muted-foreground">What you've been up to lately.</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-center text-muted-foreground py-8">No recent activity to display yet. Start creating!</p>
        </CardContent>
      </Card>
    </div>
  );
}
