// src/hooks/use-auth.tsx
"use client";

import React, { createContext, useContext, useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { onAuthStateChanged, signOut, User, createUserWithEmailAndPassword, signInWithEmailAndPassword, GoogleAuthProvider, signInWithRedirect, getRedirectResult } from 'firebase/auth';
import { auth } from '@/lib/firebase';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signInWithEmail: (email: string, pass: string) => Promise<void>;
  signUpWithEmail: (email: string, pass: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
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
    
    // Check for redirect result on initial load
    getRedirectResult(auth)
      .then((result) => {
        if (result) {
          // User signed in via redirect.
          setUser(result.user);
        }
      })
      .catch((error) => {
        console.error("Error getting redirect result:", error);
      })
      .finally(() => {
         // Subscribe to future auth state changes
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            setUser(currentUser);
            setLoading(false);
        });
        return () => unsubscribe();
      });

  }, []);

  useEffect(() => {
    if (!loading && user && pathname === '/login') {
        router.push('/');
    }
  }, [user, loading, router, pathname]);

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
  
  const signInWithGoogle = async () => {
    if (!auth) throw new Error("Firebase not initialized.");
    setLoading(true);
    const provider = new GoogleAuthProvider();
    try {
      await signInWithRedirect(auth, provider);
      // The redirect will cause the page to unload, so no need to setLoading(false) here.
    } catch (error) {
      console.error("Error during Google sign-in redirect", error);
      setLoading(false);
    }
  };

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

  const value = { user, loading, signInWithEmail, signUpWithEmail, logout, signInWithGoogle };
  
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
