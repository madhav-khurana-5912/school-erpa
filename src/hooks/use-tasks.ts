
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
  Timestamp,
} from "firebase/firestore";
import type { Task } from "@/types";

// Keep a local cache of tasks to avoid re-fetching on component re-renders.
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
    cachedTasks = [];
    return [];
  }

  try {
    // Query without orderBy to avoid needing a composite index immediately.
    // We will sort the results on the client-side.
    const q = query(
      collection(db, "tasks"),
      where("psid", "==", psid)
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
    
    // Sort tasks by date on the client side
    userTasks.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    
    // Update cache
    cachedTasks = userTasks;
    cachePsid = psid;
    lastFetchTime = now;
    
    return userTasks;
  } catch (error) {
    console.error("Error fetching tasks:", error);
    cachedTasks = [];
    return [];
  }
};


export function useTasks() {
  const { psid, loading: authLoading } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  const getTasks = useCallback(async (currentPsid: string) => {
    if (!db) {
        setTasks([]);
        setIsLoaded(true);
        return;
    };
    setIsLoaded(false);
    const userTasks = await fetchTasks(currentPsid, true); // Force fetch for reliability
    setTasks(userTasks);
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    // Only proceed if auth has finished loading
    if (!authLoading) {
      if (psid) {
        // If there's a psid, fetch their tasks
        getTasks(psid);
      } else {
        // If there is no psid (user logged out), clear tasks and set as loaded
        setTasks([]);
        cachedTasks = [];
        cachePsid = null;
        setIsLoaded(true);
      }
    }
  }, [psid, authLoading, getTasks]);

  const addTask = useCallback(
    async (taskData: Omit<Task, "id" | "completed" | "psid">) => {
      if (!psid || !db) return;
      try {
        const dataToAdd: any = {
          ...taskData,
          psid: psid,
          completed: false,
          date: new Date(taskData.date),
        };
        if (!dataToAdd.activityType) {
            dataToAdd.activityType = "Learn Concept"; // Default value
        }
        await addDoc(collection(db, "tasks"), dataToAdd);
        await getTasks(psid); // Re-fetch after adding
      } catch (error) {
        console.error("Error adding task: ", error);
      }
    },
    [psid, getTasks]
  );

  const updateTask = useCallback(
    async (updatedTask: Task) => {
      if (!psid || !db) return;
      const { id, ...taskData } = updatedTask;
      try {
        const dataToUpdate: any = {
            ...taskData,
            date: new Date(taskData.date)
        }
        if (!dataToUpdate.activityType) {
            dataToUpdate.activityType = "Learn Concept";
        }
        await updateDoc(doc(db, "tasks", id), dataToUpdate);
        await getTasks(psid); // Re-fetch after updating
      } catch (error) {
        console.error("Error updating task: ", error);
      }
    },
    [psid, getTasks]
  );

  const deleteTask = useCallback(
    async (taskId: string) => {
      if (!psid || !db) return;
      try {
        await deleteDoc(doc(db, "tasks", taskId));
        await getTasks(psid); // Re-fetch after deleting
      } catch (error) {
        console.error("Error deleting task: ", error);
      }
    },
    [psid, getTasks]
  );

  const toggleTaskCompletion = useCallback(
    async (taskId: string) => {
      if (!psid || !db) return;
      // We need to find the task in the current state to know its completed status
      const taskToToggle = tasks.find((t) => t.id === taskId);
      if (!taskToToggle) return;

      try {
        await updateDoc(doc(db, "tasks", taskId), {
          completed: !taskToToggle.completed,
        });
        await getTasks(psid); // Re-fetch after toggling
      } catch (error) {
        console.error("Error toggling task completion: ", error);
      }
    },
    [psid, getTasks, tasks]
  );

  return { tasks, isLoaded, addTask, updateTask, deleteTask, toggleTaskCompletion };
}
