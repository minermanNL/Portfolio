import { Button } from "@/components/ui/button";
import { Logo } from "@/components/shared/Logo"; // Assuming you have a Logo component
import Link from "next/link";
import { ArrowRight, Library, LogOut, Settings, Music, Bot, Blocks, FastForward, CheckCircle, ArrowForward, Zap, ShoppingCart, Mail, Code } from "lucide-react"; // Using Lucide icons
import { cn } from "@/lib/utils"; // For conditional classes

// Placeholder Auth Buttons (Replace with your actual auth logic/components)
const AuthButtons = () => {
  const isLoggedIn = false; // Replace with actual auth state
  const userEmail = "user@example.com"; // Replace with actual user email

  return (
    <div className="flex items-center gap-4">
      {isLoggedIn ? (
        <div className="flex items-center gap-4">
          <Button 
            variant="outline"
            size="sm"
            className="hidden md:flex items-center gap-2 text-gray-300 border-gray-700 hover:bg-gray-800 hover:text-white btn-hover"
            asChild
          >
            <Link href="/dashboard/library">
              <Library className="h-4 w-4" />
              <span>Library</span>
            </Link>
          </Button>
          <span className="text-sm text-gray-300 hidden lg:block truncate max-w-[150px]" title={userEmail}>
            {userEmail}
          </span>
          <Button 
            variant="destructive"
            size="sm"
            className="flex items-center gap-1 bg-red-600/20 border border-red-500/30 text-red-400 rounded-lg hover:bg-red-600/40 hover:text-red-300 transition-colors btn-hover"
            // onClick={handleLogout} // Add your logout handler
          >
            <LogOut className="h-4 w-4" />
            <span className="text-sm hidden sm:inline">Logout</span>
          </Button>
        </div>
      ) : (
        <Button 
          variant="outline"
          className="flex items-center gap-2 text-gray-300 border-gray-700 hover:bg-gray-800 hover:text-white btn-hover"
          asChild // Or use onClick to open a modal
        >
          <Link href="/login"> {/* Or link to modal trigger */} 
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
      {/* Navigation Bar */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-surface/60 backdrop-blur-lg border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-8">
              <Link href="/" className="flex items-center">
                 {/* Use your Logo component or text/gradient */}
                 <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary px-2 py-1 rounded-md">
                   Tricion Studio
                 </span>
              </Link>
              <div className="hidden md:flex items-center gap-6">
                <Link href="#learn-more" className="text-gray-300 hover:text-white transition-colors text-sm">Learn More</Link>
                <Link href="/dashboard/generate" className="text-gray-300 hover:text-white transition-colors text-sm">Generator</Link>
                <Link href="#vocal-gen" className="text-gray-300 hover:text-secondary transition-colors text-sm">Vocal Gen</Link> {/* Placeholder link */} 
                <Link href="#pricing" className="text-gray-300 hover:text-white transition-colors text-sm">Pricing</Link>
              </div>
            </div>
            <AuthButtons /> {/* Use the placeholder auth buttons */} 
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="pt-24 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Hero Section */}
          <header className="relative overflow-hidden py-16 sm:py-24 rounded-3xl mb-24">
            {/* Background Gradients */} 
            <div className="absolute inset-0 rounded-3xl z-0">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-primary/10 to-secondary/20 rounded-3xl"></div>
              <div className="absolute inset-0 rounded-3xl" style={{ background: 
                'radial-gradient(circle at 20% 20%, hsla(var(--primary) / 0.2) 0%, transparent 40%), radial-gradient(circle at 80% 80%, hsla(var(--secondary) / 0.2) 0%, transparent 40%), radial-gradient(circle at 50% 50%, hsla(var(--primary) / 0.1) 0%, hsla(var(--secondary) / 0.05) 50%, transparent 100%)' 
              }}></div>
            </div>
            
            <div className="relative z-10 mx-auto max-w-2xl text-center">
              <h1 className="text-4xl font-bold tracking-tight sm:text-6xl">
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary">
                  Tricion MIDI Studio
                </span>
              </h1>
               <h2 className="mt-2 text-2xl sm:text-3xl text-white opacity-90">Beat Block Is No More</h2>
              <p className="mt-6 text-lg leading-8 text-gray-300">
                Create professional-quality MIDI melodies instantly with our AI-powered studio. Perfect for producers, composers, and music enthusiasts who want to overcome creative blocks.
              </p>
              <div className="mt-10 flex items-center justify-center gap-x-6">
                <Button size="lg" className="rounded-full bg-secondary px-8 py-3 text-base font-semibold text-black shadow-sm hover:bg-opacity-90 transition-all btn-hover" asChild>
                  <Link href="/dashboard/generate">Start Creating</Link>
                </Button>
                <Link href="#learn-more" className="text-base font-semibold leading-6 text-white hover:text-secondary transition-all group flex items-center">
                  Learn more <ArrowRight className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-1" aria-hidden="true" />
                </Link>
              </div>
            </div>
          </header>

          {/* Feature Cards Section */} 
          <section id="learn-more" className="mb-24">
             <h2 className="text-3xl font-bold text-center text-white mb-12">Key Features</h2>
             <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {/* Feature Card 1 */}
              <div className="feature-card glass-effect rounded-xl p-6" style={{ background: 'linear-gradient(135deg, hsla(var(--primary) / 0.1), hsla(var(--primary) / 0.05))' }}>
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/20">
                  <Bot className="h-6 w-6 text-secondary" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">AI-Powered Generation</h3>
                <p className="text-gray-300 text-sm">
                  Create original melodies in seconds using advanced AI models. Perfect for inspiration or complete compositions.
                </p>
              </div>
              {/* Feature Card 2 */} 
              <div className="feature-card glass-effect rounded-xl p-6" style={{ background: 'linear-gradient(135deg, hsla(var(--secondary) / 0.1), hsla(var(--secondary) / 0.05))' }}>
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-secondary/20">
                  <Blocks className="h-6 w-6 text-secondary" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">DAW Integration</h3>
                <p className="text-gray-300 text-sm">
                  Seamlessly integrate with your favorite DAW as a VST plugin. Compatible with FL Studio, Ableton, Logic Pro, and more.
                </p>
              </div>
              {/* Feature Card 3 */} 
              <div className="feature-card glass-effect rounded-xl p-6" style={{ background: 'linear-gradient(135deg, hsla(var(--primary) / 0.05), hsla(var(--secondary) / 0.1))' }}>
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br from-primary/20 to-secondary/20">
                  <FastForward className="h-6 w-6 text-secondary" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">Real-time Preview</h3>
                <p className="text-gray-300 text-sm">
                  Instantly preview and fine-tune your generated melodies with our built-in playback system.
                </p>
              </div>
            </div>
          </section>

          {/* Pricing Section */} 
          <section id="pricing" className="mb-24">
            <h2 className="text-3xl font-bold text-center text-white mb-12">Choose Your Plan</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
              {/* Basic Plan */}
              <div className="feature-card glass-effect rounded-xl p-8">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h3 className="text-2xl font-bold text-white">Basic</h3>
                    <p className="text-gray-300 mt-1 text-sm">Perfect for getting started</p>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-secondary">$50</div>
                    <div className="text-sm text-gray-400">/month</div>
                    <Link href="#" className="text-xs text-secondary hover:underline mt-1 block">Save $100 annually</Link>
                  </div>
                </div>
                <ul className="space-y-3 mb-8 text-sm">
                  <li className="flex items-center gap-2 text-gray-300">
                    <CheckCircle className="h-4 w-4 text-secondary material-icons-check" />
                    <span>Unlimited MIDI Generation</span>
                  </li>
                  <li className="flex items-center gap-2 text-gray-300">
                    <CheckCircle className="h-4 w-4 text-secondary material-icons-check" />
                    <span>Basic DAW Integration</span>
                  </li>
                  <li className="flex items-center gap-2 text-gray-300">
                    <CheckCircle className="h-4 w-4 text-secondary material-icons-check" />
                    <span>Standard Support</span>
                  </li>
                </ul>
                <div className="flex flex-col gap-3">
                  <Button className="w-full bg-secondary text-black rounded-full font-semibold hover:bg-opacity-90 transition-all btn-hover" asChild>
                    <Link href="/signup?plan=basic-monthly">Start Monthly</Link>
                  </Button>
                  <Button variant="outline" className="w-full border-secondary text-white rounded-full font-semibold hover:bg-secondary/10 transition-all relative group btn-hover" asChild>
                    <Link href="/signup?plan=basic-annual">
                      <span>Start Annually</span>
                      <span className="absolute -top-2 right-2 text-xs bg-primary text-white px-2 py-0.5 rounded-full group-hover:scale-110 transition-transform">Save $100</span>
                     </Link>
                  </Button>
                </div>
              </div>

              {/* Pro Plan */} 
              <div className="feature-card glass-effect rounded-xl p-8 relative border-secondary/30">
                <div className="absolute top-4 right-4 bg-secondary/20 text-secondary px-3 py-1 rounded-full text-xs font-semibold badge-popular">
                  Most Popular
                </div>
                <div className="flex justify-between items-start mb-6 pt-8">
                  <div>
                    <h3 className="text-2xl font-bold text-white">Pro</h3>
                    <p className="text-gray-300 mt-1 text-sm">For serious producers</p>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-secondary">$100</div>
                    <div className="text-sm text-gray-400">/month</div>
                    <Link href="#" className="text-xs text-secondary hover:underline mt-1 block">Save $200 annually</Link>
                    <div className="text-xs font-semibold text-primary bg-primary/10 px-2 py-1 rounded-full inline-block mt-2">7-day free trial!</div>
                  </div>
                </div>
                <ul className="space-y-3 mb-8 text-sm">
                  <li className="flex items-center gap-2 text-gray-300">
                    <CheckCircle className="h-4 w-4 text-secondary material-icons-check" />
                    <span>Everything in Basic</span>
                  </li>
                  <li className="flex items-center gap-2 text-gray-300">
                    <CheckCircle className="h-4 w-4 text-secondary material-icons-check" />
                    <span>Advanced DAW Integration</span>
                  </li>
                  <li className="flex items-center gap-2 text-gray-300">
                    <CheckCircle className="h-4 w-4 text-secondary material-icons-check" />
                    <span>Priority Support</span>
                  </li>
                  <li className="flex items-center gap-2 text-gray-300">
                    <CheckCircle className="h-4 w-4 text-secondary material-icons-check" />
                    <span>Custom Style Training</span>
                  </li>
                </ul>
                <div className="flex flex-col gap-3">
                   <Button className="w-full bg-secondary text-black rounded-full font-semibold hover:bg-opacity-90 transition-all btn-hover" asChild>
                    <Link href="/signup?plan=pro-monthly">Start Monthly</Link>
                  </Button>
                  <Button variant="outline" className="w-full border-secondary text-white rounded-full font-semibold hover:bg-secondary/10 transition-all relative group btn-hover" asChild>
                    <Link href="/signup?plan=pro-annual">
                      <span>Start Annually</span>
                      <span className="absolute -top-2 right-2 text-xs bg-primary text-white px-2 py-0.5 rounded-full group-hover:scale-110 transition-transform">Save $200</span>
                     </Link>
                  </Button>
                </div>
              </div>
            </div>
          </section>

          {/* Latest Updates Section (Placeholder) */} 
          <section id="updates" className="mb-24">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-3xl font-bold text-white">Latest Updates</h2>
              <Link href="#" className="text-secondary hover:text-white transition-colors flex items-center gap-1 text-sm group">
                View All
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[1, 2, 3].map((item) => (
                <div key={item} className="glass-effect p-6 rounded-xl">
                  <div className="text-sm text-secondary mb-2">{item === 1 ? "March 15, 2024" : "Coming Soon"}</div>
                  <h3 className="text-xl font-semibold mb-3">{item === 1 ? "Version 0.1 Release" : item === 2 ? "Genre-Specific Models" : "Community Features"}</h3>
                  <p className="text-gray-300 text-sm mb-4">{item === 1 ? "Initial release with core features." : item === 2 ? "Models for EDM, Jazz, Classical." : "Share and collaborate on melodies."}</p>
                  <Link href="#" className="text-secondary hover:text-white transition-colors flex items-center gap-1 text-sm group">
                    Read More
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </Link>
                </div>
              ))}
            </div>
          </section>

          {/* Call to Action Section */} 
          <section id="cta" className="mb-16">
            <div className="text-center">
              <div className="glass-effect rounded-2xl p-8 relative overflow-hidden">
                 {/* Subtle background gradients */}
                 <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-secondary/10 z-0 rounded-2xl"></div>
                 <div className="absolute inset-0 rounded-2xl" style={{ background: 'radial-gradient(circle at 50% 0%, hsla(var(--primary) / 0.15) 0%, transparent 50%)' }}></div>
                
                 <div className="relative z-10">
                  <h2 className="text-2xl font-bold text-white mb-4">Ready to Create?</h2>
                  <p className="text-gray-300 mb-8 max-w-lg mx-auto">
                    Join thousands of musicians using Tricion Studio to enhance their creative workflow.
                  </p>
                  <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                    <Button size="lg" className="px-8 py-3 bg-secondary text-black rounded-full font-semibold hover:bg-opacity-90 transition-all btn-hover relative overflow-hidden group" asChild>
                       <Link href="/dashboard/generate">
                          <span className="relative z-10">Try it Now - Free</span>
                       </Link>
                    </Button>
                    <Button size="lg" variant="outline" className="px-8 py-3 border-secondary text-white rounded-full font-semibold hover:bg-secondary/10 transition-all relative overflow-hidden group btn-hover" disabled>
                      <span className="relative z-10">VST Plugin - Coming Soon!</span>
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-surface/80 backdrop-blur-sm border-t border-gray-800 mt-16">
        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            {/* Company Info */} 
            <div>
              <h3 className="text-lg font-semibold mb-4 text-white">Tricion Studio</h3>
              <p className="text-gray-400 text-sm">
                Creating the future of music production with AI-powered MIDI generation technology.
              </p>
            </div>
            {/* Quick Links */} 
            <div>
              <h3 className="text-lg font-semibold mb-4 text-white">Quick Links</h3>
              <ul className="space-y-2 text-sm">
                <li><Link href="#learn-more" className="text-gray-400 hover:text-secondary transition-colors">Learn More</Link></li>
                <li><Link href="/dashboard/generate" className="text-gray-400 hover:text-secondary transition-colors">Generator</Link></li>
                <li><Link href="#vocal-gen" className="text-gray-400 hover:text-secondary transition-colors">Vocal Gen</Link></li>
                <li><Link href="#pricing" className="text-gray-400 hover:text-secondary transition-colors">Pricing</Link></li>
                <li><Link href="#" className="text-gray-400 hover:text-secondary transition-colors opacity-50 cursor-not-allowed">Download VST</Link></li>
              </ul>
            </div>
            {/* Contact */} 
            <div>
              <h3 className="text-lg font-semibold mb-4 text-white">Contact Us</h3>
              <ul className="space-y-2 text-sm">
                 <li><a href="mailto:Tricionmedia@gmail.com" className="text-gray-400 hover:text-secondary transition-colors flex items-center gap-2"><Mail className="h-4 w-4"/> Email Us</a></li>
                 <li><span className="text-gray-500 flex items-center gap-2"><Code className="h-4 w-4"/> Discord (Soon)</span></li>
               </ul>
            </div>
            {/* Legal */} 
            <div>
              <h3 className="text-lg font-semibold mb-4 text-white">Legal</h3>
              <ul className="space-y-2 text-sm">
                <li><Link href="#" className="text-gray-400 hover:text-secondary transition-colors">Terms of Service</Link></li>
                <li><Link href="#" className="text-gray-400 hover:text-secondary transition-colors">Privacy Policy</Link></li>
                <li><Link href="#" className="text-gray-400 hover:text-secondary transition-colors">Cookie Policy</Link></li>
                <li><Link href="#" className="text-gray-400 hover:text-secondary transition-colors">EULA</Link></li>
              </ul>
            </div>
          </div>
          {/* Copyright */} 
          <div className="mt-8 pt-8 border-t border-gray-700/50 text-center">
            <p className="text-sm text-gray-400">&copy; {new Date().getFullYear()} Tricion MIDI Studio. All rights reserved.</p>
          </div>
        </div>
      </footer>

       {/* Auth Modal would go here if needed, managed by a layout or separate component */} 

    </div>
  );
}
