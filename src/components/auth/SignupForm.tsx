"use client";

import { useState, useEffect } from 'react'; // Import useEffect
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { AuthFormWrapper } from './AuthFormWrapper';
import { Mail, Lock, UserPlus } from 'lucide-react';
import { useRouter } from 'next/navigation';

const signupSchema = z.object({
  email: z.string().email({ message: 'Invalid email address' }),
  password: z.string().min(6, { message: 'Password must be at least 6 characters' }),
  confirmPassword: z.string(),
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"], 
});

type SignupFormValues = z.infer<typeof signupSchema>;

const turnstileSiteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;

export function SignupForm() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const [isClient, setIsClient] = useState(false); // State to track client-side mount

  useEffect(() => {
    setIsClient(true); // Set to true after component mounts on client
  }, []);

  const form = useForm<SignupFormValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      email: '',
      password: '',
      confirmPassword: '',
    },
  });

  const onSubmit = async (data: SignupFormValues) => {
    setIsLoading(true);
    try {
      const turnstileToken = (document.querySelector('.cf-turnstile') as any)?.dataset.response;

      if (!turnstileToken) {
        toast({
          title: 'Verification Required',
          description: 'Please complete the bot verification.',
          variant: 'destructive',
        });
        setIsLoading(false);
        return;
      }

      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: data.email,
          password: data.password,
          turnstileToken: turnstileToken,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        toast({
          title: result.error || 'Signup Failed',
          description: result.message || 'An error occurred during signup.',
          variant: 'destructive',
        });
      } else {
        toast({
          title: result.message || 'Signup Successful!',
          description: result.description || 'Please check your email to confirm your account.',
        });
        router.push('/login?message=signup_success');
      }
    } catch (err: any) {
      console.error('Client-side error during signup submission:', err);
      toast({
        title: 'An Unexpected Error Occurred',
        description: err.message || 'Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthFormWrapper
      title="Create an Account"
      description="Join Tricion Studio to start creating music."
      footerText="Already have an account?"
      footerLinkText="Log In"
      footerLinkHref="/login"
    >
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* ... email, password, confirmPassword fields ... */}
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              id="email"
              type="email"
              placeholder="you@example.com"
              {...form.register('email')}
              className="pl-10"
              aria-invalid={form.formState.errors.email ? "true" : "false"}
            />
          </div>
          {form.formState.errors.email && (
            <p className="text-sm text-destructive">{form.formState.errors.email.message}</p>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              {...form.register('password')}
              className="pl-10"
              aria-invalid={form.formState.errors.password ? "true" : "false"}
            />
          </div>
          {form.formState.errors.password && (
            <p className="text-sm text-destructive">{form.formState.errors.password.message}</p>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="confirmPassword">Confirm Password</Label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              id="confirmPassword"
              type="password"
              placeholder="••••••••"
              {...form.register('confirmPassword')}
              className="pl-10"
              aria-invalid={form.formState.errors.confirmPassword ? "true" : "false"}
            />
          </div>
          {form.formState.errors.confirmPassword && (
            <p className="text-sm text-destructive">{form.formState.errors.confirmPassword.message}</p>
          )}
        </div>

        {/* Cloudflare Turnstile Widget - Render only on client-side after mount */}
        {isClient && turnstileSiteKey && (
          <div
            className="cf-turnstile"
            data-sitekey={turnstileSiteKey}
          ></div>
        )}

        <Button type="submit" className="w-full bg-primary hover:bg-primary/90" disabled={isLoading}>
          {isLoading ? 'Signing Up...' : <> <UserPlus className="mr-2 h-5 w-5" /> Sign Up </>}
        </Button>
      </form>
    </AuthFormWrapper>
  );
}
