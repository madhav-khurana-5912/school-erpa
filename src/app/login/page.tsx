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

const GoogleIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg viewBox="0 0 48 48" {...props}>
      <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12s5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24s8.955,20,20,20s20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"></path>
      <path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"></path>
      <path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"></path>
      <path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.574l6.19,5.238C42.022,35.622,44,30.036,44,24C44,22.659,43.862,21.35,43.611,20.083z"></path>
    </svg>
  );

const formSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email." }),
  password: z.string().min(6, { message: "Password must be at least 6 characters." }),
});

function LoginPageContent() {
  const [isSignUp, setIsSignUp] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const { user, loading, signInWithEmail, signUpWithEmail, signInWithGoogle } = useAuth();
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
                 <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                        <span className="w-full border-t" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                        <span className="bg-background px-2 text-muted-foreground">
                        Or continue with
                        </span>
                    </div>
                </div>
                <Button variant="outline" className="w-full" onClick={signInWithGoogle} disabled={loading}>
                    {loading ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                        <GoogleIcon className="mr-2 h-4 w-4" />
                    )}
                    Google
                </Button>
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
