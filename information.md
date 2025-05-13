# **App Name**: Tricion Studio

## Core Features:

- User Authentication: User Authentication: Allow users to sign-up, log-in, and manage their accounts.
- User Profile: User Profile: Display user information fetched from the backend, allowing for profile updates.
- Melody Library: Melody Library: Display a list of melodies, with search and filtering options.
- AI Melody Generation: AI Melody Generator: A form takes input to send to the backend. The response is used to generate MIDI or vocals.
- Subscription Management: Subscription management: Display subscription status and a link to Stripe for managing the subscription.

## Style Guidelines:

- Primary color: Dark blue (#1A202C) for a professional and modern feel.
- Secondary color: Light gray (#EDF2F7) for backgrounds and subtle accents.
- Accent color: Teal (#4DC0B5) for interactive elements and highlights.
- Clean and readable sans-serif fonts for all text elements.
- Modern and minimalist icons for navigation and actions.
- A clean and responsive layout that adapts to different screen sizes.

## Project Structure:

The project is a Next.js application with TypeScript. It uses Tailwind CSS for styling and Firebase for backend services.

### Key Directories:

*   **`/src`**: Contains the main source code for the application.
    *   **`/app`**: The main application directory for Next.js, containing layouts, pages, and components.
        *   **`/(auth)`**: Authentication-related pages (login, signup).
        *   **`/dashboard`**: Pages for the main user dashboard after login (generate, library, profile, subscription).
    *   **`/components`**: Reusable UI components.
        *   **`/auth`**: Components related to authentication.
        *   **`/dashboard`**: Components specific to the dashboard.
        *   **`/shared`**: Components used across different parts of the application.
        *   **`/ui`**: General UI components (buttons, cards, dialogs, etc.), likely from a UI library like Shadcn/ui.
    *   **`/hooks`**: Custom React hooks.
    *   **`/lib`**: Utility functions and libraries.
        *   **`/supabase`**: Supabase client setup.
    *   **`/types`**: TypeScript type definitions.
    *   **`/ai`**: Artificial intelligence related code, likely for melody generation.
        *   **`/flows`**: Genkit flows for AI tasks.
*   **`/public`**: Static assets like images and HTML files.
*   **`/functions`**: Firebase Cloud Functions.
*   **`/dataconnect`**: Configuration for Firebase Data Connect.
*   **`/docs`**: Project documentation.
*   **`.idx`**: IDX-specific configuration files.
*   **`.vscode`**: VS Code editor settings.

### Main Technologies Used:

*   **Next.js**: React framework for server-side rendering and static site generation.
*   **TypeScript**: Superset of JavaScript that adds static typing.
*   **Tailwind CSS**: Utility-first CSS framework.
*   **Firebase**: Backend-as-a-Service platform providing:
    *   Authentication
    *   Firestore (NoSQL database)
    *   Cloud Functions (serverless backend logic)
    *   Storage
    *   App Hosting
    *   Data Connect
*   **Genkit (implied by `src/ai/genkit.ts`)**: An AI framework, likely used for the melody generation feature.
*   **Stripe (implied by "Subscription Management")**: Payment processing platform.

## Detailed Explanation of Features:

### User Authentication:

*   Located in `src/app/(auth)/` and `src/components/auth/`.
*   Provides forms for user sign-up (`SignupForm.tsx`) and login (`LoginForm.tsx`).
*   Uses Firebase Authentication for managing user accounts.
*   `AuthSessionProvider.tsx` likely manages the user's session state.
*   `useAuthSession.ts` is probably a custom hook to access authentication state.

### User Profile:

*   Located in `src/app/dashboard/profile/page.tsx` and `src/components/dashboard/ProfileClient.tsx`.
*   Fetches user information from the backend (likely Firestore via Firebase).
*   Allows users to view and potentially update their profile details.

### Melody Library:

*   Located in `src/app/dashboard/library/page.tsx` and `src/components/dashboard/MelodyList.tsx`.
*   Displays a list of melodies, likely stored in Firestore.
*   `MelodyCard.tsx` is probably used to display individual melodies.
*   May include search and filtering capabilities (not explicitly shown but mentioned in the blueprint).

### AI Melody Generation:

*   Located in `src/app/dashboard/generate/page.tsx` and `src/components/dashboard/MelodyGenerationClient.tsx`.
*   A form (`MelodyGenerationClient.tsx`) takes user input (e.g., prompt, genre, mood).
*   This input is sent to the backend, likely processed by AI models using Genkit (`src/ai/genkit.ts`, `src/ai/flows/generate-melody-from-prompt.ts`).
*   `src/parseTextToMidi.ts` suggests that the AI might generate a textual representation of music that then gets converted to MIDI.
*   The generated output could be MIDI files or even vocal tracks.
*   `src/ai/flows/summarize-melody-details.ts` might be used to create descriptions or tags for generated melodies.

### Subscription Management:

*   Located in `src/app/dashboard/subscription/page.tsx` and `src/components/dashboard/SubscriptionClient.tsx`.
*   Displays the user's current subscription status.
*   Provides a link to Stripe for users to manage their subscription details and payments.

### UI Components:

*   The project uses a rich set of UI components, found in `src/components/ui/`. These include common elements like buttons, cards, dialogs, forms, input fields, navigation elements (menubar, sidebar), and more. This suggests a well-structured and consistent user interface.
*   `tailwind.config.ts` and `postcss.config.mjs` configure Tailwind CSS.
*   `globals.css` contains global styles.

### Backend and Cloud Functions:

*   Firebase is the primary backend.
*   `firebase.json`, `firestore.indexes.json`, `firestore.rules`, `storage.rules` are Firebase configuration files.
*   `functions/src/index.ts` is the entry point for Firebase Cloud Functions. These functions would handle backend logic that cannot be done on the client-side, such as:
    *   Securely interacting with Firebase services.
    *   Calling AI models (Genkit flows).
    *   Interacting with the Stripe API for subscription management.
*   `dataconnect/` folder suggests the use of Firebase Data Connect for querying and mutating data.

### Development and Tooling:

*   `package.json` and `package-lock.json` manage project dependencies for the Next.js app.
*   `functions/package.json` and `functions/package-lock.json` manage dependencies for the Firebase Functions.
*   `tsconfig.json` (and variants) configure the TypeScript compiler.
*   `.idx/dev.nix` is a Nix environment configuration, likely for ensuring a consistent development environment within Google's IDX.
*   `next.config.ts` is the configuration file for Next.js.

## How It Works (High-Level Flow):

1.  **User signs up or logs in:** Firebase Authentication verifies credentials.
2.  **User navigates the dashboard:** Next.js handles routing. The UI is built with React components and styled with Tailwind CSS.
3.  **To generate a melody:**
    *   The user fills a form in `MelodyGenerationClient.tsx`.
    *   The client sends a request (likely to a Firebase Cloud Function).
    *   The Cloud Function invokes a Genkit flow (`generate-melody-from-prompt.ts`).
    *   The AI model processes the input and generates melody data.
    *   This data might be converted to MIDI using `parseTextToMidi.ts`.
    *   The result is returned to the client and presented to the user.
    *   Generated melodies might be saved to Firestore via Data Connect or Cloud Functions.
4.  **To view melodies:**
    *   `MelodyList.tsx` fetches melody data from Firestore.
    *   Melodies are displayed using `MelodyCard.tsx`.
5.  **To manage subscription:**
    *   `SubscriptionClient.tsx` displays current status (possibly fetched from Firestore or via a Cloud Function that calls Stripe).
    *   User is redirected to Stripe's portal for payment and subscription changes.

This `information.md` file provides a comprehensive overview based on the project's file structure and the initial blueprint. It covers core features, styling, project structure, key technologies, and a high-level operational flow.
