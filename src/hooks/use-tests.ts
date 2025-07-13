
"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "./use-auth";
import { db } from "@/lib/firebase";
import {
  collection,
  query,
  where,
  getDocs,
  addDoc,
  writeBatch,
  doc,
  Timestamp,
} from "firebase/firestore";
import type { Test } from "@/types";

let cachedTests: Test[] = [];
let cachePsid: string | null = null;
let lastFetchTime: number = 0;
const CACHE_DURATION = 1000 * 5; // 5 seconds

export const fetchTests = async (psid: string, force = false): Promise<Test[]> => {
  const now = Date.now();
  if (!force && cachePsid === psid && cachedTests.length > 0 && now - lastFetchTime < CACHE_DURATION) {
    return cachedTests;
  }

  if (!db) {
    console.error("Firestore not initialized.");
    return [];
  }

  try {
    const q = query(
      collection(db, "tests"),
      where("psid", "==", psid)
    );
    const querySnapshot = await getDocs(q);
    const userTests = querySnapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        startDate: (data.startDate as Timestamp).toDate().toISOString(),
        endDate: (data.endDate as Timestamp).toDate().toISOString(),
      } as Test;
    });

    userTests.sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());

    cachedTests = userTests;
    cachePsid = psid;
    lastFetchTime = now;

    return userTests;
  } catch (error) {
    console.error("Error fetching tests:", error);
    if (error instanceof Error && error.message.includes("indexes?create_composite")) {
      console.warn("Firestore index required. Please create the composite index in the Firebase console.");
    }
    return [];
  }
};

export function useTests() {
  const { psid, loading: authLoading } = useAuth();
  const [tests, setTests] = useState<Test[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  const getTests = useCallback(async (currentPsid: string) => {
    if (!db) {
      setTests([]);
      setIsLoaded(true);
      return;
    }
    setIsLoaded(false);
    const userTests = await fetchTests(currentPsid, true);
    setTests(userTests);
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    if (!authLoading) {
      if (psid) {
        getTests(psid);
      } else {
        setTests([]);
        cachedTests = [];
        cachePsid = null;
        setIsLoaded(true);
      }
    }
  }, [psid, authLoading, getTests]);

  const addAllTests = useCallback(
    async (testsToAdd: Omit<Test, "id" | "psid">[]) => {
      if (!psid || !db) return;
      
      const batch = writeBatch(db);
      
      testsToAdd.forEach(testData => {
        const docRef = doc(collection(db, "tests"));
        const dataToSet: any = {
          ...testData,
          psid,
          startDate: new Date(testData.startDate),
          endDate: new Date(testData.endDate),
        };
        if (testData.syllabus) {
            dataToSet.syllabus = testData.syllabus;
        }
        batch.set(docRef, dataToSet);
      });
      
      await batch.commit();
      await getTests(psid); // Re-fetch after adding
    },
    [psid, getTests]
  );

  return { tests, isLoaded, addAllTests };
}
