
// src/hooks/use-auth.tsx
"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { onAuthStateChanged, signOut, User, createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { fetchTasks } from './use-tasks';

interface AuthContextType {
  user: User | null;
  loading: boolean;
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
      console.error("Firebase not initialized. Cannot set up auth listeners.");
      setLoading(false);
      if (pathname !== '/login') {
        router.push('/login');
      }
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
        setUser(currentUser);
        setLoading(false);
        if (currentUser && pathname === '/login') {
          router.push('/');
        }
      });

      return () => unsubscribe();
    
  }, [pathname, router]);


  const signInWithEmail = async (email: string, pass: string) => {
    if (!auth) throw new Error("Firebase not initialized.");
    setLoading(true);
    try {
        const userCredential = await signInWithEmailAndPassword(auth, email, pass);
        if (userCredential.user) {
          await fetchTasks(userCredential.user.uid, true); // Pre-fetch tasks
        }
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
      setUser(null); 
      router.push('/login');
    } catch (error) {
        console.error("Error signing out", error);
    } finally {
        setLoading(false);
    }
  };

  const value = { user, loading, signInWithEmail, signUpWithEmail, logout };

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
