import { Logo } from '@/components/shared/Logo';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-background to-secondary/30 p-4">
      {/* Add Cloudflare Turnstile Script */}
      <script src="https://challenges.cloudflare.com/turnstile/v0/api.js" async defer></script>
      
      <div className="mb-8">
        <Logo iconSize={32} textSize="text-3xl" />
      </div>
      <div className="w-full max-w-md">
        {children}
      </div>
    </div>
  );
}
