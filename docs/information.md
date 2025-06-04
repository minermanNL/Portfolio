# **App Name**: Tricion Studio

## 🚀 Core Features:

-   **User Authentication**: Robust and secure user sign-up, login, and account management.
-   **User Profile Management**: Personalized profiles for users to view and update their information.
-   **AI-Powered Melody Generation**: Advanced AI capabilities to transform text prompts into unique MIDI musical compositions and accompanying descriptions.
-   **Interactive Melody Library**: A centralized hub for users to browse, search, filter, and manage their generated melodies.
-   **Subscription Management**: Seamless integration with Stripe for tiered access, billing, and subscription lifecycle management.
-   **Advanced Melody Tools**: Specialized utilities for manual manipulation and conversion of music data (e.g., text-to-MIDI, MIDI-to-text).
-   **Vocal Generation (Future)**: Placeholder for upcoming capabilities to generate vocal tracks.
-   **Observability**: Integrated logging and error tracking for monitoring backend function health and performance.
-   **Rate Limiting & Abuse Protection (Implemented)**: Protects API endpoints from excessive requests and bot traffic.
-   **Bot Mitigation (Implemented)**: Integration with Cloudflare Turnstile on critical user flows.

## 🎨 Style Guidelines:

-   **Primary Color**: Dark blue (`#1A202C`) – for a professional, modern, and trustworthy aesthetic, forming the backbone of the UI.
-   **Secondary Color**: Light gray (`#EDF2F7`) – employed for backgrounds and subtle accents, ensuring a clean, readable, and visually comfortable user interface.
-   **Accent Color**: Teal (`#4DC0B5`) – reserved for interactive elements, highlights, and calls-to-action, providing clear user guidance and visual engagement.
-   **Typography**: Utilizes clean and highly readable sans-serif fonts across all text elements, prioritizing legibility and a contemporary feel.
-   **Iconography**: Modern, minimalist, and intuitive icons for navigation and actions, enhancing usability and visual appeal.
-   **Layout Philosophy**: A clean, responsive, and adaptive design that guarantees an optimal user experience across various screen sizes and devices, from mobile to desktop.

## 📁 Project Structure:

This project is built as a **Next.js application** utilizing **TypeScript** for enhanced type safety and maintainability. It employs **Tailwind CSS** for rapid and consistent styling, and relies on **Supabase** as its primary backend-as-a-service, with **Stripe** securely handling all payment processes. **Genkit** orchestrates the sophisticated AI generation workflows within Supabase Edge Functions. **Upstash Redis** is used for efficient rate limiting.

### Key Directories:

