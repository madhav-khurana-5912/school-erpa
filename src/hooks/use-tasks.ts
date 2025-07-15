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
  onSnapshot,
} from "firebase/firestore";
import type { Task } from "@/types";

export function useTasks() {
  const { psid, loading: authLoading } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    if (authLoading) return;

    if (!psid || !db) {
      setTasks([]);
      setIsLoaded(true);
      return;
    }

    setIsLoaded(false);
    const q = query(collection(db, "tasks"), where("psid", "==", psid));

    const unsubscribe = onSnapshot(
      q,
      (querySnapshot) => {
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
        setTasks(userTasks);
        setIsLoaded(true);
      },
      (error) => {
        console.error("Error fetching tasks with snapshot:", error);
        setTasks([]);
        setIsLoaded(true);
      }
    );

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, [psid, authLoading]);

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
        // No need to re-fetch, onSnapshot will handle it
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
        const dataToUpdate: any = {
            ...taskData,
            date: new Date(taskData.date)
        }
        if (!dataToUpdate.activityType) {
            dataToUpdate.activityType = "Learn Concept";
        }
        await updateDoc(doc(db, "tasks", id), dataToUpdate);
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
      } catch (error) {
        console.error("Error deleting task: ", error);
      }
    },
    [psid]
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
      } catch (error) {
        console.error("Error toggling task completion: ", error);
      }
    },
    [psid, tasks]
  );

  return { tasks, isLoaded, addTask, updateTask, deleteTask, toggleTaskCompletion };
}
