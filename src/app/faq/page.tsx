import Link from 'next/link';

const FAQPage = () => {
  const faqs = [
    {
      category: 'General',
      questions: [
        {
          q: 'What is Tricion Studio?',
          a: 'Tricion Studio is a web-based application that uses Artificial Intelligence to help you generate melodies, manage your musical creations, and streamline your music production workflow.',
        },
        {
          q: 'Who is Tricion Studio for?',
          a: 'Tricion Studio is designed for musicians, producers, songwriters, content creators, and anyone interested in exploring AI-assisted music creation, regardless of their technical skill level.',
        },
      ],
    },
    {
      category: 'AI Melody Generation',
      questions: [
        {
          q: 'How does AI Melody Generation work?',
          a: 'You provide text-based inputs (like genre, mood, instruments, or a descriptive prompt) into our generation form. Our AI then processes this information to create a unique melody. The generation process is asynchronous, meaning it works in the background, and you will be notified when your melody is ready.',
        },
        {
          q: 'What kind of inputs can I use for melody generation?',
          a: 'You can use various text inputs, including desired genre (e.g., "lo-fi hip hop," "cinematic orchestral"), mood (e.g., "uplifting," "melancholic"), key, tempo, or even more abstract descriptive phrases.',
        },
        {
          q: 'What output formats are supported?',
          a: 'Currently, our AI can generate MIDI files. We are actively working on expanding our capabilities, including vocal generation.',
        },
        {
          q: 'How long does it take to generate a melody?',
          a: 'Generation times can vary depending on the complexity of the request and current system load. Our asynchronous system ensures you can continue working while your melody is being processed. You will be able to track the status of your generation task.',
        },
      ],
    },
    {
      category: 'Melody Library',
      questions: [
        {
          q: 'Can I save the melodies I generate?',
          a: 'Yes, generated melodies can be saved to your personal Melody Library within Tricion Studio.',
        },
        {
          q: 'Can I search and filter my saved melodies?',
          a: 'Absolutely. The Melody Library includes search and filtering options to help you easily find and manage your creations.',
        },
      ],
    },
    {
      category: 'Account & Profile',
      questions: [
        {
          q: 'How do I sign up for Tricion Studio?',
          a: 'You can sign up using our simple registration form. We use Supabase for secure authentication.',
        },
        {
          q: 'Can I update my profile information?',
          a: 'Yes, you can manage your profile information, including personal details and preferences, from your account dashboard.',
        },
      ],
    },
    {
      category: 'Subscriptions & Billing',
      questions: [
        {
          q: 'What subscription tiers do you offer?',
          a: 'We offer different subscription tiers (e.g., Basic, Pro) with varying limits on monthly generations, melody storage, concurrent generations, and access to advanced features or API access. Please visit our Pricing page for detailed comparisons.',
        },
        {
          q: 'How does billing work?',
          a: 'We use Stripe, a secure and trusted payment processor, to handle all subscription payments.',
        },
        {
          q: 'How can I manage my subscription?',
          a: 'You can view your current subscription status, upgrade or downgrade your plan, update payment details, or cancel your subscription through your account is subscription management section, which will redirect you to the Stripe customer portal for secure management.',
        },
        {
          q: 'What happens if I exceed my monthly generation limits?',
          a: 'Depending on your plan, you may need to wait until the next billing cycle or upgrade your plan to continue generating melodies.',
        },
      ],
    },
    {
      category: 'Technical',
      questions: [
        {
          q: 'What do I need to use Tricion Studio?',
          a: 'You need a modern web browser and an internet connection. No special software installation is required.',
        },
        {
          q: 'Is my data secure?',
          a: 'Yes, we take data security seriously. We use Supabase for backend services, which provides robust security features, and Stripe for secure payment processing.',
        },
      ],
    },
  ];

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
            <h1 className="text-3xl font-bold text-center text-white mb-12 md:text-4xl">
              Tricion Studio FAQ | Get Your Questions Answered
            </h1>

            <div className="space-y-10">
              {faqs.map((categoryItem) => (
                <section key={categoryItem.category}>
                  <h2 className="text-2xl font-semibold text-secondary mb-6 pb-2 border-b border-gray-700">
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

export default FAQPage;
