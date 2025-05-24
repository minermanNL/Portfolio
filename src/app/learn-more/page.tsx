import Link from 'next/link';
import { Button } from "@/components/ui/button";
import {
  ArrowRight,
  Library,
  LogOut,
  Music,
  Bot,
  FastForward,
} from "lucide-react";

// AuthButtons component (copied from page.tsx)
const AuthButtons = () => {
  const isLoggedIn = false; // Replace with actual auth check
  const userEmail = "user@example.com"; // Replace with actual user email

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


const LearnMorePage = () => {
  return (
    <div className="min-h-screen font-sans bg-gray-900 text-gray-300">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-gray-900/60 backdrop-blur-lg border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-8">
              <Link href="/" className="flex items-center">
                <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500 px-2 py-1 rounded-md">
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
                <Link href="/dashboard/vocal-generation" className="text-gray-300 hover:text-purple-400 text-sm">
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

      {/* Main Content - Adjusted padding to account for fixed header */}
      <main className="pt-24 pb-16 flex-grow flex flex-col justify-center">
        <div className="sm:mx-auto sm:w-full sm:max-w-5xl">
          {/* Main Content Area with Background */}
          <div className="relative overflow-hidden rounded-2xl py-8 px-6 sm:px-12 sm:py-12">

            {/* Background Gradients */}
            <div className="absolute inset-0 rounded-2xl z-0">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 via-purple-500/10 to-pink-500/20 rounded-2xl"></div>
              <div
                className="absolute inset-0 rounded-2xl"
                style={{
                  background:
                    'radial-gradient(circle at 20% 20%, hsla(220, 100%, 50%, 0.2) 0%, transparent 40%), radial-gradient(circle at 80% 80%, hsla(280, 100%, 50%, 0.2) 0%, transparent 40%), radial-gradient(circle at 50% 50%, hsla(220, 100%, 50%, 0.1) 0%, hsla(280, 100%, 50%, 0.05) 50%, transparent 100%)',
                }}
              ></div>
            </div>

            {/* Content layered above background */}
            <div className="relative z-10">
              <h1 className="text-4xl font-bold text-center text-white mb-6 md:text-5xl">
                Revolutionize Your Music Production
              </h1>
              <p className="text-center text-lg text-gray-400 mb-12 max-w-2xl mx-auto">
                Tricion MIDI Studio combines cutting-edge AI technology with professional music production
                tools to help you create stunning melodies effortlessly.
              </p>

              <div className="grid md:grid-cols-3 gap-8 mb-12">
                {/* Feature Cards */}
                <FeatureCard
                  title="Advanced AI Models"
                  description="Powered by state-of-the-art language models from industry leaders, ensuring high-quality and musically coherent MIDI generation."
                  icon="🧠" // Placeholder icon
                />
                <FeatureCard
                  title="Real-time Preview"
                  description="Instantly preview generated melodies with high-quality virtual instruments. Fine-tune and adjust in real-time."
                  icon="🎧" // Placeholder icon
                />
                <FeatureCard
                  title="Cloud Library"
                  description="Store and organize your generated melodies in the cloud. Access your library from anywhere, anytime."
                  icon="☁️" // Placeholder icon
                />
                <FeatureCard
                  title="Style Presets"
                  description="Choose from a variety of musical styles and genres. Create custom presets to match your unique sound."
                  icon="🎶" // Placeholder icon
                />
                <FeatureCard
                  title="Professional Tools"
                  description="Advanced features including batch processing, API access, and custom model training for enterprise users."
                  icon="🛠️" // Placeholder icon
                />
              </div>

              <div className="text-center">
                <h2 className="text-3xl font-bold text-white mb-6">
                  Ready to Transform Your Music Production?
                </h2>
                {/* You can add a call to action button here if needed */}
                {/* <Link href="/signup" className="bg-primary hover:bg-primary/90 text-white font-bold py-3 px-8 rounded-lg text-lg transition-colors">
                  Get Started
                </Link> */}
              </div>

              <div className="mt-16 text-center">
                <Link href="/" className="text-purple-400 hover:text-white font-semibold text-lg transition-colors">
                  &larr; Back to Home
                </Link>
              </div>
            </div>

          </div>
        </div>
      </main>
    </div>
  );
};

// Helper component for feature cards (optional, or integrate directly)
const FeatureCard = ({ title, description, icon }: { title: string, description: string, icon: string }) => {
  return (
    <div className="bg-gray-800/60 p-6 rounded-lg shadow-lg hover:shadow-purple-500/50 transition-shadow duration-300">
      <div className="flex items-center mb-4 border-b border-gray-700 pb-4">
        <span className="text-3xl mr-3">{icon}</span>
        <h3 className="text-xl font-semibold text-white">{title}</h3>
      </div>
      <p className="text-gray-400 text-sm">
        {description}
      </p>
    </div>
  );
}

export default LearnMorePage;