*   **`/src`**: Contains the main source code for the application.
    *   **`/app`**: The main application directory, leveraging **Next.js 13+ App Router** for routing, layouts, and pages.
        *   **`/(auth)`**: Contains UI and logic related to user authentication flows (e.g., `login/page.tsx`, `signup/page.tsx`). Now includes Cloudflare Turnstile integration.
        *   **`/dashboard`**: Houses all pages and components accessible to authenticated users.
            *   **`/generate`**: The main interface for AI melody generation. Its API route is rate-limited.
            *   **`/library`**: Displays the user's collection of generated melodies.
            *   **`/profile`**: User profile viewing and editing page.
            *   **`/subscription`**: Details and management options for user subscriptions.
            *   **`/advanced-tools`**: Pages for advanced melody conversion tools.
            *   **`/vocal-generation`**: Placeholder for future vocal generation features.
        *   **`/api`**: **Next.js API Routes** (running as serverless functions within the Next.js environment). These act as secure intermediaries or orchestrators for backend logic. Now includes rate limiting and Turnstile verification.
            *   **`/create-stripe-checkout`**: Handles requests to initiate a Stripe checkout session.
            *   **`/stripe-webhook`**: Secure webhook endpoint for receiving and processing events from Stripe (e.g., subscription changes).
            *   **`/generate-melody-task`**: Receives frontend requests to initiate melody generation, creates a task record in Supabase, and triggers the Supabase Edge Function. **Now includes user-based rate limiting.**
            *   **`/melody-status/[taskId]`**: Endpoint for the frontend to poll for the asynchronous status of a melody generation task. **The POST method (for potential iteration) now includes user-based rate limiting.**
            *   **`/midi-to-text`**: Processes requests to convert uploaded MIDI files into textual descriptions.
            *   **`/auth/signup`**: New API route to handle signup requests server-side. **Includes IP-based rate limiting and Cloudflare Turnstile verification.**
            *   **`/auth/login`**: New API route to handle login requests server-side. **Includes IP-based rate limiting and Cloudflare Turnstile verification.**
    *   **`/components`**: Houses all reusable UI components.
        *   **`/auth`**: Components specific to authentication forms and UI. `LoginForm.tsx` and `SignupForm.tsx` now include the Cloudflare Turnstile widget.
        *   **`/dashboard`**: Components used across dashboard pages (e.g., forms, lists, cards specific to dashboard features).
            *   `MelodyGenerationClient.tsx`: Client-side logic for the AI generation form, handling user input, API calls, and UI state (including polling).
            *   `MelodyList.tsx`: Component for displaying lists of melodies.
            *   `MelodyCard.tsx`: Individual card component for a melody entry.
            *   `ProfileClient.tsx`: Client-side profile management.
            *   `SubscriptionClient.tsx`: Client-side subscription display and management.
            *   `AdvancedMelodyToolsClient.tsx`: Frontend for manual text-to-MIDI and MIDI-to-text tools.
            *   `VocalGenerationClient.tsx`: Placeholder for vocal generation UI.
        *   **`/shared`**: Generic components used application-wide (e.g., `Header.tsx`, `Footer.tsx`, `Navbar.tsx`).
        *   **`/ui`**: Fundamental, unstyled UI primitives or components derived from a UI library (e.g., Shadcn/ui) for consistency and accessibility.
    *   **`/hooks`**: Custom React hooks encapsulating reusable stateful logic (e.g., `useAuthSession.ts` for managing authentication state).
    *   **`/lib`**: Utility functions, external library configurations, and helpers.
        *   **`/supabase`**: Configuration and client setup for interacting with Supabase services (both client-side and server-side admin clients).
        *   **`/redis.ts`**: Configures and exports the **Upstash Redis client**.
        *   **`/get-ip.ts`**: Utility to extract client IP from request headers.
    *   **`/services`**: Business logic and service layers.
        *   **`/rate-limiter.ts`**: Core rate limiting logic, including Redis interaction and middleware (`withRateLimit`).
    *   **`/types`**: Centralized TypeScript type definitions, including `supabase.ts` (defining the shape of Supabase database tables like `profiles`, `subscriptions`, `tasks`, `melodies`).
    *   **`/ai`**: Dedicated directory for Artificial Intelligence related code and Genkit integration.
        *   **`genkit.ts`**: Core Genkit initialization and configuration, including plugin registration (`googleAI`) and default model setup.
        *   **`/flows`**: Defines Genkit flows (`ai.defineFlow`) that orchestrate multi-step AI tasks.
        *   **`/prompts`**: May contain separate files for `ai.definePrompt` definitions (currently handled inline in `ai.generate` for simplicity).
    *   **`/utils`**: General purpose utility functions.
        *   **`parseTextToMidi.ts`**: Crucial standalone utility responsible for converting AI-generated textual MIDI event descriptions into a playable base64 encoded MIDI file using the `@tonejs/midi` library.
    *   **`/config`**: Configuration files.
        *   **`/rate-limits.ts`**: Defines and loads rate limit configurations from environment variables.
