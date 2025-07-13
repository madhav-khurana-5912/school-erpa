// src/hooks/use-syllabus.ts
"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "./use-auth";
import { db } from "@/lib/firebase";
import {
  collection,
  query,
  where,
  getDocs,
  setDoc,
  doc,
  limit
} from "firebase/firestore";
import type { Syllabus } from "@/types";

let cachedSyllabus: Syllabus | null = null;
let cachePsid: string | null = null;

export function useSyllabus() {
  const { psid, loading: authLoading } = useAuth();
  const [syllabus, setSyllabus] = useState<Syllabus | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  const getSyllabus = useCallback(async (currentPsid: string) => {
    if (cachePsid === currentPsid && cachedSyllabus) {
        setSyllabus(cachedSyllabus);
        setIsLoaded(true);
        return;
    }

    if (!db) {
      setSyllabus(null);
      setIsLoaded(true);
      return;
    }
    setIsLoaded(false);

    try {
      const q = query(
        collection(db, "syllabuses"),
        where("psid", "==", currentPsid),
        limit(1)
      );
      const querySnapshot = await getDocs(q);
      if (!querySnapshot.empty) {
        const doc = querySnapshot.docs[0];
        const userSyllabus = { id: doc.id, ...doc.data() } as Syllabus;
        setSyllabus(userSyllabus);
        cachedSyllabus = userSyllabus;
      } else {
        setSyllabus(null);
        cachedSyllabus = null;
      }
      cachePsid = currentPsid;
    } catch (error) {
      console.error("Error fetching syllabus:", error);
      setSyllabus(null);
      cachedSyllabus = null;
    } finally {
      setIsLoaded(true);
    }
  }, []);

  useEffect(() => {
    if (!authLoading) {
      if (psid) {
        getSyllabus(psid);
      } else {
        setSyllabus(null);
        cachedSyllabus = null;
        cachePsid = null;
        setIsLoaded(true);
      }
    }
  }, [psid, authLoading, getSyllabus]);

  const setSyllabusTopics = useCallback(
    async (topics: string[]) => {
      if (!psid || !db) return;
      
      const docRef = doc(db, "syllabuses", psid);
      const dataToSet = {
          psid,
          topics
      };

      await setDoc(docRef, dataToSet, { merge: true });
      // Force a refresh of the syllabus data after setting it
      await getSyllabus(psid);
    },
    [psid, getSyllabus]
  );
  
  return { syllabus, isLoaded, setSyllabusTopics };
}
