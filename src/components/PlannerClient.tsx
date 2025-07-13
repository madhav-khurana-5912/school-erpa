// src/components/PlannerClient.tsx
"use client";

import * as React from "react";
import { useTasks } from "@/hooks/use-tasks";
import { Button } from "@/components/ui/button";
import { TaskDialog } from "@/components/TaskDialog";
import type { Task, SuggestedTask } from "@/types";
import { Plus, Loader2, Edit, Trash2, Clock, BookOpen, CheckCircle, Circle, Atom, FlaskConical, BrainCircuit, Landmark, Brain, Sigma, BookCopy, Lightbulb, Pencil, Repeat, Clapperboard, StickyNote } from "lucide-react";
import { format, isToday, isFuture, formatDistanceToNow, parseISO } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { cn } from "@/lib/utils";


const LearnToday = ({ onSubjectClick }: { onSubjectClick: (subject: string) => void }) => {
    const subjects = [
        { name: 'Physics', icon: Atom, color: 'bg-red-500' },
        { name: 'Chemistry', icon: FlaskConical, color: 'bg-orange-500' },
        { name: 'Biology', icon: BrainCircuit, color: 'bg-blue-500' },
        { name: 'Social Sc', icon: Landmark, color: 'bg-yellow-500' },
        { name: 'MAT', icon: Brain, color: 'bg-purple-500' },
        { name: 'Maths', icon: Sigma, color: 'bg-green-500' },
        { name: 'English', icon: BookCopy, color: 'bg-pink-500' },
    ]
    return (
        <Card className="shadow-md">
            <CardContent className="p-4">
                <h3 className="text-lg font-bold mb-4 text-center">What would you like to learn today?</h3>
                <div className="grid grid-cols-4 gap-4 md:flex md:justify-around">
                    {subjects.map((subject) => (
                        <div key={subject.name} className="flex flex-col items-center gap-2">
                            <Button size="icon" className={cn("w-14 h-14 md:w-16 md:h-16 rounded-full text-white shadow-lg", subject.color)} onClick={() => onSubjectClick(subject.name)}>
                                <subject.icon className="w-7 h-7 md:w-8 md:h-8" />
                            </Button>
                            <span className="text-xs md:text-sm font-medium">{subject.name}</span>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    )
};

const activityIcons: { [key: string]: React.ElementType } = {
  "Learn Concept": Lightbulb,
  "Practice Questions": Pencil,
  "Revise": Repeat,
  "Watch Lecture": Clapperboard,
  "Take Notes": StickyNote,
  "default": BookOpen,
};


export function PlannerClient() {
  const { tasks, isLoaded, deleteTask, toggleTaskCompletion } = useTasks();
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);
  const [editingTask, setEditingTask] = React.useState<Task | null>(null);
  const [initialTaskData, setInitialTaskData] = React.useState<Partial<Task> | undefined>(undefined);

  const handleAddNewTask = () => {
    setEditingTask(null);
    setInitialTaskData(undefined);
    setIsDialogOpen(true);
  };

  const handleEditTask = (task: Task) => {
    setEditingTask(task);
    setInitialTaskData(undefined);
    setIsDialogOpen(true);
  };

  const handleAddNewTaskForSubject = (subject: string) => {
    setEditingTask(null);
    setInitialTaskData({ subject: subject });
    setIsDialogOpen(true);
  };

  const groupTasksByDate = (tasks: Task[]) => {
    return tasks.reduce((acc, task) => {
      const date = format(parseISO(task.date), 'yyyy-MM-dd');
      if (!acc[date]) {
        acc[date] = [];
      }
      acc[date].push(task);
      return acc;
    }, {} as Record<string, Task[]>);
  };

  const groupedTasks = groupTasksByDate(tasks);
  const sortedDates = Object.keys(groupedTasks).sort();

  const getRelativeDate = (dateStr: string) => {
      const date = parseISO(dateStr);
      if (isToday(date)) return "Today";
      return format(date, 'E, d MMM yyyy');
  }

  return (
    <div className="p-4 md:p-6 space-y-6">
        <LearnToday onSubjectClick={handleAddNewTaskForSubject} />

      {!isLoaded ? (
        <div className="flex justify-center items-center py-10">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : tasks.length === 0 ? (
        <div className="text-center text-muted-foreground py-10 border-2 border-dashed rounded-lg">
          <p className="text-lg font-semibold">No tasks scheduled yet.</p>
          <p>Click on a subject above to get started.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {sortedDates.map((date) => (
             <div key={date}>
                <h2 className="text-lg font-bold mb-2 sticky top-0 bg-background py-2">{getRelativeDate(date)}</h2>
                <div className="space-y-4">
                    {groupedTasks[date].map((task) => {
                       const ActivityIcon = activityIcons[task.activityType || 'default'] || activityIcons.default;
                       return (
                        <Card key={task.id} className={cn("shadow-sm transition-all", task.completed && "bg-muted/50")}>
                            <CardContent className="p-4 flex items-start gap-4">
                                <Button variant="ghost" size="icon" className="mt-1" onClick={() => toggleTaskCompletion(task.id)}>
                                    {task.completed ? <CheckCircle className="h-6 w-6 text-green-500" /> : <Circle className="h-6 w-6 text-muted-foreground" />}
                                </Button>
                                <div className="flex-1">
                                    <p className={cn("font-semibold", task.completed && "line-through text-muted-foreground")}>{task.topic}</p>
                                    <p className={cn("text-sm text-muted-foreground", task.completed && "line-through")}>{task.subject}</p>
                                    <div className="flex items-center gap-4 text-sm text-muted-foreground mt-2 flex-wrap">
                                        <span className="flex items-center gap-1.5"><Clock className="w-4 h-4" /> {format(parseISO(task.date), 'p')}</span>
                                        <span className="flex items-center gap-1.5"><BookOpen className="w-4 h-4" /> {task.duration} mins</span>
                                        {task.activityType && <span className="flex items-center gap-1.5"><ActivityIcon className="w-4 h-4" /> {task.activityType}</span>}
                                    </div>
                                    {task.notes && <p className="text-sm mt-2 p-2 bg-secondary rounded-md">{task.notes}</p>}
                                </div>
                                <div className="flex gap-2">
                                     <Button variant="ghost" size="icon" onClick={() => handleEditTask(task)}>
                                        <Edit className="h-4 w-4" />
                                    </Button>
                                    <AlertDialog>
                                        <AlertDialogTrigger asChild>
                                            <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive">
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </AlertDialogTrigger>
                                        <AlertDialogContent>
                                            <AlertDialogHeader>
                                            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                            <AlertDialogDescription>
                                                This action cannot be undone. This will permanently delete your task "{task.topic}".
                                            </AlertDialogDescription>
                                            </AlertDialogHeader>
                                            <AlertDialogFooter>
                                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                                            <AlertDialogAction onClick={() => deleteTask(task.id)} className="bg-destructive hover:bg-destructive/90">Delete</AlertDialogAction>
                                            </AlertDialogFooter>
                                        </AlertDialogContent>
                                    </AlertDialog>
                                </div>
                            </CardContent>
                        </Card>
                    )})}
                </div>
            </div>
          ))}
        </div>
      )}

      <TaskDialog
        isOpen={isDialogOpen}
        setIsOpen={setIsDialogOpen}
        task={editingTask}
        initialData={initialTaskData}
      />
    </div>
  );
}