*   **`/public`**: Stores static assets (images, fonts, favicons, HTML files).
*   **`/functions`**: (This directory might be less used or deprecated if Next.js API Routes handle all backend logic previously assigned to Firebase Functions or other serverless platforms).
*   **`/dataconnect`**: (Likely deprecated or removed if Firebase-specific data connectors are no longer relevant).
*   **`/docs`**: Project-level documentation (like this `information.md`).
*   **`.idx`**: Google IDX-specific configuration files for the cloud development environment.
*   **`.vscode`**: Visual Studio Code editor settings and configurations.

### Main Technologies Used:

*   **Next.js**: The chosen React framework, providing server-side rendering (SSR), static site generation (SSG), and **API Routes** which are central to handling backend logic and external API calls.
*   **TypeScript**: Employed throughout the codebase to enhance code quality, enable type safety, improve developer experience, and facilitate large-scale project management.
*   **Tailwind CSS**: A highly efficient, utility-first CSS framework for rapid UI development and consistent design application.
*   **Supabase**: The comprehensive open-source backend-as-a-service solution:
    *   **PostgreSQL Database**: Serves as the robust and scalable relational data store, managing user profiles, melodies, asynchronous tasks, and subscription data. Extensively uses **Row Level Security (RLS)** for secure, fine-grained data access.
    *   **Authentication**: Provides secure and flexible user authentication (email/password, OAuth).
    *   **Storage**: For handling file uploads and serving static assets.
    *   **Edge Functions**: Deno-based serverless functions for running backend code closer to users. Crucially, these are used for computationally intensive or long-running tasks, such as AI model inference with Genkit.
*   **Stripe**: A leading payment processing platform, integrated to securely handle all subscription billing, payments, and customer portal management.
*   **Genkit**: An open-source AI framework that abstracts away complexities of interacting with various AI models. It is used here to orchestrate multi-step AI generation flows and integrate with Google's generative models.
*   **@tonejs/midi**: A dedicated JavaScript library used for programmatically creating, manipulating, and exporting MIDI files from within the Deno runtime.
*   **midi-parser-js**: Another MIDI library, potentially used for MIDI-to-text conversion (e.g., in the `/api/midi-to-text` route) or other parsing needs.
*   **Zod**: A TypeScript-first schema declaration and validation library, used for input/output validation in API routes, database operations, and Genkit flows.
*   **Upstash Redis (@upstash/redis)**: A serverless Redis provider used for efficient storage and management of rate limiting counts.
*   **Cloudflare Turnstile**: Integrated for bot mitigation on user-facing authentication endpoints.

## Detailed Explanation of Features:

### User Authentication:
*   **Flow:** Users can sign up or log in via the frontend forms, which submit to new API routes (`/api/auth/signup`, `/api/auth/login`). These routes perform **IP-based rate limiting** and **Cloudflare Turnstile verification** before using Supabase Auth. Upon successful authentication, they gain access to the dashboard.
*   **Mechanism:** Securely managed by Supabase Authentication, with server-side handling in the new API routes.
*   **Security:** **Integrated Cloudflare Turnstile verification** on the backend API routes to mitigate bot signups and login attempts. **IP-based rate limiting** is applied to these routes (`/api/auth/signup`, `/api/auth/login`) to prevent abuse like mass account creation or brute-force login attempts from a single IP.
*   **Session Management:** `AuthSessionProvider.tsx` manages the global authentication state, often leveraging Next.js's context or React Query for session freshness. `useAuthSession.ts` provides a convenient hook to access the current user's session and ID across components. Supabase handles session cookies on successful login via the backend API route.

### User Profile:
*   **Access:** Users can view and update their profile details (e.g., `username`, `full_name`, `avatar_url`, `website`).
*   **Data Source:** Profile information is stored in a dedicated `profiles` table within Supabase, linked to `auth.users` via a `user_id` column.
*   **Updates:** Client-side components like `ProfileClient.tsx` handle form submissions, which are securely sent to Supabase via the Supabase JS client.

