import Link from 'next/link';

const AboutUsPage = () => {
  return (
    <div className="min-h-screen bg-surface text-gray-300 py-12 flex flex-col justify-center sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-3xl">
        {/* Main Content Area with Background */}
        <div className="relative overflow-hidden rounded-2xl py-8 px-6 sm:px-12 sm:py-12">

          {/* Background Gradients */}
          <div className="absolute inset-0 rounded-2xl z-0">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-primary/10 to-secondary/20 rounded-2xl"></div>
            <div className="absolute inset-0 rounded-2xl" style={{ background: 
              'radial-gradient(circle at 20% 20%, hsla(var(--primary) / 0.2) 0%, transparent 40%), radial-gradient(circle at 80% 80%, hsla(var(--secondary) / 0.2) 0%, transparent 40%), radial-gradient(circle at 50% 50%, hsla(var(--primary) / 0.1) 0%, hsla(var(--secondary) / 0.05) 50%, transparent 100%)' 
            }}></div>
          </div>

          {/* Content layered above background */}
          <div className="relative z-10">
            <h1 className="text-3xl font-bold text-center text-white mb-10 md:text-4xl">
              About Tricion Studio | The Future of Music Creation
            </h1>
            
            <div className="space-y-10 text-lg leading-relaxed">
              <section>
                <h2 className="text-2xl font-semibold text-secondary mb-4">Our Mission: Empowering Your Musical Vision</h2>
                <p>
                  At Tricion Studio, we believe that everyone has a melody within them waiting to be discovered. 
                  Our mission is to break down creative barriers and empower musicians, producers, and hobbyists 
                  alike to bring their musical ideas to life. We're passionate about the intersection of 
                  technology and artistry, and we've built Tricion Studio to be an intuitive, powerful partner 
                  in your creative journey.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-secondary mb-4">What is Tricion Studio?</h2>
                <p>
                  Tricion Studio is an innovative platform designed to revolutionize how you create music. 
                  Leveraging cutting-edge artificial intelligence, we provide tools that inspire, assist, 
                  and accelerate the music-making process. From generating unique melodies based on your 
                  creative prompts to managing your growing library of musical ideas, Tricion Studio offers 
                  a seamless, integrated experience.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-secondary mb-4">Why We Built Tricion Studio</h2>
                <p>
                  We are a team of musicians, developers, and AI enthusiasts who understand the challenges 
                  and joys of music creation. We saw an opportunity to harness the power of AI not to replace 
                  human creativity, but to augment and amplify it. Whether you're battling writer's block, 
                  looking for a fresh spark of inspiration, or need to quickly prototype an idea, Tricion Studio 
                  is designed to be your co-creator.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-secondary mb-4">Our Vision for the Future</h2>
                <p>
                  We are constantly exploring new frontiers in AI music technology. Our vision is to create 
                  an ever-evolving ecosystem where creators can effortlessly translate their imagination into 
                  sound. We are committed to building a platform that is not only powerful and professional 
                  but also accessible and inspiring for all levels of musical expertise.
                </p>
              </section>

              <p className="mt-16 text-center text-xl text-white font-medium">
                Join us at Tricion Studio, and let's compose the future of music, together.
              </p>
            </div>

            <div className="mt-12 text-center">
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

export default AboutUsPage;