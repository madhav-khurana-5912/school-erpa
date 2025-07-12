"use client";

import { useState, useEffect, useCallback } from "react";
import type { Task } from "@/types";

const STORE_KEY = "studyflow.tasks";

export function useTasks() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    try {
      const storedTasks = localStorage.getItem(STORE_KEY);
      if (storedTasks) {
        setTasks(JSON.parse(storedTasks));
      }
    } catch (error) {
      console.error("Failed to parse tasks from localStorage", error);
    }
    setIsLoaded(true);
  }, []);

  const updateStorage = (updatedTasks: Task[]) => {
    // Sort tasks by date before storing
    const sortedTasks = updatedTasks.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    setTasks(sortedTasks);
    try {
      localStorage.setItem(STORE_KEY, JSON.stringify(sortedTasks));
    } catch (error) {
      console.error("Failed to save tasks to localStorage", error);
    }
  };

  const addTask = useCallback(
    (taskData: Omit<Task, "id" | "completed">) => {
      const newTask: Task = {
        ...taskData,
        id: Date.now().toString(),
        completed: false,
      };
      updateStorage([...tasks, newTask]);
    },
    [tasks]
  );

  const updateTask = useCallback(
    (updatedTask: Task) => {
      const newTasks = tasks.map((task) =>
        task.id === updatedTask.id ? updatedTask : task
      );
      updateStorage(newTasks);
    },
    [tasks]
  );

  const deleteTask = useCallback(
    (taskId: string) => {
      const newTasks = tasks.filter((task) => task.id !== taskId);
      updateStorage(newTasks);
    },
    [tasks]
  );
  
  const toggleTaskCompletion = useCallback(
    (taskId: string) => {
        const newTasks = tasks.map((task) =>
            task.id === taskId ? { ...task, completed: !task.completed } : task
        );
        updateStorage(newTasks);
    },
    [tasks]
  );

  return { tasks, isLoaded, addTask, updateTask, deleteTask, toggleTaskCompletion };
}
