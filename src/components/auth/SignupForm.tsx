"use client";

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { AuthFormWrapper } from './AuthFormWrapper';
import { useAuthSession } from '@/hooks/useAuthSession';
import { Mail, Lock, UserPlus } from 'lucide-react';
import { useRouter }from 'next/navigation';

const signupSchema = z.object({
  email: z.string().email({ message: 'Invalid email address' }),
  password: z.string().min(6, { message: 'Password must be at least 6 characters' }),
  confirmPassword: z.string(),
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"], // path of error
});

type SignupFormValues = z.infer<typeof signupSchema>;

export function SignupForm() {
  const { supabase } = useAuthSession();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

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
      const { data: signUpData, error } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        // Options for email confirmation, user metadata, etc. can be added here
        // options: {
        //   emailRedirectTo: `${window.location.origin}/auth/callback`,
        // }
      });

      if (error) {
        toast({
          title: 'Signup Failed',
          description: error.message,
          variant: 'destructive',
        });
      } else if (signUpData.user && signUpData.user.identities && signUpData.user.identities.length === 0) {
        // This case might indicate an existing user trying to sign up again with a different method or some other issue.
        // Supabase typically returns user data if signup is for an existing unconfirmed account, or if it's a new account.
        // If identities array is empty, it might mean user already exists but is unconfirmed / social.
         toast({
          title: 'Signup Successful - Confirmation Needed',
          description: 'Please check your email to confirm your account before logging in.',
        });
        router.push('/login');
      }
      
      else {
        toast({
          title: 'Signup Successful!',
          description: signUpData.session ? "You're now logged in." : 'Please check your email to confirm your account.',
        });
        // If Supabase auto-confirms or email confirmation is disabled, user might be logged in.
        // Otherwise, they need to confirm email.
        // The AuthSessionProvider will handle redirect if session becomes active.
        // If no immediate session, redirect to login page so they can login after confirmation.
        if (!signUpData.session) {
          router.push('/login?message=confirmation_sent');
        }
      }
    } catch (err) {
      toast({
        title: 'An Unexpected Error Occurred',
        description: 'Please try again.',
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
        <Button type="submit" className="w-full bg-primary hover:bg-primary/90" disabled={isLoading}>
          {isLoading ? 'Signing Up...' : <> <UserPlus className="mr-2 h-5 w-5" /> Sign Up </>}
        </Button>
      </form>
    </AuthFormWrapper>
  );
}
