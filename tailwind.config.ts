import type { Config } from "tailwindcss";

const config = {
  darkMode: ["class"],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}', // Make sure this covers your project structure
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        // Primary color (Purple-ish from reference)
        primary: {
          DEFAULT: "hsl(var(--primary))", // Define --primary in globals.css
          foreground: "hsl(var(--primary-foreground))",
        },
        // Secondary color (Teal-ish from reference)
        secondary: {
          DEFAULT: "hsl(var(--secondary))", // Define --secondary in globals.css
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        // Added surface color for darker elements like navbar/footer background
        surface: {
          DEFAULT: "hsl(var(--surface))", // Define --surface in globals.css
          foreground: "hsl(var(--foreground))",
        }
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        // Adding custom animations from index.html <style>
        backgroundPulse: {
          '0%, 100%': { opacity: '0.8' },
          '50%': { opacity: '1' },
        },
        cardGlow: {
          '0%, 100%': { opacity: '0.5' },
          '50%': { opacity: '1' },
        },
        badgePulse: {
          '0%, 100%': { 
            boxShadow: '0 0 10px rgba(3, 218, 198, 0.2)',
            background: 'rgba(3, 218, 198, 0.2)',
           },
          '50%': { 
            boxShadow: '0 0 20px rgba(3, 218, 198, 0.4)',
            background: 'rgba(3, 218, 198, 0.3)',
          },
        },
        modalSlideIn: {
          from: { transform: 'translateY(-30px) scale(0.95)', opacity: '0' },
          to: { transform: 'translateY(0) scale(1)', opacity: '1' },
        },
        spin: { // Ensure spin is defined if not already by plugins
          from: { transform: 'rotate(0deg)' },
          to: { transform: 'rotate(360deg)' },
        },
        bounce: { // Keep existing bounce if needed, or use this one
          '0%, 100%': { 
            transform: 'translateY(0)',
            animationTimingFunction: 'cubic-bezier(0.8, 0, 1, 1)',
          },
          '50%': { 
            transform: 'translateY(-15px)',
            animationTimingFunction: 'cubic-bezier(0, 0, 0.2, 1)',
           },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        // Mapping animations
        'background-pulse': 'backgroundPulse 15s ease-in-out infinite',
        'card-glow': 'cardGlow 2s infinite',
        'badge-pulse': 'badgePulse 2s infinite',
        'modal-slide-in': 'modalSlideIn 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
        'spin': 'spin 1s linear infinite', // Ensure spin is mapped
        'bounce': 'bounce 2s infinite', // Map bounce animation
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;

export default config;