### Melody Library:
*   **Display:** `MelodyList.tsx` fetches and displays a paginated list of melodies, each presented as a `MelodyCard.tsx`.
*   **Data Source:** Melodies are stored in a `melodies` table in Supabase. This table links to the `tasks` table (for generation history) and `user_id` (for ownership).
*   **Interaction:** Users can search and filter their melodies based on metadata (genre, mood, description).
*   **Playback/Download:** The `MelodyCard` facilitates playback of generated MIDI data (by decoding base64) and provides download options.

### AI Melody Generation:
*   **User Interface:** The primary interaction point is the generation form in `src/app/dashboard/generate/page.tsx` (`MelodyGenerationClient.tsx`).
*   **Asynchronous Flow (Current State: Debugging API Interaction):**
    1.  **Task Initiation (Frontend -> Next.js API Route):**
        *   The user submits a text prompt (e.g., "upbeat piano melody in C major") via `MelodyGenerationClient.tsx`.
        *   The client sends a `POST` request to the Next.js API Route: `/api/generate-melody-task`. **This route is now protected by user-based rate limiting.**
        *   This API Route first creates a new record in the Supabase `public.tasks` table (e.g., `id`, `user_id`, `prompt`, `status: 'PENDING'`) using the `authenticated` user's ID for RLS. This is secured by a specific RLS policy: `"Allow authenticated users to insert their own tasks"`.
        *   The Next.js API Route then immediately returns a `202 Accepted` status with the `taskId` to the frontend, indicating that the task has been queued.
    2.  **AI Processing (Next.js API Route -> Supabase Edge Function -> Supabase DB):**
        *   **Crucially, *after* creating the task in Supabase, the Next.js API Route makes an internal, server-to-server call to your deployed Supabase Edge Function (`generate-melody-tasks`).** It passes the `taskId` and `prompt`.
        *   The Edge Function, running in a Deno environment:
            *   Updates the `tasks` table status to 'PROCESSING' using the `service_role` key (secured by `"Allow service_role to update tasks table"` policy).
            *   Calls the Google AI model (`googleai/gemini-2.5-flash-preview-05-20`) via Genkit's `ai.generate()` method. Messages are directly constructed within `ai.generate()` (e.g., `{ role: 'user', content: [{ text: "system prompt + user prompt" }] }`), bypassing `ai.definePrompt`'s templating layer to ensure `content` is never `[null]`.
            *   The AI model returns a raw text string containing MIDI event descriptions.
            *   This raw text string is passed to `src/utils/parseTextToMidi.ts`, which is responsible for converting the text into a playable binary MIDI file and then encoding it to a base64 string.
            *   Finally, the Edge Function updates the `tasks` table to 'COMPLETED' in Supabase, saving the base64 `midi_data` and a generated `description`. If an error occurs during AI generation or processing, the status is set to 'FAILED' with an `error_message`.
    3.  **Frontend Polling & Display (Frontend -> Next.js API Route -> Frontend):**
        *   While the Edge Function processes, `MelodyGenerationClient.tsx` periodically polls the `/api/melody-status/[taskId]` Next.js API route.
        *   This polling route retrieves the current `status` from the `tasks` table in Supabase.
        *   Once the status changes to 'COMPLETED':
            *   The frontend retrieves the `midi_data` (the full base64 string) and `description`.
            *   It decodes the base64 string using `window.atob()` and converts it to a `Uint8Array`.
            *   A `Blob` is created from this binary data, and an object URL is generated.
            *   A temporary link element is used to trigger a file download (`audio.midi` type).
            *   The melody is displayed and made available for playback.
        *   If the status is 'FAILED', the frontend displays the `error_message` from the task record.

#### Subscription Tiers:

*   **Basic Tier**
    *   Monthly Generations: 100
    *   Max Melody Storage: 500 MB
    *   Concurrent Generations: 2
    *   Max API Keys: 5
    *   Advanced Features: True
    *   API Access: False
*   **Pro Tier**
    *   Monthly Generations: 1000
    *   Max Melody Storage: 5 GB
    *   Concurrent Generations: 5
    *   Max API Keys: 20
    *   Advanced Features: True
    *   API Access: True

