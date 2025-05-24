"use client";

import React from 'react';
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/shared/Logo";
import Link from "next/link";
import {
  ArrowRight,
  Library,
  LogOut,
  Music,
  Bot,
  FastForward,
} from "lucide-react";

const AuthButtons = () => {
  const isLoggedIn = false; // This should be dynamically determined based on auth status
  const userEmail = "user@example.com"; // This should be dynamically determined

  return (
    <div className="flex items-center gap-4">
      {isLoggedIn ? (
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="sm"
            className="hidden md:flex items-center gap-2 text-gray-300 border-gray-700 hover:bg-gray-800 hover:text-white"
            asChild
          >
            <Link href="/dashboard/library">
              <Library className="h-4 w-4" />
              <span>Library</span>
            </Link>
          </Button>
          <span
            className="text-sm text-gray-300 hidden lg:block truncate max-w-[150px]"
            title={userEmail}
          >
            {userEmail}
          </span>
          <Button
            variant="destructive"
            size="sm"
            className="flex items-center gap-1 bg-red-600/20 border border-red-500/30 text-red-400 rounded-lg hover:bg-red-600/40 hover:text-red-300 transition-colors"
          >
            <LogOut className="h-4 w-4" />
            <span className="text-sm hidden sm:inline">Logout</span>
          </Button>
        </div>
      ) : (
        <Button
          variant="outline"
          className="flex items-center gap-2 text-gray-300 border-gray-700 hover:bg-gray-800 hover:text-white"
          asChild
        >
          <Link href="/login">
            <ArrowRight className="h-4 w-4" />
            <span>Login / Register</span>
          </Link>
        </Button>
      )}
    </div>
  );
};

const ContactPage: React.FC = () => {
  return (
    <div className="min-h-screen font-sans">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-surface/60 backdrop-blur-lg border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-8">
              <Link href="/" className="flex items-center">
                <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary px-2 py-1 rounded-md">
                  Tricion Studio
                </span>
              </Link>
              <div className="hidden md:flex items-center gap-6">
                <Link href="learn-more" className="text-gray-300 hover:text-white text-sm">
                  Learn More
                </Link>
                <Link href="/dashboard/generate" className="text-gray-300 hover:text-white text-sm">
                  Generator
                </Link>
                <Link href="/vocal-gen" className="text-gray-300 hover:text-secondary text-sm">
                  Vocal Gen
                </Link>
                <Link href="/pricing" className="text-gray-300 hover:text-white text-sm">
                  Pricing
                </Link>
                <Link href="/about" className="text-gray-300 hover:text-white text-sm">
                  About Us
                </Link>
                <Link href="/faq" className="text-gray-300 hover:text-white text-sm">
                  FAQ
                </Link>
              </div>
            </div>
            <AuthButtons />
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="pt-24 pb-16">
        <div className="max-w-2xl mx-auto text-center p-4">
          <h1 className="text-3xl font-bold text-white mb-6">Who is Ivan?</h1>
          <p className="text-lg leading-relaxed text-gray-300 mb-8">
            Ivan is a passionate music producer who has made his mark in the Phonk music scene since launching his career in 2023. With a strong commitment to quality, he strives to deliver high-caliber work that exceeds expectations.
          </p>
          <p className="text-lg leading-relaxed text-gray-300 mb-8">
            Known for his musicality and attention to detail, Ivan understands that the creative process can feel risky for clients. That’s why he emphasizes clear communication and a collaborative approach. His proactive style includes offering multiple options and making swift adjustments to ensure your vision comes to life.
          </p>
          <p className="text-lg leading-relaxed text-gray-300 mb-8">
            With a talent for crafting catchy tunes and embracing new genres, Ivan specializes in original, hard-hitting tracks that resonate with audiences. Whether you’re looking for a remix or a fresh production, he’s dedicated to helping you achieve your musical goals.
          </p>

          <h2 className="text-2xl font-semibold text-purple-400 mt-8 mb-4">Ivan van der Schuit</h2>
          <p className="text-lg text-gray-300 mb-4">
            Contact me by Email or social media
          </p>
          <p className="text-lg text-gray-300 mb-2">
            Inquiries: <a href="mailto:Tricionmedia@gmail.com" className="text-purple-400 hover:underline">Tricionmedia@gmail.com</a>
          </p>
          <p className="text-lg text-gray-300">
            Instagram: <a href="https://www.instagram.com/ivannl_/" target="_blank" rel="noopener noreferrer" className="text-purple-400 hover:underline">@ivannl_</a>
          </p>
        </div>
      </main>
    </div>
  );
};

export default ContactPage;
