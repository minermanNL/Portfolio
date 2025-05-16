'use client';

import { Button } from "@/components/ui/button";
import { Logo } from "@/components/shared/Logo";
import Link from "next/link";
import {
  ArrowRight,
  Library,
  LogOut,
  Music,
  Bot,
  FastForward,
} from "lucide-react";

const AuthButtons = () => {
  const isLoggedIn = false;
  const userEmail = "user@example.com";

  return (
    <div className="flex items-center gap-4">
      {isLoggedIn ? (
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="sm"
            className="hidden md:flex items-center gap-2 text-gray-300 border-gray-700 hover:bg-gray-800 hover:text-white"
            asChild
          >
            <Link href="/dashboard/library">
              <Library className="h-4 w-4" />
              <span>Library</span>
            </Link>
          </Button>
          <span
            className="text-sm text-gray-300 hidden lg:block truncate max-w-[150px]"
            title={userEmail}
          >
            {userEmail}
          </span>
          <Button
            variant="destructive"
            size="sm"
            className="flex items-center gap-1 bg-red-600/20 border border-red-500/30 text-red-400 rounded-lg hover:bg-red-600/40 hover:text-red-300 transition-colors"
          >
            <LogOut className="h-4 w-4" />
            <span className="text-sm hidden sm:inline">Logout</span>
          </Button>
        </div>
      ) : (
        <Button
          variant="outline"
          className="flex items-center gap-2 text-gray-300 border-gray-700 hover:bg-gray-800 hover:text-white"
          asChild
        >
          <Link href="/login">
            <ArrowRight className="h-4 w-4" />
            <span>Login / Register</span>
          </Link>
        </Button>
      )}
    </div>
  );
};

export default function HomePage() {
  return (
    <div className="min-h-screen font-sans">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-surface/60 backdrop-blur-lg border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-8">
              <Link href="/" className="flex items-center">
                <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary px-2 py-1 rounded-md">
                  Tricion Studio
                </span>
              </Link>
              <div className="hidden md:flex items-center gap-6">
                <Link href="learn-more" className="text-gray-300 hover:text-white text-sm">
                  Learn More
                </Link>
                <Link href="/dashboard/generate" className="text-gray-300 hover:text-white text-sm">
                  Generator
                </Link>
                <Link href="/vocal-gen" className="text-gray-300 hover:text-secondary text-sm">
                  Vocal Gen
                </Link>
                <Link href="/pricing" className="text-gray-300 hover:text-white text-sm">
                  Pricing
                </Link>
                <Link href="/about" className="text-gray-300 hover:text-white text-sm">
                  About Us
                </Link>
                <Link href="/faq" className="text-gray-300 hover:text-white text-sm">
                  FAQ
                </Link>
              </div>
            </div>
            <AuthButtons />
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="pt-24 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <header className="relative overflow-hidden py-16 sm:py-24 rounded-3xl mb-24">
            <div className="absolute inset-0 rounded-3xl z-0">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-primary/10 to-secondary/20 rounded-3xl" />
              <div
                className="absolute inset-0 rounded-3xl"
                style={{
                  background:
                    'radial-gradient(circle at 20% 20%, hsla(var(--primary) / 0.2) 0%, transparent 40%), radial-gradient(circle at 80% 80%, hsla(var(--secondary) / 0.2) 0%, transparent 40%), radial-gradient(circle at 50% 50%, hsla(var(--primary) / 0.1) 0%, hsla(var(--secondary) / 0.05) 50%, transparent 100%)',
                }}
              />
            </div>

            <div className="relative z-10 mx-auto max-w-2xl text-center">
              <h1 className="text-4xl font-bold tracking-tight sm:text-6xl">
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary">
                  Tricion MIDI Studio
                </span>
              </h1>
              <h2 className="mt-2 text-2xl sm:text-3xl text-white opacity-90">
                Beat Block Is No More
              </h2>
              <p className="mt-6 text-lg leading-8 text-gray-300">
                Create professional-quality MIDI melodies instantly with our AI-powered studio. Perfect for producers, composers, and music enthusiasts who want to overcome creative blocks.
              </p>
              <div className="mt-10 flex items-center justify-center gap-x-6">
                <Button
                  size="lg"
                  className="rounded-full bg-secondary px-8 py-3 text-base font-semibold text-black shadow-sm hover:bg-opacity-90 transition-all"
                  asChild
                >
                  <Link href="/pricing?plan=basic-monthly">Start Creating</Link>
                </Button>
                <Link
                  href="/learn-more"
                  className="text-base font-semibold leading-6 text-white hover:text-secondary transition-all group flex items-center"
                >
                  Learn more <ArrowRight className="ml-1 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </div>
          </header>

          {/* Features Section */}
          <section id="/learn-more" className="mb-24">
            <h2 className="text-3xl font-bold text-center text-white mb-12">Key Features</h2>
            <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
              <div className="rounded-xl p-6" style={{ background: 'linear-gradient(135deg, hsla(var(--primary) / 0.1), hsla(var(--primary) / 0.05))' }}>
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/20">
                  <Bot className="h-6 w-6 text-secondary" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">AI-Powered Generation</h3>
                <p className="text-gray-300 text-sm">
                  Create original melodies in seconds using advanced AI models. Perfect for inspiration or complete compositions.
                </p>
              </div>

              <div className="rounded-xl p-6" style={{ background: 'linear-gradient(135deg, hsla(var(--primary) / 0.05), hsla(var(--secondary) / 0.1))' }}>
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br from-primary/20 to-secondary/20">
                  <FastForward className="h-6 w-6 text-secondary" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">Real-time Preview</h3>
                <p className="text-gray-300 text-sm">
                  Instantly preview and fine-tune your generated melodies with our built-in playback system.
                </p>
              </div>

              <div className="rounded-xl p-6" style={{ background: 'linear-gradient(135deg, hsla(var(--secondary) / 0.05), hsla(var(--primary) / 0.05))' }}>
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br from-secondary/20 to-primary/20">
                  <Music className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">Vocal Generation</h3>
                <p className="text-gray-300 text-sm">
                  Convert your MIDI melodies into sung vocals using advanced AI models.
                </p>
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