### Subscription Management:
*   **Initiation:** The pricing page (`src/app/pricing/page.tsx`) guides users to select a plan.
*   **Checkout Flow:** User selection triggers a request to the `/api/create-stripe-checkout` Next.js API Route. This route securely communicates with Stripe's API to create a unique checkout session. The user is then redirected to Stripe's secure hosted checkout page for payment.
*   **Webhook Processing:** Upon successful payment or subscription changes, Stripe sends real-time webhook events (e.g., `checkout.session.completed`, `customer.subscription.created`, `customer.subscription.updated`, `customer.subscription.deleted`) to the `/api/stripe-webhook` Next.js API Route. This webhook handler includes **Stripe signature verification** for security and updates the `subscriptions` table in Supabase with the user's accurate subscription status, current plan, and billing period.
*   **Status Display:** `SubscriptionClient.tsx` fetches and displays the user's current subscription details from the Supabase `subscriptions` table.
*   **User Portal:** For managing payment methods, updating billing information, or cancelling subscriptions, users are securely redirected to the Stripe customer portal, providing a self-service option.

### UI Components:
*   **Structure:** Components in `src/components/ui/` are built upon a robust UI library (like Shadcn/ui), providing a consistent, accessible, and themeable design system. This includes common elements such as buttons, cards, dialogs, forms, input fields, and navigation elements (menubar, sidebar).
*   **Styling:** The application's visual consistency is maintained through a utility-first approach with **Tailwind CSS**, configured via `tailwind.config.ts` and `postcss.config.mjs`. Global styles are managed in `globals.css`.
*   **Turnstile Widget:** Cloudflare Turnstile widget (`<div className="cf-turnstile">`) added to authentication forms (`LoginForm.tsx`, `SignupForm.tsx`), rendered only on the client-side to avoid hydration errors.

### Backend Logic (Next.js API Routes & Supabase Edge Functions):
*   **Supabase:** Serves as the central backend for all data storage (PostgreSQL), user authentication, and file storage.
*   **Next.js API Routes (`/src/app/api/`)**: Act as serverless functions within the Next.js framework. They are used for:
    *   Handling sensitive operations (e.g., communicating with Stripe APIs, creating initial database records).
    *   Orchestrating complex asynchronous workflows by triggering Supabase Edge Functions.
    *   Serving as dedicated endpoints for frontend interaction (e.g., polling for task status). **Many of these routes now include rate limiting.**
*   **Supabase Edge Functions (`supabase/functions/`)**: Deno-based serverless functions deployed globally. They are specifically chosen for:
    *   **AI Model Inference:** Offloading the heavy computation of AI model calls to a dedicated, performable, and scalable environment.
    *   **Long-Running Tasks:** Handling asynchronous operations that might exceed typical API route timeouts.
    *   **Deno Runtime:** Leveraging Deno's modern JavaScript/TypeScript runtime for secure and efficient execution.

### Development Environment and Tooling:
*   **Google IDX Integration**: The project is developed within Google's IDX, a cloud-based IDE that provides a tightly integrated and powerful development environment.
*   **Unified AI Assistance**: Deep integration of AI coding assistance (powered by **Gemini**), providing intelligent code completion, suggestions, and context-aware help directly within the editor. This spans across the IDX environment and Firebase services.
*   **Multimodal Prompting**: The development environment supports multimodal prompting capabilities, enabling more flexible and expressive interactions when using AI for coding and development tasks.
*   **Enhanced Firebase Integration**: Provides streamlined workflows and tighter integration with Firebase services, complementing Supabase where applicable (e.g., for analytics, specific cloud functions if any are still used, or project management).
*   **Dependency Management**: `package.json` and `package-lock.json` manage NPM dependencies. `tsconfig.json` configures TypeScript. `.idx/dev.nix` is a Nix environment configuration for consistent local development.
*   **MIDI Libraries**: `midi-parser-js` (potentially for MIDI-to-text conversion) and `@tonejs/midi` (for programmatically generating MIDI data in the backend).
*   **Zod**: A TypeScript-first schema declaration and validation library, used for input/output validation in API routes, database operations, and Genkit flows.
*   **Upstash Redis (@upstash/redis)**: A serverless Redis provider used for efficient storage and management of rate limiting counts.
*   **Cloudflare Turnstile**: Integrated for bot mitigation on user-facing authentication endpoints.

