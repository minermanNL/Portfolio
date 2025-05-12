import { Button } from "@/components/ui/button";
import { Logo } from "@/components/shared/Logo";
import Link from "next/link";
import Image from "next/image";

export default function HomePage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-background to-secondary/30 p-4 text-center">
      <header className="absolute top-0 left-0 right-0 p-6 flex justify-between items-center">
        <Logo textSize="text-3xl" />
        <nav className="space-x-4">
          <Button variant="ghost" asChild>
            <Link href="/login">Log In</Link>
          </Button>
          <Button variant="default" asChild>
            <Link href="/signup">Sign Up</Link>
          </Button>
        </nav>
      </header>

      <main className="flex flex-col items-center mt-16">
        <Image 
          src="https://picsum.photos/800/400?grayscale" 
          alt="Abstract musical waves" 
          width={800} 
          height={400} 
          className="rounded-lg shadow-2xl mb-12 object-cover"
          data-ai-hint="music abstract"
          priority
        />
        <h1 className="text-5xl md:text-6xl font-extrabold text-primary mb-6">
          Welcome to Tricion Studio
        </h1>
        <p className="text-xl md:text-2xl text-foreground/80 mb-10 max-w-2xl">
          Unlock your musical creativity with AI-powered melody and vocal generation.
          Craft unique tunes effortlessly.
        </p>
        <div className="space-x-6">
          <Button size="lg" asChild className="bg-accent hover:bg-accent/90 text-accent-foreground px-10 py-6 text-lg">
            <Link href="/signup">Get Started Free</Link>
          </Button>
          <Button size="lg" variant="outline" asChild className="px-10 py-6 text-lg border-primary/50 text-primary hover:bg-primary/5 hover:text-primary">
            <Link href="/dashboard/generate">Try Generator</Link>
          </Button>
        </div>
      </main>

      <footer className="absolute bottom-0 left-0 right-0 p-6 text-center text-sm text-muted-foreground">
        © {new Date().getFullYear()} Tricion Studio. All rights reserved.
      </footer>
    </div>
  );
}
