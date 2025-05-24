import Link from 'next/link';
import { Button } from "@/components/ui/button";
import {
  ArrowRight,
  Library,
  LogOut,
  Music,
} from "lucide-react";

// AuthButtons component for user authentication status
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

const FAQPage = () => {
  const faqs = [
    {
      category: 'General',
      questions: [
        {
          q: 'What is Tricion Studio?',
          a: 'Tricion Studio is an innovative web-based platform leveraging AI to generate unique melodies, streamline music production, and manage your creative projects. Built with modern web technologies like React and TypeScript, it offers a user-friendly interface for musicians and creators.',
        },
        {
          q: 'Who can use Tricion Studio?',
          a: 'Tricion Studio is designed for musicians, producers, songwriters, and content creators of all skill levels, from beginners to professionals, who want to explore AI-assisted music creation.',
        },
      ],
    },
    {
      category: 'AI Melody Generation',
      questions: [
        {
          q: 'How does the AI melody generation work?',
          a: 'Input text-based prompts specifying genre, mood, instruments, or creative descriptions (e.g., "jazzy piano with an upbeat vibe"). Our AI processes these asynchronously, generating unique melodies in the background, with notifications sent upon completion.',
        },
        {
          q: 'What types of inputs are supported?',
          a: 'You can specify genres (e.g., "electronic," "classical"), moods (e.g., "calm," "epic"), tempo, key, or descriptive phrases to guide the AI in crafting your melody.',
        },
        {
          q: 'What formats are available for generated melodies?',
          a: 'Currently, melodies are output as MIDI files, with plans to support additional formats like audio files and vocal generation in the future.',
        },
        {
          q: 'How long does melody generation take?',
          a: 'Generation time depends on input complexity and system load. Our asynchronous process allows you to continue working while the AI generates, with status tracking available in your dashboard.',
        },
      ],
    },
    {
      category: 'Melody Library',
      questions: [
        {
          q: 'Can I save my generated melodies?',
          a: 'Yes, all generated melodies can be stored in your personal Melody Library, accessible via your account dashboard.',
        },
        {
          q: 'Can I organize and search my melodies?',
          a: 'Absolutely, the Melody Library offers robust search and filtering tools to help you manage and locate your saved creations efficiently.',
        },
      ],
    },
    {
      category: 'Account & Profile',
      questions: [
        {
          q: 'How do I sign up for Tricion Studio?',
          a: 'Sign up using our secure registration form, powered by Supabase for reliable and safe authentication.',
        },
        {
          q: 'Can I customize my profile?',
          a: 'Yes, you can update your personal details, preferences, and settings directly from your account dashboard.',
        },
      ],
    },
    {
      category: 'Subscriptions & Billing',
      questions: [
        {
          q: 'What subscription plans are available?',
          a: 'We offer multiple tiers (e.g., Basic, Pro) with varying limits on melody generations, storage, and access to advanced features. Visit our Pricing page for details.',
        },
        {
          q: 'How is billing handled?',
          a: 'Billing is processed securely via Stripe, a trusted payment platform, ensuring safe and reliable transactions.',
        },
        {
          q: 'How can I manage my subscription?',
          a: 'Manage your subscription (view status, upgrade, downgrade, or cancel) through the account dashboard, which integrates with Stripe’s secure customer portal.',
        },
        {
          q: 'What happens if I exceed my generation limits?',
          a: 'If you hit your plan’s limit, you can wait for the next billing cycle or upgrade to a higher tier for additional generations.',
        },
      ],
    },
    {
      category: 'Technical',
      questions: [
        {
          q: 'What do I need to run Tricion Studio?',
          a: 'Just a modern web browser and an internet connection—no additional software is required.',
        },
        {
          q: 'Is my data secure?',
          a: 'Yes, we prioritize security using Supabase for backend services and Stripe for payment processing, ensuring robust protection for your data.',
        },
      ],
    },
  ];

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
                <Link href="/learn-more" className="text-gray-300 hover:text-white text-sm">
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

      {/* Main Content */}
      <main className="pt-24 pb-16 flex-grow flex flex-col justify-center">
        <div className="sm:mx-auto sm:w-full sm:max-w-3xl">
          {/* Content Area with Background */}
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

            {/* Content */}
            <div className="relative z-10">
              <h1 className="text-3xl font-bold text-center text-white mb-12 md:text-4xl">
                Tricion Studio FAQ | Your Questions Answered
              </h1>

              <div className="space-y-10">
                {faqs.map((categoryItem) => (
                  <section key={categoryItem.category}>
                    <h2 className="text-2xl font-semibold text-purple-400 mb-6 pb-2 border-b border-gray-700">
                      {categoryItem.category}
                    </h2>
                    <div className="space-y-6">
                      {categoryItem.questions.map((faqItem) => (
                        <div key={faqItem.q}>
                          <h3 className="text-xl font-medium text-white mb-2">{faqItem.q}</h3>
                          <p className="text-gray-400 text-lg leading-relaxed">{faqItem.a}</p>
                        </div>
                      ))}
                    </div>
                  </section>
                ))}
              </div>

              <div className="mt-16 text-center">
                <Link href="/" className="text-purple-400 hover:text-white font-semibold text-lg transition-colors">
                  ← Back to Home
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default FAQPage;
