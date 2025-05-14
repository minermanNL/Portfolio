"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { CheckCircle, ArrowRight } from "lucide-react";
import { useAuthSession } from "@/hooks/useAuthSession";
import { useEffect, useState } from "react";
import { useToast } from "@/components/ui/use-toast";

export default function PricingPage() {
  const { user, isLoading: isUserLoading } = useAuthSession();
  const router = useRouter();
  const { toast } = useToast();

  const [isRedirecting, setIsRedirecting] = useState(false);

  useEffect(() => {
    if (!user && !isUserLoading) {
      // Redirect to login if not authenticated and not loading
      // The login page should then handle the plan parameter if needed
      // router.push('/login'); // Decide how to handle plan parameter on login page
    }
  }, [user, isUserLoading, router]);

  const handleCheckout = async (priceId: string) => {
    if (!user) {
        toast({
            title: "Authentication required",
            description: "Please log in to subscribe to a plan.",
            variant: "destructive",
        });
        // Optionally redirect to login
        // router.push(\`/login?plan=\${priceId}\`);
        return;
    }

    setIsRedirecting(true);
    try {
      const response = await fetch('/api/create-stripe-checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ priceId }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create Stripe checkout session');
      }

      if (data.checkoutUrl) {
        // Redirect to Stripe checkout page
        window.location.href = data.checkoutUrl;
      } else {
         throw new Error('Invalid response from server: No checkout URL provided.');
      }

    } catch (error: any) {
      console.error('Checkout error:', error);
      toast({
        title: "Checkout Failed",
        description: error.message || "Could not initiate checkout process.",
        variant: "destructive",
      });
    } finally {
      setIsRedirecting(false);
    }
  };

  return (
    <div className="min-h-screen font-sans">
      {/* Navigation Bar - Assuming you have a standard Navbar, or reuse from HomePage */}
      <nav className="sticky top-0 left-0 right-0 z-50 bg-surface/60 backdrop-blur-lg border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-8">
              <Link href="/" className="flex items-center">
                <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary px-2 py-1 rounded-md">
                  Tricion Studio
                </span>
              </Link>
              <div className="hidden md:flex items-center gap-6">
                <Link href="/#learn-more" className="text-gray-300 hover:text-white transition-colors text-sm">Learn More</Link>
                <Link href="/dashboard/generate" className="text-gray-300 hover:text-white transition-colors text-sm">Generator</Link>
                <Link href="/#vocal-gen" className="text-gray-300 hover:text-secondary transition-colors text-sm">Vocal Gen</Link>
                <Link href="/pricing" className="text-gray-300 hover:text-white transition-colors text-sm">Pricing</Link>
              </div></div>
            {/* Authentication buttons or status can be added here */}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="pt-24 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Pricing Section */}
          <section id="pricing" className="mb-24">
            <div className="text-center mb-16">
                <h1 className="text-4xl font-bold tracking-tight sm:text-5xl mb-4">
                    <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary">
                    Pricing Plans
                    </span>
                </h1>
                <p className="text-lg text-gray-300 max-w-2xl mx-auto">
                    Choose the perfect plan to unlock your musical creativity. Get started for free or upgrade for more power.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto" >
              {/* Free Plan */}
              <div className="feature-card glass-effect rounded-xl p-8 flex flex-col">
                <div className="flex-grow">
                    <h3 className="text-2xl font-bold text-white">Free</h3>
                    <p className="text-gray-300 mt-1 text-sm mb-6">For a taste of creation</p>
                    <div className="text-4xl font-bold text-white mb-1">$0<span className="text-lg font-normal text-gray-400">/month</span></div>
                    <ul className="space-y-3 my-8 text-sm">
                    <li className="flex items-center gap-2 text-gray-300">
                        <CheckCircle className="h-4 w-4 text-secondary" />
                        <span>10 monthly generations</span>
                    </li>
                    <li className="flex items-center gap-2 text-gray-300">
                        <CheckCircle className="h-4 w-4 text-secondary" />
                        <span>50 max melody storage</span>
                    </li>
                    <li className="flex items-center gap-2 text-gray-300">
                        <CheckCircle className="h-4 w-4 text-secondary" />
                        <span>1 concurrent generation</span>
                    </li>
                    <li className="flex items-center gap-2 text-gray-300">
                        <CheckCircle className="h-4 w-4 text-secondary" />
                        <span>1 max API key</span>
                    </li>
                    <li className="flex items-center gap-2 text-gray-300 opacity-50">
                        <CheckCircle className="h-4 w-4 text-gray-600" />
                        <span>Advanced features</span>
                    </li>
                    <li className="flex items-center gap-2 text-gray-300 opacity-50">
                        <CheckCircle className="h-4 w-4 text-gray-600" />
                        <span>API access</span>
                    </li>
                    </ul>
                </div>
                <Button variant="outline" className="w-full border-primary text-white rounded-full font-semibold hover:bg-primary/10 transition-all btn-hover mt-auto" asChild>
                    <Link href="/signup?plan=free">Get Started Free</Link>
                  </Button>
              </div>

              {/* Basic Plan */}
              <div className="feature-card glass-effect rounded-xl p-8 flex flex-col border-2 border-secondary/50 relative">
                <div className="absolute top-0 -translate-y-1/2 left-1/2 -translate-x-1/2">
                    <div className="bg-secondary text-black px-4 py-1 rounded-full text-sm font-semibold shadow-lg">
                        Most Popular
                    </div>
                </div>
                <div className="flex-grow">
                    <h3 className="text-2xl font-bold text-white">Basic</h3>
                    <p className="text-gray-300 mt-1 text-sm mb-6">Perfect for getting started</p>
                    <div className="text-4xl font-bold text-white mb-1">$50<span className="text-lg font-normal text-gray-400">/month</span></div>
                    <Link href="#" className="text-xs text-secondary hover:underline block mb-6">Or $500 annually (Save $100)</Link>
                    <ul className="space-y-3 mb-8 text-sm">
                    <li className="flex items-center gap-2 text-gray-300">
                        <CheckCircle className="h-4 w-4 text-secondary" />
                        <span>100 monthly generations</span>
                    </li>
                    <li className="flex items-center gap-2 text-gray-300">
                        <CheckCircle className="h-4 w-4 text-secondary" />
                        <span>500 max melody storage</span>
                    </li>
                    <li className="flex items-center gap-2 text-gray-300">
                        <CheckCircle className="h-4 w-4 text-secondary" />
                        <span>2 concurrent generations</span>
                    </li>
                    <li className="flex items-center gap-2 text-gray-300">
                        <CheckCircle className="h-4 w-4 text-secondary" />
                        <span>5 max API keys</span>
                    </li>
                    <li className="flex items-center gap-2 text-gray-300">
                        <CheckCircle className="h-4 w-4 text-secondary" />
                        <span>Advanced features</span>
                    </li>
                    <li className="flex items-center gap-2 text-gray-300 opacity-50">
                        <CheckCircle className="h-4 w-4 text-gray-600" />
                        <span>API access</span>
                    </li>
                    </ul>
                </div>
                <div className="flex flex-col gap-3 mt-auto">
                  <Button
                    className="w-full bg-secondary text-black rounded-full font-semibold hover:bg-opacity-90 transition-all btn-hover"
                    onClick={() => handleCheckout('price_basic_monthly')}
                    disabled={isRedirecting || isUserLoading}
                  >
                    {isRedirecting ? 'Redirecting...' : 'Choose Basic Monthly'}
                  </Button>
                  <Button
                    variant="outline" className="w-full border-secondary text-white rounded-full font-semibold hover:bg-secondary/10 transition-all relative group btn-hover"
                    onClick={() => handleCheckout('price_basic_annual')}
                    disabled={isRedirecting || isUserLoading}
                  >
                    {isRedirecting ? 'Redirecting...' : 'Choose Basic Annual'}
                    <span className="absolute -top-2 right-2 text-xs bg-primary text-white px-2 py-0.5 rounded-full group-hover:scale-110 transition-transform">Save $100</span>
                  </Button>
                </div>
              </div>

              {/* Pro Plan */}
              <div className="feature-card glass-effect rounded-xl p-8 flex flex-col">
                 <div className="flex-grow">
                    <h3 className="text-2xl font-bold text-white">Pro</h3>
                    <p className="text-gray-300 mt-1 text-sm mb-6">For serious producers</p>
                    <div className="text-4xl font-bold text-white mb-1">$100<span className="text-lg font-normal text-gray-400">/month</span></div>
                     <Link href="#" className="text-xs text-secondary hover:underline block mb-2">Or $1000 annually (Save $200)</Link>
                    <div className="text-xs font-semibold text-primary bg-primary/10 px-2 py-1 rounded-full inline-block mb-6">Includes a 7-day free trial!</div>
                    <ul className="space-y-3 mb-8 text-sm">
                    <li className="flex items-center gap-2 text-gray-300">
                        <CheckCircle className="h-4 w-4 text-secondary" />
                        <span>1000 monthly generations</span>
                    </li>
                    <li className="flex items-center gap-2 text-gray-300">
                        <CheckCircle className="h-4 w-4 text-secondary" />
                        <span>5000 max melody storage</span>
                    </li>
                    <li className="flex items-center gap-2 text-gray-300">
                        <CheckCircle className="h-4 w-4 text-secondary" />
                        <span>5 concurrent generations</span>
                    </li>
                    <li className="flex items-center gap-2 text-gray-300">
                        <CheckCircle className="h-4 w-4 text-secondary" />
                        <span>20 max API keys</span>
                    </li>
                    <li className="flex items-center gap-2 text-gray-300">
                        <CheckCircle className="h-4 w-4 text-secondary" />
                        <span>Advanced features</span>
                    </li>
                    <li className="flex items-center gap-2 text-gray-300">
                        <CheckCircle className="h-4 w-4 text-secondary" />
                        <span>API access</span>
                    </li>
                     <li className="flex items-center gap-2 text-gray-300">
                        <CheckCircle className="h-4 w-4 text-secondary" />
                        <span>Priority Support</span>
                    </li>
                    </ul>
                </div>
                <div className="flex flex-col gap-3 mt-auto">
                  <Button
                    className="w-full bg-gradient-to-r from-primary to-secondary text-white rounded-full font-semibold hover:opacity-90 transition-all btn-hover"
                     onClick={() => handleCheckout('price_pro_monthly')}
                     disabled={isRedirecting || isUserLoading}
                     >
                    {isRedirecting ? 'Redirecting...' : 'Choose Pro Monthly'}
                  </Button>
                  <Button
                    variant="outline" className="w-full border-primary text-white rounded-full font-semibold hover:bg-primary/10 transition-all relative group btn-hover"
                     onClick={() => handleCheckout('price_pro_annual')}
                     disabled={isRedirecting || isUserLoading}
                     >
                    {isRedirecting ? 'Redirecting...' : 'Choose Pro Annual'}
                    <span className="absolute -top-2 right-2 text-xs bg-secondary text-black px-2 py-0.5 rounded-full group-hover:scale-110 transition-transform">Save $200</span>
                  </Button>
                </div>
              </div>
            </div>
          </section>
        </div>
      </main>

      {/* Footer - Assuming you have a standard Footer, or reuse from HomePage */}
      <footer className="bg-surface/80 backdrop-blur-sm border-t border-gray-800 mt-16">
        <div className="max-w-7xl mx-auto px-6 py-12 text-center">
          <p className="text-sm text-gray-400">&copy; {new Date().getFullYear()} Tricion MIDI Studio. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
