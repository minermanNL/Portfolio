import Link from 'next/link';

const LearnMorePage = () => {
  return (
    <div className="min-h-screen bg-surface text-gray-300 py-12 flex flex-col justify-center sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-5xl">
        {/* Main Content Area with Background */}
        <div className="relative overflow-hidden rounded-2xl py-8 px-6 sm:px-12 sm:py-12">

          {/* Background Gradients */}
          <div className="absolute inset-0 rounded-2xl z-0">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-primary/10 to-secondary/20 rounded-2xl"></div>
            <div className="absolute inset-0 rounded-2xl" style={{
              background:
                'radial-gradient(circle at 20% 20%, hsla(var(--primary) / 0.2) 0%, transparent 40%), radial-gradient(circle at 80% 80%, hsla(var(--secondary) / 0.2) 0%, transparent 40%), radial-gradient(circle at 50% 50%, hsla(var(--primary) / 0.1) 0%, hsla(var(--secondary) / 0.05) 50%, transparent 100%)'
            }}></div>
          </div>

          {/* Content layered above background */}
          <div className="relative z-10">
            <h1 className="text-4xl font-bold text-center text-white mb-6 md:text-5xl" style={{ color: '#8A2BE2' }}>
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
              <Link href="/" className="text-secondary hover:text-white font-semibold text-lg transition-colors">
                &larr; Back to Home
              </Link>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

// Helper component for feature cards (optional, or integrate directly)
const FeatureCard = ({ title, description, icon }: { title: string, description: string, icon: string }) => {
  return (
    <div className="bg-gray-800/60 p-6 rounded-lg shadow-lg hover:shadow-primary/50 transition-shadow duration-300">
      <div className="flex items-center mb-4">
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
