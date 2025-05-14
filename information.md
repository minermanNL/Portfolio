# **App Name**: Tricion Studio

## Core Features:

- User Authentication: Allow users to sign-up, log-in, and manage their accounts.
- User Profile: Display user information fetched from the backend, allowing for profile updates.
- Melody Library: Display a list of melodies, with search and filtering options.
- AI Melody Generation: A form takes input to send to the backend. The response is used to generate MIDI or vocals.
- Subscription Management: Allows users to subscribe to different tiers, manage their payment details via Stripe, and view their current subscription status.

## Style Guidelines:

- Primary color: Dark blue (#1A202C) for a professional and modern feel.
- Secondary color: Light gray (#EDF2F7) for backgrounds and subtle accents.
- Accent color: Teal (#4DC0B5) for interactive elements and highlights.
- Clean and readable sans-serif fonts for all text elements.
- Modern and minimalist icons for navigation and actions.
- A clean and responsive layout that adapts to different screen sizes.

## Project Structure:

The project is a Next.js application with TypeScript. It uses Tailwind CSS for styling and Supabase for backend services, with Stripe integrated for payments.

### Key Directories:

*   **`/src`**: Contains the main source code for the application.
    *   **`/app`**: The main application directory for Next.js, containing layouts, pages, and components.
        *   **`/(auth)`**: Authentication-related pages (login, signup).
        *   **`/dashboard`**: Pages for the main user dashboard after login (generate, library, profile, subscription).
        *   **`/api`**: API routes for backend logic.
            *   **`/create-stripe-checkout`**: API route to initiate a Stripe checkout session.
            *   **`/stripe-webhook`**: API route to handle incoming webhook events from Stripe.
    *   **`/components`**: Reusable UI components.
        *   **`/auth`**: Components related to authentication.
        *   **`/dashboard`**: Components specific to the dashboard.
        *   **`/shared`**: Components used across different parts of the application.
        *   **`/ui`**: General UI components (buttons, cards, dialogs, etc.), likely from a UI library like Shadcn/ui.
    *   **`/hooks`**: Custom React hooks.
    *   **`/lib`**: Utility functions and libraries.
        *   **`/supabase`**: Supabase client setup and potentially helper functions.
    *   **`/types`**: TypeScript type definitions, including `supabase.ts` which defines the structure of Supabase tables (e.g., `subscriptions`).
    *   **`/ai`**: Artificial intelligence related code, likely for melody generation.
        *   **`/flows`**: Genkit flows for AI tasks.
*   **`/public`**: Static assets like images and HTML files.
*   **`/functions`**: (Likely less used now, as API routes in Next.js handle backend logic for Stripe and potentially other tasks previously designated for Firebase Functions).
*   **`/dataconnect`**: (Likely less used or removed if Firebase is fully replaced by Supabase).
*   **`/docs`**: Project documentation.
*   **`.idx`**: IDX-specific configuration files.
*   **`.vscode`**: VS Code editor settings.

### Main Technologies Used:

*   **Next.js**: React framework for server-side rendering and static site generation, including API routes for backend logic.
*   **TypeScript**: Superset of JavaScript that adds static typing.
*   **Tailwind CSS**: Utility-first CSS framework.
*   **Supabase**: Backend-as-a-Service platform providing:
    *   Authentication
    *   PostgreSQL Database (including a `subscriptions` table)
    *   Storage
    *   Edge Functions (though API routes in Next.js are also used)
*   **Stripe**: Payment processing platform for handling subscriptions.
*   **Genkit (implied by `src/ai/genkit.ts`)**: An AI framework, likely used for the melody generation feature.

## Detailed Explanation of Features:

### User Authentication:
*   Located in `src/app/(auth)/` and `src/components/auth/`.
*   Provides forms for user sign-up (`SignupForm.tsx`) and login (`LoginForm.tsx`).
*   Uses Supabase Authentication for managing user accounts.
*   `AuthSessionProvider.tsx` likely manages the user's session state.
*   `useAuthSession.ts` is probably a custom hook to access authentication state.
*   Handles user login, signup, and session management.
*   Ensures secure access to the application.

### User Profile:
*   Allows users to view and update their profile information.
*   Displays user-specific data.
*   Located in `src/app/dashboard/profile/page.tsx` and `src/components/dashboard/ProfileClient.tsx`.
*   Fetches user information from the backend (Supabase).
*   Allows users to view and potentially update their profile details.

### Melody Library:

*   Located in `src/app/dashboard/library/page.tsx` and `src/components/dashboard/MelodyList.tsx`.
*   Displays a list of melodies, likely stored in a Supabase table.
*   `MelodyCard.tsx` is probably used to display individual melodies.
*   May include search and filtering capabilities.
*   Provides an organized view of generated and saved melodies.
*   Allows users to easily find and access their musical creations.

### AI Melody Generation:

*   Located in `src/app/dashboard/generate/page.tsx` and `src/components/dashboard/MelodyGenerationClient.tsx`.
*   A form (`MelodyGenerationClient.tsx`) takes user input (e.g., prompt, genre, mood).
*   This input is sent to the backend, likely processed by AI models using Genkit (`src/ai/genkit.ts`, `src/ai/flows/generate-melody-from-prompt.ts`), potentially via a Next.js API route or a Supabase Edge Function.
*   `src/parseTextToMidi.ts` suggests that the AI might generate a textual representation of music that then gets converted to MIDI.
*   The generated output could be MIDI files or even vocal tracks.
*   `src/ai/flows/summarize-melody-details.ts` might be used to create descriptions or tags for generated melodies.

#### Basic Tier
*   **Monthly Generations:** 100
*   **Max Melody Storage:** 500
*   **Concurrent Generations:** 2
*   **Max API Keys:** 5
*   **Advanced Features:** True
*   **API Access:** False

#### Pro Tier
*   **Monthly Generations:** 1000
*   **Max Melody Storage:** 5000
*   **Concurrent Generations:** 5
*   **Max API Keys:** 20
*   **Advanced Features:** True
*   **API Access:** True

### Subscription Management:

*   Frontend components located in `src/app/dashboard/subscription/page.tsx` and `src/components/dashboard/SubscriptionClient.tsx`.
*   The pricing page (`src/app/pricing/page.tsx`) initiates the subscription process.
*   When a user selects a plan, a request is made to the `/api/create-stripe-checkout` Next.js API route. This route communicates with Stripe to create a checkout session.
*   The user is redirected to Stripe's secure portal to enter payment details and confirm the subscription.
*   Stripe sends webhook events (e.g., `checkout.session.completed`, `customer.subscription.created`) to the `/api/stripe-webhook` Next.js API route.
*   This webhook handler verifies the event and updates the `subscriptions` table in the Supabase database with the user's subscription status, current plan, and subscription period.
*   The `SubscriptionClient.tsx` component displays the user's current subscription status by fetching data from the Supabase `subscriptions` table.
*   Users can manage their subscription (e.g., change plan, update payment method, cancel) by being redirected to the Stripe customer portal (this link should be provided in `SubscriptionClient.tsx`).

### UI Components:

*   The project uses a rich set of UI components, found in `src/components/ui/`. These include common elements like buttons, cards, dialogs, forms, input fields, navigation elements (menubar, sidebar), and more. This suggests a well-structured and consistent user interface.
*   `tailwind.config.ts` and `postcss.config.mjs` configure Tailwind CSS.
*   `globals.css` contains global styles.

### Backend Logic (Next.js API Routes & Supabase):

*   Supabase is the primary backend for data storage (PostgreSQL) and authentication.
*   Next.js API routes (in `/src/app/api/`) handle specific backend tasks:
    *   `create-stripe-checkout`: Securely creates Stripe checkout sessions.
    *   `stripe-webhook`: Handles incoming webhooks from Stripe to update subscription data in Supabase.
    *   Other API routes might exist for AI interactions or other backend processes.

### Development and Tooling:

*   `package.json` and `package-lock.json` manage project dependencies.
*   `tsconfig.json` (and variants) configure the TypeScript compiler.
*   `.idx/dev.nix` is a Nix environment configuration, likely for ensuring a consistent development environment within Google's IDX.
*   `next.config.ts` is the configuration file for Next.js.

## How It Works (High-Level Flow):

1.  **User signs up or logs in:** Supabase Authentication verifies credentials.
2.  **User navigates the dashboard:** Next.js handles routing. The UI is built with React components and styled with Tailwind CSS.
3.  **To generate a melody:**
    *   The user fills a form in `MelodyGenerationClient.tsx`.
    *   The client sends a request (likely to a Next.js API route or Supabase Edge Function).
    *   The backend invokes a Genkit flow (`generate-melody-from-prompt.ts`).
    *   The AI model processes the input and generates melody data.
    *   This data might be converted to MIDI using `parseTextToMidi.ts`.
    *   The result is returned to the client and presented to the user.
    *   Generated melodies might be saved to a Supabase table.
4.  **To view melodies:**
    *   `MelodyList.tsx` fetches melody data from Supabase.
    *   Melodies are displayed using `MelodyCard.tsx`.
5.  **To manage subscription:**
    *   User visits the pricing page and selects a plan.
    *   A request is sent to `/api/create-stripe-checkout`.
    *   The user is redirected to Stripe to complete payment.
    *   Stripe sends a webhook event to `/api/stripe-webhook`.
    *   The webhook handler updates the `subscriptions` table in Supabase.
    *   `SubscriptionClient.tsx` displays current status from Supabase.
    *   For managing payment methods or cancellations, the user is typically redirected to the Stripe customer portal.

This `information.md` file provides a comprehensive overview based on the project's file structure and the initial blueprint, incorporating the recent Stripe and Supabase integration for subscriptions.
