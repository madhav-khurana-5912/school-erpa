// src/app/login/page.tsx
"use client";

import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useAuth } from '@/hooks/use-auth';
import { useRouter } from 'next/navigation';
import { auth } from '@/lib/firebase';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertTriangle, Eye, Loader2 } from 'lucide-react';
import Link from 'next/link';

const formSchema = z.object({
  psid: z.string().min(1, { message: "Please enter a valid PSID/Mobile No." }),
  password: z.string().min(6, { message: "Password must be at least 6 characters." }),
});

const AakashLogo = () => (
    <div className="flex flex-col items-center mb-6">
        <svg width="150" height="50" viewBox="0 0 150 50" className="text-blue-600" xmlns="http://www.w3.org/2000/svg">
            {/* Circle with 'A' */}
            <circle cx="75" cy="12" r="10" fill="none" stroke="currentColor" strokeWidth="1.5"/>
            <path d="M72 15L75 9L78 15" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M73.5 13H76.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            
            {/* Aakash Text */}
            <text x="75" y="38" fontFamily="Arial, sans-serif" fontSize="18" fontWeight="bold" fill="#00A9E0" textAnchor="middle">Aakash</text>
            
            {/* Subtitle */}
            <text x="75" y="48" fontFamily="Arial, sans-serif" fontSize="6" fill="#E53935" textAnchor="middle">
                Medical | IIT-JEE | Foundations
            </text>
        </svg>
    </div>
);


function LoginPageContent() {
  const [isSignUp, setIsSignUp] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const { user, loading, signInWithEmail, signUpWithEmail } = useAuth();
  const router = useRouter();

  const isFirebaseConfigured = !!auth;

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      psid: "",
      password: "",
    },
  });

  React.useEffect(() => {
    if (!loading && user) {
      router.push('/');
    }
  }, [user, loading, router]);

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setError(null);
    try {
      if (isSignUp) {
        await signUpWithEmail(values.psid, values.password);
      } else {
        await signInWithEmail(values.psid, values.password);
      }
    } catch (err: any) {
        if (err.code === 'auth/user-not-found' || err.code === 'auth/invalid-credential') {
            setError("No account found with this PSID. Please sign up.");
        } else if (err.code === 'auth/wrong-password') {
            setError("Incorrect password. Please try again.");
        } else if (err.code === 'auth/email-already-in-use') {
            setError("This PSID is already in use. Please sign in.");
        } else if (err.code === 'auth/invalid-email') {
            setError("Invalid PSID format. The PSID is used to create a unique identifier.");
        }
        else {
            setError(`An unexpected error occurred: ${err.message}`);
            console.error(err);
        }
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-white">
      <div className="w-full max-w-sm p-8 space-y-6">
        <AakashLogo />

        <div className="text-left">
          <h1 className="text-2xl font-bold">{isSignUp ? 'Create an Account' : 'Login to your account'}</h1>
        </div>

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
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="psid"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>PSID/Mobile No.</FormLabel>
                      <FormControl>
                        <Input type="text" {...field} className="bg-white" />
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
                        <div className="flex items-center justify-between">
                            <FormLabel>Password</FormLabel>
                            {!isSignUp && (
                                <Link href="#" className="text-sm text-blue-600 hover:underline">
                                    Forgot Password?
                                </Link>
                            )}
                        </div>
                      <div className="relative">
                        <FormControl>
                          <Input type="password" {...field} className="bg-white pr-10" />
                        </FormControl>
                        <Button type="button" variant="ghost" size="icon" className="absolute inset-y-0 right-0 h-full w-10 text-muted-foreground">
                            <Eye className="h-4 w-4" />
                        </Button>
                      </div>
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

                <Button type="submit" disabled={loading} className="w-full bg-gray-200 text-gray-500 hover:bg-gray-300">
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {isSignUp ? 'Sign Up' : 'Login'}
                </Button>
              </form>
            </Form>

            <div className="text-center text-sm text-gray-500">
              {isSignUp ? "Already have an account?" : "Don't have an account?"}
              <Button variant="link" className="p-1 text-blue-600" onClick={() => { setIsSignUp(!isSignUp); setError(null); }}>
                {isSignUp ? "Sign In" : "Sign Up"}
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default function LoginPage() {
    return <LoginPageContent />;
}
