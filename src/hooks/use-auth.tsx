// src/hooks/use-auth.tsx
"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
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
    // This effect should only run once on mount to set up the listener
    // and handle the initial redirect result.
    if (!auth) {
      setLoading(false);
      // If firebase isn't configured, we shouldn't be on any page but login
      if (pathname !== '/login') {
        router.push('/login');
      }
      return;
    }

    // This handles the result from a redirect sign-in. It's crucial to call
    // this on page load to see if we're coming back from a redirect.
    getRedirectResult(auth)
      .then((result) => {
        if (result) {
          // User has been successfully signed in via redirect.
          setUser(result.user);
          router.push('/');
        }
      })
      .catch((error) => {
        // Handle errors here, such as account-exists-with-different-credential
        console.error("Error getting redirect result:", error);
      })
      .finally(() => {
        // The onAuthStateChanged listener will handle setting the user
        // for all other cases (e.g., page refresh, direct visit).
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
          setUser(currentUser);
          setLoading(false);
          if (currentUser && pathname === '/login') {
            router.push('/');
          }
        });
        
        // Cleanup subscription on unmount
        return () => unsubscribe();
      });
      
  }, []); // Empty dependency array ensures this runs only once.


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
    if (!auth) {
        throw new Error("Firebase is not initialized. Cannot sign in with Google.");
    }
    setLoading(true);
    const provider = new GoogleAuthProvider();
    // This will navigate the user away to Google's sign-in page.
    await signInWithRedirect(auth, provider);
  };

  const logout = async () => {
    if (!auth) {
        console.error("Firebase not initialized. Check your .env file.");
        return;
    }
    setLoading(true);
    try {
      await signOut(auth);
      setUser(null); 
      router.push('/login');
    } catch (error) {
        console.error("Error signing out", error);
    } finally {
        setLoading(false);
    }
  };

  const value = { user, loading, signInWithEmail, signUpWithEmail, logout, signInWithGoogle };

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
