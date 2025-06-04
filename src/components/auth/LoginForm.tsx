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
import { Mail, Lock, LogIn as LogInIcon } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';

const loginSchema = z.object({
  email: z.string().email({ message: 'Invalid email address' }),
  password: z.string().min(6, { message: 'Password must be at least 6 characters' }),
});

type LoginFormValues = z.infer<typeof loginSchema>;

const turnstileSiteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;

export function LoginForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const plan = searchParams.get('plan');
  const [isClient, setIsClient] = useState(false); // State to track client-side mount

  useEffect(() => {
    setIsClient(true); // Set to true after component mounts on client
  }, []);

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (data: LoginFormValues) => {
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

      const response = await fetch('/api/auth/login', {
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
          title: result.error || 'Login Failed',
          description: result.message || 'An error occurred during login.',
          variant: 'destructive',
        });
      } else {
        toast({
          title: result.message || 'Login Successful',
          description: result.description || "Welcome back!",
        });
        router.push('/dashboard');
      }
    } catch (err: any) {
      console.error('Client-side error during login submission:', err);
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
      title={plan ? `Log In to Subscribe to ${plan}` : "Welcome Back!"}
      description="Log in to continue to Tricion Studio."
      footerText={
        plan
          ? `Don't have an account and want to subscribe to ${plan}?`
          : "Don't have an account?"
      }
      footerLinkHref={
        plan
          ? `/signup?plan=${plan}`
          : "/signup"
      }
      footerLinkText="Sign Up"
    >
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* ... email and password fields ... */}
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

         {/* Cloudflare Turnstile Widget - Render only on client-side after mount */}
         {isClient && turnstileSiteKey && (
          <div
            className="cf-turnstile"
            data-sitekey={turnstileSiteKey}
          ></div>
        )}

        <Button type="submit" className="w-full bg-primary hover:bg-primary/90" disabled={isLoading}>
          {isLoading ? 'Logging In...' : <> <LogInIcon className="mr-2 h-5 w-5" /> Log In </>}
        </Button>
      </form>
    </AuthFormWrapper>
  );
}
