'use client';

import { useState, useActionState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { signUpAction, loginAction } from '@/lib/actions';
import { useToast } from '@/hooks/use-toast';
import { getAuth, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { AppLogo } from '../icons';
import Image from 'next/image';
import { Check } from 'lucide-react';

const loginSchema = z.object({
  email: z.string().email({ message: 'Please enter a valid email address.' }),
  password: z.string().min(1, { message: 'Password cannot be empty.' }),
});

const signUpSchema = z.object({
  firstName: z.string().min(1, { message: 'First name cannot be empty.' }),
  lastName: z.string().min(1, { message: 'Last name cannot be empty.' }),
  email: z.string().email({ message: 'Please enter a valid email address.' }),
  password: z.string().min(6, { message: 'Password must be at least 6 characters.' }),
});

interface AuthDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onSuccess: () => void;
}

export function AuthDialog({ isOpen, onOpenChange, onSuccess }: AuthDialogProps) {
  const { toast } = useToast();
  const [isSigningUp, setIsSigningUp] = useState(false);

  const handleAuthSuccess = () => {
    toast({
      title: 'Success!',
      description: `You are now logged in.`,
    });
    onSuccess();
    onOpenChange(false);
  };
  
  const handleGoogleSignIn = async () => {
    const auth = getAuth();
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
      handleAuthSuccess();
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Google Sign-In Failed',
        description: error.message,
      });
    }
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl p-0 overflow-hidden">
        <div className="grid grid-cols-1 md:grid-cols-2 min-h-[600px]">
            <div className="p-8 md:p-12 flex flex-col justify-center">
                <div className="flex flex-col items-center text-center mb-8">
                    <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                      <AppLogo className="h-8 w-8 text-primary" />
                    </div>
                    <h2 className="text-3xl font-bold mb-2">{isSigningUp ? 'Join LexiAI' : 'Welcome Back'}</h2>
                    <p className="text-muted-foreground">{isSigningUp ? 'Create your exclusive membership account' : 'Sign in to your account'}</p>
                </div>

                <Button variant="outline" onClick={handleGoogleSignIn} className="w-full mb-6 h-11">
                  <svg className="mr-2 h-5 w-5" viewBox="0 0 48 48" role="img" aria-label="Google logo">
                    <path fill="#FFC107" d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z" />
                    <path fill="#FF3D00" d="M6.306 14.691l6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 16.318 4 9.656 8.337 6.306 14.691z" />
                    <path fill="#4CAF50" d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238C29.211 35.091 26.715 36 24 36c-5.223 0-9.657-3.344-11.386-7.918l-6.571 4.819C9.656 39.663 16.318 44 24 44z" />
            <path fill="#1976D2" d="M43.611 20.083H24v8h11.303c-.792 2.237-2.231 4.166-4.087 5.571l6.19 5.238C42.012 35.798 44 30.552 44 24c0-1.341-.138-2.65-.389-3.917z" />
                  </svg>
                  Continue with Google
                </Button>

                <div className="relative my-6">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-background px-2 text-muted-foreground">
                      Or continue with email
                    </span>
                  </div>
                </div>
                
                {isSigningUp ? <SignUpForm onSuccess={handleAuthSuccess} /> : <LoginForm onSuccess={handleAuthSuccess} />}
                
                <p className="text-center text-sm text-muted-foreground mt-6">
                    {isSigningUp ? "Already have an account? " : "Don't have an account? "}
                    <Button variant="link" className="p-0 h-auto text-primary font-semibold" onClick={() => setIsSigningUp(!isSigningUp)}>
                        {isSigningUp ? "Sign In" : "Sign Up"}
                    </Button>
                </p>
            </div>
            <div className="hidden md:block relative bg-gradient-to-br from-blue-600 via-blue-700 to-blue-900">
                <Image 
                    src="https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=800&h=1000&fit=crop"
                    alt="Legal workspace"
                    fill
                    className="object-cover opacity-20"
                />
                <div className="absolute inset-0 flex flex-col justify-end p-12 text-white">
                    <h3 className="text-3xl font-bold mb-6">LexiAI</h3>
                    <p className="text-lg mb-6 text-blue-100">For Lawyers, Paralegals, and Legal Professionals</p>
                    <ul className="space-y-3">
                        <li className="flex items-center gap-3"><Check className="h-5 w-5 flex-shrink-0" /> World-class document analysis</li>
                        <li className="flex items-center gap-3"><Check className="h-5 w-5 flex-shrink-0" /> AI-powered contract drafting</li>
                        <li className="flex items-center gap-3"><Check className="h-5 w-5 flex-shrink-0" /> Comprehensive legal research</li>
                        <li className="flex items-center gap-3"><Check className="h-5 w-5 flex-shrink-0" /> Secure and confidential</li>
                    </ul>
                </div>
            </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}


function LoginForm({ onSuccess }: { onSuccess: () => void }) {
  const [state, formAction] = useActionState(loginAction, undefined);
  const { toast } = useToast();
  
  const form = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  useEffect(() => {
    if (state?.success) {
      onSuccess();
    }
    if (state?.error) {
      const errorMsg = ('_errors' in state.error && state.error._errors) 
        ? state.error._errors.join(', ') 
        : 'Login failed. Please check your credentials.';
      toast({
        variant: 'destructive',
        title: 'Login Failed',
        description: errorMsg,
      });
    }
  }, [state, onSuccess, toast]);
  
  const { isSubmitting } = form.formState;

  return (
    <Form {...form}>
      <form action={formAction} className="space-y-4">
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl><Input placeholder="your@email.com" {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Password</FormLabel>
              <FormControl><Input type="password" placeholder="••••••••" {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? "Signing In..." : "Sign In"}
        </Button>
      </form>
    </Form>
  );
}

function SignUpForm({ onSuccess }: { onSuccess: () => void }) {
  const [state, formAction] = useActionState(signUpAction, undefined);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof signUpSchema>>({
    resolver: zodResolver(signUpSchema),
    defaultValues: { firstName: '', lastName: '', email: '', password: '' },
  });
  
  useEffect(() => {
    if (state?.success) {
      onSuccess();
    }
    if (state?.error) {
      const errorMsg = ('_errors' in state.error && state.error._errors) 
        ? state.error._errors.join(', ') 
        : 'Sign up failed. Please try again.';
      toast({
        variant: 'destructive',
        title: 'Sign Up Failed',
        description: errorMsg,
      });
    }
  }, [state, onSuccess, toast]);

  const { isSubmitting } = form.formState;

  return (
    <Form {...form}>
      <form action={formAction} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="firstName"
            render={({ field }) => (
              <FormItem><FormLabel>First Name</FormLabel><FormControl><Input placeholder="John" {...field} /></FormControl><FormMessage /></FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="lastName"
            render={({ field }) => (
              <FormItem><FormLabel>Last Name</FormLabel><FormControl><Input placeholder="Doe" {...field} /></FormControl><FormMessage /></FormItem>
            )}
          />
        </div>
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem><FormLabel>Email</FormLabel><FormControl><Input placeholder="your@email.com" {...field} /></FormControl><FormMessage /></FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem><FormLabel>Password</FormLabel><FormControl><Input type="password" placeholder="••••••••" {...field} /></FormControl><FormMessage /></FormItem>
          )}
        />
        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? "Creating Account..." : "Create Account"}
        </Button>
      </form>
    </Form>
  );
}