import Link from 'next/link';

const UpdatesPage = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="p-6 md:p-10">
        <div className="max-w-full mx-auto">
          <div>
            <h1 className="text-3xl font-semibold text-white text-center mb-8">Latest Updates to Tricion Studio</h1>
          </div>
          <div className="divide-y divide-gray-700">
            <div className="py-8 text-base leading-7 space-y-6 text-gray-300 sm:text-lg sm:leading-8">
              <p>We're constantly working to improve Tricion Studio and bring you the best melody generation experience. Here's a summary of our recent updates:</p>
              <ul className="list-disc space-y-4 pl-5">
                <li className="flex items-start">
                  <span className="h-6 flex items-center sm:h-7">
                    <svg className="flex-shrink-0 h-5 w-5 text-cyan-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  </span>
                  <p className="ml-3">
                    <span className="font-semibold text-white">User Authentication & Profile Management</span>: Secure sign-up, login, and profile updates are now fully integrated using Supabase.
                  </p>
                </li>
                <li className="flex items-start">
                  <span className="h-6 flex items-center sm:h-7">
                    <svg className="flex-shrink-0 h-5 w-5 text-cyan-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  </span>
                  <p className="ml-3">
                    <span className="font-semibold text-white">Melody Library</span>: You can now browse, search, and filter your saved melodies.
                  </p>
                </li>
                <li className="flex items-start">
                  <span className="h-6 flex items-center sm:h-7">
                    <svg className="flex-shrink-0 h-5 w-5 text-cyan-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  </span>
                  <p className="ml-3">
                    <span className="font-semibold text-white">AI Melody Generation</span>: Our core feature! Input your parameters and let our AI craft melodies for you. We're currently working on making this process asynchronous for a smoother experience.
                  </p>
                </li>
                 <li className="flex items-start">
                  <span className="h-6 flex items-center sm:h-7">
                    <svg className="flex-shrink-0 h-5 w-5 text-cyan-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  </span>
                  <p className="ml-3">
                    <span className="font-semibold text-white">Subscription Management with Stripe</span>: Easily manage your subscription tiers and payment details through our secure Stripe integration.
                  </p>
                </li>
                <li className="flex items-start">
                  <span className="h-6 flex items-center sm:h-7">
                    <svg className="flex-shrink-0 h-5 w-5 text-cyan-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  </span>
                  <p className="ml-3">
                    <span className="font-semibold text-white">Advanced Melody Tools</span>: Convert text to MIDI and MIDI to text with our advanced tools.
                  </p>
                </li>
                <li className="flex items-start">
                  <span className="h-6 flex items-center sm:h-7">
                    <svg className="flex-shrink-0 h-5 w-5 text-cyan-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  </span>
                  <p className="ml-3">
                    <span className="font-semibold text-white">Vocal Generation</span>: We've added tools for vocal generation (currently a placeholder, with full functionality coming soon!).
                  </p>
                </li>
                 <li className="flex items-start">
                  <span className="h-6 flex items-center sm:h-7">
                    <svg className="flex-shrink-0 h-5 w-5 text-cyan-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  </span>
                  <p className="ml-3">
                    <span className="font-semibold text-white">Enhanced Development Environment</span>: Leveraging IDX with Gemini, multimodal prompting, and enhanced Firebase integration for faster, more intuitive development.
                  </p>
                </li>
              </ul>
              <p className="pt-4">Please note: We currently do not have genre-specific models or collaborative features, but these are areas we are exploring for future updates!</p>
            </div>
            <div className="pt-8 text-center">
              <Link href="/dashboard" className="text-blue-400 hover:text-blue-500 font-semibold">
                &larr; Back to Dashboard
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UpdatesPage;
