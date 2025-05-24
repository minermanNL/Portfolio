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
        // ... (existing logged-in JSX) ...
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


const AboutUsPage = () => {
  return (
    // Main container div
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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="sm:mx-auto sm:w-full sm:max-w-3xl">
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
                <h1 className="text-3xl font-bold text-center text-white mb-10 md:text-4xl">
                  About Tricion Studio: Your Ideas, Amplified.
                </h1>

                <div className="space-y-10 text-lg leading-relaxed">
                  <section>
                    <h2 className="text-2xl font-semibold text-purple-400 mb-4">Our Mission: Unlocking Your Creative Potential</h2>
                    <p>
                      At Tricion Studio, we believe that musical expression is for everyone. Our goal is to help you overcome creative hurdles and bring your unique musical ideas to life, whether you're a seasoned producer or just starting out. We're passionate about how technology can enhance artistry, and we've crafted Tricion Studio to be an intuitive and powerful partner in your musical journey.
                    </p>
                  </section>

                  <section>
                    <h2 className="text-2xl font-semibold text-purple-400 mb-4">What is Tricion Studio?</h2>
                    <p>
                      Tricion Studio is a forward-thinking platform designed to make music creation more accessible and inspiring. Using advanced artificial intelligence, we provide tools that can spark new ideas, assist in the songwriting process, and help you work more efficiently. From generating fresh melodies to managing your projects, Tricion Studio offers a supportive and integrated experience for all creators.
                    </p>
                  </section>

                  <section>
                    <h2 className="text-2xl font-semibold text-purple-400 mb-4">Why We Built Tricion Studio: From a Creator's Perspective</h2>
                    <p>
                      As musicians and developers ourselves, we understand the challenges every creator faces: the blank page, the elusive spark, the pressure to produce. Tricion Studio was born from a desire to solve these common pain points. I've personally experienced the grind of music production, the hours spent searching for the right sound, and the need to quickly capture fleeting moments of inspiration. This platform is built to be the helpful co-creator that makes that process smoother, faster, and more enjoyable, helping you turn ideas into finished tracks without losing momentum.
                    </p>
                  </section>

                  <section>
                    <h2 className="text-2xl font-semibold text-purple-400 mb-4">Our Vision for the Future</h2>
                    <p>
                      We are continuously innovating at the forefront of AI music technology. Our vision is to foster an evolving ecosystem where creators can effortlessly bring their imagination to life. We aim to build a platform that is not only technically advanced and professional but also inspiring and easy to use for anyone with a passion for music.
                    </p>
                  </section>

                  <p className="mt-16 text-center text-xl text-white font-medium">
                    Join the Tricion Studio community, and let's shape the future of music creation together.
                  </p>
                </div>

                <div className="mt-12 text-center">
                  <div className="flex flex-col sm:flex-row justify-center gap-6">
                    <Link href="/" className="text-purple-400 hover:text-white font-semibold text-lg transition-colors">
                      ← Back to Home
                    </Link>
                    <Button variant="outline" asChild>
                      <Link href="/contact">Contact Us</Link>
                    </Button>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AboutUsPage;