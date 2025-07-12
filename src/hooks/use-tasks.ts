// src/hooks/use-tasks.ts
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
  updateDoc,
  deleteDoc,
  doc,
  orderBy,
  Timestamp,
} from "firebase/firestore";
import type { Task } from "@/types";

// Keep a local cache of tasks to avoid re-fetching on component re-renders.
// This is a simple in-memory cache.
let cachedTasks: Task[] = [];
let cachePsid: string | null = null;
let lastFetchTime: number = 0;
const CACHE_DURATION = 1000 * 5; // 5 seconds

// Export the fetch function to be used outside the hook for pre-fetching.
export const fetchTasks = async (psid: string, force = false): Promise<Task[]> => {
  const now = Date.now();
  if (
    !force &&
    cachePsid === psid &&
    cachedTasks.length > 0 &&
    now - lastFetchTime < CACHE_DURATION
  ) {
    return cachedTasks;
  }
  
  if (!db) {
    console.error("Firestore not initialized.");
    return [];
  }

  try {
    const q = query(
      collection(db, "tasks"),
      where("psid", "==", psid),
      orderBy("date", "asc")
    );
    const querySnapshot = await getDocs(q);
    const userTasks = querySnapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        date: (data.date as Timestamp).toDate().toISOString(),
      } as Task;
    });
    
    // Update cache
    cachedTasks = userTasks;
    cachePsid = psid;
    lastFetchTime = now;
    
    return userTasks;
  } catch (error) {
    console.error("Error fetching tasks:", error);
    return [];
  }
};


export function useTasks() {
  const { psid } = useAuth();
  const [tasks, setTasks] = useState<Task[]>(cachedTasks);
  const [isLoaded, setIsLoaded] = useState(cachedTasks.length > 0);

  const getTasks = useCallback(async () => {
    if (!psid || !db) {
        setTasks([]);
        cachedTasks = [];
        setIsLoaded(true);
        return;
    };

    setIsLoaded(false);
    const userTasks = await fetchTasks(psid);
    setTasks(userTasks);
    setIsLoaded(true);
  }, [psid]);

  useEffect(() => {
    // If the cache is for a different user, or empty, fetch.
    if (psid && (psid !== cachePsid || cachedTasks.length === 0)) {
        getTasks();
    } else {
        // Otherwise, trust the cache but ensure component is updated.
        setTasks(cachedTasks);
        setIsLoaded(true);
    }
  }, [psid, getTasks]);

  const addTask = useCallback(
    async (taskData: Omit<Task, "id" | "completed" | "psid">) => {
      if (!psid || !db) return;
      try {
        await addDoc(collection(db, "tasks"), {
          ...taskData,
          psid: psid,
          completed: false,
          date: new Date(taskData.date),
        });
        const updatedTasks = await fetchTasks(psid, true);
        setTasks(updatedTasks);
      } catch (error) {
        console.error("Error adding task: ", error);
      }
    },
    [psid]
  );

  const updateTask = useCallback(
    async (updatedTask: Task) => {
      if (!psid || !db) return;
      const { id, ...taskData } = updatedTask;
      try {
        await updateDoc(doc(db, "tasks", id), {
            ...taskData,
            date: new Date(taskData.date)
        });
        const updatedTasks = await fetchTasks(psid, true);
        setTasks(updatedTasks);
      } catch (error) {
        console.error("Error updating task: ", error);
      }
    },
    [psid]
  );

  const deleteTask = useCallback(
    async (taskId: string) => {
      if (!psid || !db) return;
      try {
        await deleteDoc(doc(db, "tasks", taskId));
        const updatedTasks = await fetchTasks(psid, true);
        setTasks(updatedTasks);
      } catch (error) {
        console.error("Error deleting task: ", error);
      }
    },
    [psid]
  );

  const toggleTaskCompletion = useCallback(
    async (taskId: string) => {
      if (!psid || !db) return;
      const task = tasks.find((t) => t.id === taskId);
      if (!task) return;
      try {
        await updateDoc(doc(db, "tasks", taskId), {
          completed: !task.completed,
        });
        const updatedTasks = await fetchTasks(psid, true);
        setTasks(updatedTasks);
      } catch (error) {
        console.error("Error toggling task completion: ", error);
      }
    },
    [psid, tasks]
  );

  return { tasks, isLoaded, addTask, updateTask, deleteTask, toggleTaskCompletion };
}