## 🚀 How It Works (High-Level Flow):

1.  **User Authentication & Access**: A user signs up/logs in via the frontend forms, which submit to new API routes (`/api/auth/signup`, `/api/auth/login`). These routes perform **IP-based rate limiting** and **Cloudflare Turnstile verification** before using Supabase Auth. Upon successful authentication, they gain access to the dashboard.
2.  **Subscription & Monetization**:
    *   User selects a plan from the pricing page.
    *   Frontend calls `/api/create-stripe-checkout`.
    *   Next.js API route interacts with Stripe, creates a checkout session, and redirects the user to Stripe's payment portal.
    *   After payment, Stripe sends a webhook to `/api/stripe-webhook`.
    *   The Next.js webhook handler verifies the Stripe signature and updates the Supabase `subscriptions` table.
    *   The user's subscription status is displayed in `SubscriptionClient.tsx`.
3.  **AI Melody Generation (Asynchronous & Event-Driven)**:
    *   The user provides a text prompt in `MelodyGenerationClient.tsx` and initiates generation.
    *   **Frontend Request to Next.js API:** `MelodyGenerationClient.tsx` sends a `POST` request with the prompt to `/api/generate-melody-task`. **This route is now protected by user-based rate limiting.**
    *   **Next.js API Task Creation:** `/api/generate-melody-task` generates a `taskId`, saves a 'PENDING' task record in the Supabase `tasks` table, and immediately returns the `taskId` to the frontend.
    *   **Next.js API Triggers Edge Function:** `/api/generate-melody-task` then makes a background server-to-server call to the **Supabase Edge Function** (`generate-melody-tasks`), passing the `taskId` and prompt.
    *   **Edge Function Processing (Genkit Core)**:
        *   The Edge Function updates the task status to 'PROCESSING' in Supabase.
        *   It constructs messages (including system and user prompts) and calls Genkit's `ai.generate()` using the specified Google AI model (e.g., `googleai/gemini-2.5-flash-preview-05-20`).
        *   The model returns raw MIDI event text.
        *   This text is passed to `parseTextToMidi.ts`, which uses `@tonejs/midi` to convert the text into a full binary MIDI file, then base64 encodes it.
        *   The Edge Function updates the task status to 'COMPLETED' in Supabase, saving the base64 `midi_data` and a generated `description`. If an error occurs during AI generation or processing, the status is set to 'FAILED' with an `error_message`.
    *   **Frontend Polling & Display**:
        *   While the Edge Function processes, `MelodyGenerationClient.tsx` periodically polls the `/api/melody-status/[taskId]` Next.js API route.
        *   This API route fetches the latest status from the Supabase `tasks` table.
        *   Once the status is 'COMPLETED', the frontend retrieves the full base64 `midi_data` and `description`. It then decodes the base64 data, creates a playable MIDI object (e.g., a Blob or AudioBuffer), and updates the UI with playback controls, visualization, and the description.
        *   If 'FAILED', an error message is displayed.
4.  **Melody Management:** Users can view their generated melodies in the dashboard library.
5.  **Iteration/Refinement:** (Assumed to be a POST to `/api/melody-status/[taskId]`). **This endpoint is now protected by user-based rate limiting.** (Note: Actual iteration logic needs to be implemented).
6.  **Tools and Future Expansion:** Advanced features and vocal generation are planned for future development.

## 🚧 Work Done & Remaining Tasks (Rate Limiting, Abuse Protection, Turnstile):

### ✅ Completed:

