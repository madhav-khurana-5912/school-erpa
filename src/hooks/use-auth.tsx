// src/hooks/use-auth.tsx
"use client";

import React, { createContext, useContext, useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { onAuthStateChanged, signInWithRedirect, GoogleAuthProvider, signOut, User, createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '@/lib/firebase';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  signInWithEmail: (email: string, pass: string) => Promise<void>;
  signUpWithEmail: (email: string, pass: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!auth) {
        setLoading(false);
        return;
    }
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    // This effect handles redirection based on user state and loading status.
    // It's separate to avoid re-running the auth subscription.
    if (!loading) {
      if (user && pathname === '/login') {
        router.push('/');
      }
    }
  }, [user, loading, router, pathname]);


  const signInWithGoogle = async () => {
    if (!auth) {
        console.error("Firebase not initialized. Check your .env file.");
        return;
    }
    setLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      await signInWithRedirect(auth, provider);
      // The user will be redirected, and onAuthStateChanged will handle the result.
    } catch (error) {
      console.error("Error signing in with Google", error);
      setLoading(false);
    }
  };

  const signInWithEmail = async (email: string, pass: string) => {
    if (!auth) throw new Error("Firebase not initialized.");
    setLoading(true);
    try {
        await signInWithEmailAndPassword(auth, email, pass);
    } catch (error) {
        setLoading(false);
        throw error;
    }
  }

  const signUpWithEmail = async (email: string, pass: string) => {
    if (!auth) throw new Error("Firebase not initialized.");
    setLoading(true);
    try {
        await createUserWithEmailAndPassword(auth, email, pass);
    } catch (error) {
        setLoading(false);
        throw error;
    }
  }

  const logout = async () => {
    if (!auth) {
        console.error("Firebase not initialized. Check your .env file.");
        return;
    }
    setLoading(true);
    try {
      await signOut(auth);
      // After sign out, clear user state and redirect to login
      setUser(null); 
      router.push('/login');
    } catch (error) {
        console.error("Error signing out", error);
    } finally {
        setLoading(false);
    }
  };

  const value = { user, loading, signInWithGoogle, signInWithEmail, signUpWithEmail, logout };
  
  // This handles the case where firebase is not configured.
  // The login page will show an error.
  if (!auth) {
    if (pathname !== '/login') {
        router.push('/login');
        return null; // Render nothing while redirecting
    }
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
