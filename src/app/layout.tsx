import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import { AuthSessionProvider } from '@/components/auth/AuthSessionProvider';
import { cn } from '@/lib/utils';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'Tricion Studio',
  description: 'AI-Powered MIDI and Vocal Generation',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      {/* Ensure no whitespace or comments are between <html> and <body> */}
      <body 
        className={cn(
          geistSans.variable, 
          geistMono.variable, 
          "antialiased font-sans",
          "bg-background text-foreground"
        )}
      >
        <AuthSessionProvider>
          {children}
          <Toaster />
 {/* Footer - Assuming you have a standard Footer, or reuse from HomePage */}
      <footer className="bg-surface/80 backdrop-blur-sm border-t border-gray-800">
 <div className="max-w-7xl mx-auto px-6 py-12 text-center">
 <p className="text-sm text-gray-400">&copy; {new Date().getFullYear()} Tricion MIDI Studio. All rights reserved.</p>
 </div>
      </footer>
        </AuthSessionProvider>
      </body>
    </html>
  );
}
