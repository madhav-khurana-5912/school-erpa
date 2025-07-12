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

export function useTasks() {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  const fetchTasks = useCallback(async () => {
    if (!user || !db) {
        setTasks([]);
        setIsLoaded(true);
        return;
    };

    setIsLoaded(false);
    try {
      const q = query(
        collection(db, "tasks"),
        where("userId", "==", user.uid),
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
      setTasks(userTasks);
    } catch (error) {
      console.error("Error fetching tasks:", error);
    } finally {
      setIsLoaded(true);
    }
  }, [user]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const addTask = useCallback(
    async (taskData: Omit<Task, "id" | "completed" | "userId">) => {
      if (!user || !db) return;
      try {
        await addDoc(collection(db, "tasks"), {
          ...taskData,
          userId: user.uid,
          completed: false,
          date: new Date(taskData.date),
        });
        fetchTasks();
      } catch (error) {
        console.error("Error adding task: ", error);
      }
    },
    [user, fetchTasks]
  );

  const updateTask = useCallback(
    async (updatedTask: Task) => {
      if (!user || !db) return;
      const { id, ...taskData } = updatedTask;
      try {
        await updateDoc(doc(db, "tasks", id), {
            ...taskData,
            date: new Date(taskData.date)
        });
        fetchTasks();
      } catch (error) {
        console.error("Error updating task: ", error);
      }
    },
    [user, fetchTasks]
  );

  const deleteTask = useCallback(
    async (taskId: string) => {
      if (!user || !db) return;
      try {
        await deleteDoc(doc(db, "tasks", taskId));
        fetchTasks();
      } catch (error) {
        console.error("Error deleting task: ", error);
      }
    },
    [user, fetchTasks]
  );

  const toggleTaskCompletion = useCallback(
    async (taskId: string) => {
      if (!user || !db) return;
      const task = tasks.find((t) => t.id === taskId);
      if (!task) return;
      try {
        await updateDoc(doc(db, "tasks", taskId), {
          completed: !task.completed,
        });
        fetchTasks();
      } catch (error) {
        console.error("Error toggling task completion: ", error);
      }
    },
    [user, tasks, fetchTasks]
  );

  return { tasks, isLoaded, addTask, updateTask, deleteTask, toggleTaskCompletion };
}
