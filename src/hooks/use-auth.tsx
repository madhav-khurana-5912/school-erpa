// src/hooks/use-auth.tsx
"use client";

import React, { createContext, useContext, useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { onAuthStateChanged, signOut, User, createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '@/lib/firebase';

interface AuthContextType {
  user: User | null;
  psid: string | null;
  loading: boolean;
  signInWithEmail: (psid: string, pass: string) => Promise<void>;
  signUpWithEmail: (psid: string, pass: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [psid, setPsid] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!auth) {
      console.error("Firebase not initialized. Cannot set up auth listeners.");
      setLoading(false);
      if (pathname !== '/login') {
        router.push('/login');
      }
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
        setUser(currentUser);
        if (currentUser && currentUser.email) {
          const userPsid = currentUser.email.split('@')[0];
          setPsid(userPsid);
        } else {
          setPsid(null);
        }
        setLoading(false);
        if (currentUser && pathname === '/login') {
          router.push('/');
        }
      });

      return () => unsubscribe();
    
  }, [pathname, router]);


  const signInWithEmail = async (psid: string, pass: string) => {
    if (!auth) throw new Error("Firebase not initialized.");
    const email = `${psid}@example.com`;
    setLoading(true);
    try {
        await signInWithEmailAndPassword(auth, email, pass);
    } catch (error) {
        setLoading(false);
        throw error;
    }
  }

  const signUpWithEmail = async (psid: string, pass: string) => {
    if (!auth) throw new Error("Firebase not initialized.");
    const email = `${psid}@example.com`;
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
      // Explicitly clear user and psid state
      setUser(null); 
      setPsid(null);
      // After signing out, redirect to login page
      router.push('/login');
    } catch (error) {
        console.error("Error signing out", error);
    } finally {
        setLoading(false);
    }
  };

  const value = { user, psid, loading, signInWithEmail, signUpWithEmail, logout };

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