*   Created core rate limiting configuration (`src/config/rate-limits.ts`), service logic (`src/services/rate-limiter.ts`), and IP utility (`src/lib/get-ip.ts`).
*   Integrated Upstash Redis (`src/lib/redis.ts`) as the data store for rate limits.
*   Implemented user-based hourly and daily rate limits for the MIDI generation endpoint (`/api/generate-melody-task`).
*   Added a placeholder `POST` handler to `/api/melody-status/[taskId]/route.ts` and applied user-based hourly and daily rate limiting to it (assuming this is the iteration endpoint).
*   Refactored frontend signup (`SignupForm.tsx`) to submit to a new backend API route (`/api/auth/signup`).
*   Created the backend API route for signup (`/api/auth/signup`).
*   Refactored frontend login (`LoginForm.tsx`) to submit to a new backend API route (`/api/auth/login`).
*   Created the backend API route for login (`/api/auth/login`).
*   Integrated Cloudflare Turnstile widget into `SignupForm.tsx` and `LoginForm.tsx`.
*   Added the Cloudflare Turnstile loading script to the authentication layout (`src/app/(auth)/layout.tsx`).
*   Implemented server-side Cloudflare Turnstile verification in the `/api/auth/signup` and `/api/auth/login` API routes.
*   Implemented IP-based hourly and daily rate limits for the signup (`/api/auth/signup`) and login (`/api/auth/login`) API routes.
*   Resolved hydration errors caused by the Turnstile widget by rendering it client-side using `useEffect`.

### 🛠️ Remaining (Minimum Scope to be fully functional):

*   **Testing and Verification:** Thoroughly test all implemented rate limits (user/IP, hourly/daily configured via environment variables) and Turnstile integrations on signup and login pages in both development and a deployed environment.
*   **Implement Iteration Logic:** Replace the `TODO` comment in the `handleIterationPost` function in `src/app/api/melody-status/[taskId]/route.ts` with the actual backend logic for performing melody refinement/iteration.
*   **Environment Variables:** Ensure all necessary environment variables (especially for rate limits, Redis, and Turnstile) are correctly set in your deployment environment (e.g., Vercel project settings).

### ⚙️ Production Checklist / Development-Specific ToDos:

*   **Replace Cloudflare Turnstile Test Keys:** The `NEXT_PUBLIC_TURNSTILE_SITE_KEY` and `TURNSTILE_SECRET_KEY` environment variables are currently using **Cloudflare provided test keys (`1x0000...`)**. **These MUST be replaced** with the actual Site Key and Secret Key generated from your Cloudflare dashboard for your production domain before deploying to production.
*   **Configure Redis in Production Environment:** Ensure the `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN` environment variables are correctly set in your production environment (e.g., Vercel project settings) to point to your live Upstash Redis instance.
*   **Set Production Rate Limit Environment Variables:** Configure the specific rate limit environment variables (e.g., `MIDI_GEN_HOURLY_LIMIT_PER_USER`, `ACCOUNT_CREATION_DAILY_LIMIT_PER_IP`, etc.) in your production environment with the desired limits for your live application.
*   **Enhance Logging:** While basic console logging is in place, consider implementing more robust, structured logging integrated with a centralized logging system for better monitoring and debugging in a production environment.

### ⏭️ Future Enhancements (Beyond Minimum Scope):

*   **Sophisticated Abuse Detection:** Implement more advanced techniques for detecting account cycling or other complex abuse patterns (e.g., device fingerprinting, behavioral analysis).
*   **Fallback for JS Disabled:** Provide an alternative authentication flow or a clear message for users with JavaScript disabled who cannot render/complete the Turnstile challenge.
*   **Admin Interface for Limits:** Create an admin interface to manage rate limits dynamically instead of solely relying on environment variables.

---

## Next steps

* Explore the [Firebase Studio documentation](/docs/studio).
* [Get started with Firebase Studio](https://studio.firebase.google.com/).

Send feedback
