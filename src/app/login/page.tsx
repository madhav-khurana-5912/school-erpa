// src/app/login/page.tsx
"use client";

import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useAuth } from '@/hooks/use-auth';
import { useRouter } from 'next/navigation';
import { auth } from '@/lib/firebase';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertTriangle, Loader2 } from 'lucide-react';

const formSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email." }),
  password: z.string().min(6, { message: "Password must be at least 6 characters." }),
});

function LoginPageContent() {
  const [isSignUp, setIsSignUp] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const { user, loading, signInWithEmail, signUpWithEmail } = useAuth();
  const router = useRouter();
  const isFirebaseConfigured = !!auth;

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  React.useEffect(() => {
    if (user) {
      router.push('/');
    }
  }, [user, router]);

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setError(null);
    try {
      if (isSignUp) {
        await signUpWithEmail(values.email, values.password);
      } else {
        await signInWithEmail(values.email, values.password);
      }
      // Redirect is handled by the auth hook
    } catch (err: any) {
        if (err.code === 'auth/user-not-found') {
            setError("No account found with this email. Please sign up.");
        } else if (err.code === 'auth/wrong-password') {
            setError("Incorrect password. Please try again.");
        } else if (err.code === 'auth/email-already-in-use') {
            setError("This email is already in use. Please sign in.");
        }
        else {
            setError("An unexpected error occurred. Please try again.");
            console.error(err);
        }
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">{isSignUp ? 'Create an Account' : 'Welcome Back'}</CardTitle>
          <CardDescription>{isSignUp ? 'Enter your details to get started' : 'Sign in to continue to your study planner'}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
           {!isFirebaseConfigured ? (
             <Alert variant="destructive">
               <AlertTriangle className="h-4 w-4" />
               <AlertTitle>Configuration Error</AlertTitle>
               <AlertDescription>
                 Firebase is not configured. Please add your credentials to the .env file and restart the server.
               </AlertDescription>
             </Alert>
           ) : (
            <>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="email"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Email</FormLabel>
                                    <FormControl>
                                        <Input type="email" placeholder="name@example.com" {...field} />
                                    </FormControl>
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
                                    <FormControl>
                                        <Input type="password" placeholder="••••••••" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        {error && (
                            <Alert variant="destructive" className="text-xs">
                                <AlertTriangle className="h-4 w-4" />
                                <AlertDescription>{error}</AlertDescription>
                            </Alert>
                        )}
                        <Button type="submit" disabled={loading} className="w-full">
                            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            {isSignUp ? 'Sign Up' : 'Sign In'}
                        </Button>
                    </form>
                </Form>
            </>
           )}
        </CardContent>
        {isFirebaseConfigured && (
            <CardFooter className="flex justify-center text-sm">
                <p>
                    {isSignUp ? "Already have an account?" : "Don't have an account?"}
                    <Button variant="link" className="p-1" onClick={() => {setIsSignUp(!isSignUp); setError(null)}}>
                        {isSignUp ? "Sign In" : "Sign Up"}
                    </Button>
                </p>
            </CardFooter>
        )}
      </Card>
    </div>
  );
}

export default function LoginPage() {
    return (
      // The main AuthProvider is in the root layout, so we don't need another one here.
      // But we need a wrapper to call useAuth.
      <LoginPageContent />
    )
}
