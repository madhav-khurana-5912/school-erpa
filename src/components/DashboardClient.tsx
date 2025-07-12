
"use client";

import * as React from "react";
import { useState, useMemo } from "react";
import dynamic from 'next/dynamic';
import { useTasks } from "@/hooks/use-tasks";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Checkbox } from "@/components/ui/checkbox";
import { Plus, Trash2, Pencil, Calendar as CalendarIcon, Clock, StickyNote, Loader2 } from "lucide-react";
import type { Task } from "@/types";
import { format, isToday, isFuture, parseISO } from 'date-fns';
import { Badge } from "./ui/badge";
import { cn } from "@/lib/utils";

const TaskDialog = dynamic(() => import('@/components/TaskDialog').then(mod => mod.TaskDialog), {
    ssr: false,
});


export function DashboardClient() {
  const { tasks, isLoaded, toggleTaskCompletion, deleteTask } = useTasks();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [selectedDate, setSelectedDate] = React.useState<Date | undefined>(new Date());

  const upcomingTasks = useMemo(
    () => tasks.filter((task) => !task.completed && (isFuture(parseISO(task.date)) || isToday(parseISO(task.date)))),
    [tasks]
  );

  const completedTasks = useMemo(
    () => tasks.filter((task) => task.completed),
    [tasks]
  );

  const taskDays = useMemo(() => {
    return tasks.map(task => format(parseISO(task.date), 'yyyy-MM-dd'));
  }, [tasks]);

  const handleAddTask = () => {
    setEditingTask(null);
    setIsDialogOpen(true);
  };
  
  const handleEditTask = (task: Task) => {
    setEditingTask(task);
    setIsDialogOpen(true);
  };

  const TaskItem = ({ task }: { task: Task }) => (
    <div className="flex items-center gap-4 p-2 rounded-lg transition-colors hover:bg-muted/50">
      <Checkbox
        id={`task-${task.id}`}
        checked={task.completed}
        onCheckedChange={() => toggleTaskCompletion(task.id)}
        aria-label={`Mark ${task.topic} as ${task.completed ? 'incomplete' : 'complete'}`}
      />
      <div className="flex-1 grid gap-1">
        <div className="font-medium flex items-center justify-between">
            <span className={cn("text-sm", task.completed ? "line-through text-muted-foreground" : "")}>{task.topic}</span>
            <Badge variant="secondary" className="hidden sm:inline-flex">{task.subject}</Badge>
        </div>
        <div className="text-xs text-muted-foreground flex flex-wrap items-center gap-x-4 gap-y-1">
          <div className="flex items-center gap-1">
            <CalendarIcon className="w-3 h-3" />
            <span>{format(parseISO(task.date), "EEE, MMM d, h:mm a")}</span>
          </div>
          <div className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            <span>{task.duration} min</span>
          </div>
          {task.notes && (
             <div className="flex items-center gap-1">
                <StickyNote className="w-3 h-3" />
                <span className="truncate max-w-xs">{task.notes}</span>
            </div>
          )}
        </div>
      </div>
      <div className="flex items-center gap-1">
        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleEditTask(task)}>
            <Pencil className="w-4 h-4" />
            <span className="sr-only">Edit Task</span>
        </Button>
        <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => deleteTask(task.id)}>
            <Trash2 className="w-4 h-4" />
            <span className="sr-only">Delete Task</span>
        </Button>
      </div>
    </div>
  );

  return (
    <>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Upcoming Tasks</CardTitle>
              <CardDescription>Your scheduled study sessions.</CardDescription>
            </div>
            <Button onClick={handleAddTask} size="sm" className="gap-1">
              <Plus className="h-4 w-4" />
              New Task
            </Button>
          </CardHeader>
          <CardContent className="space-y-2">
            {!isLoaded ? (
                <div className="flex items-center justify-center h-48">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
            ) : upcomingTasks.length > 0 ? (
                upcomingTasks.map(task => <TaskItem key={task.id} task={task} />)
            ) : (
                <p className="text-sm text-muted-foreground text-center py-8">No upcoming tasks. Enjoy your free time!</p>
            )}
            
            {isLoaded && completedTasks.length > 0 && (
                 <Accordion type="single" collapsible className="w-full">
                    <AccordionItem value="completed-tasks">
                        <AccordionTrigger>Completed Tasks ({completedTasks.length})</AccordionTrigger>
                        <AccordionContent>
                        {completedTasks.map(task => <TaskItem key={task.id} task={task} />)}
                        </AccordionContent>
                    </AccordionItem>
                </Accordion>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Calendar</CardTitle>
            <CardDescription>View your study schedule.</CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center">
             <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={setSelectedDate}
                className="rounded-md"
                modifiers={{
                    hasTask: (date) => taskDays.includes(format(date, 'yyyy-MM-dd')),
                }}
                modifiersClassNames={{
                    hasTask: 'bg-primary/20 text-primary-foreground rounded-full',
                }}
                />
          </CardContent>
        </Card>
      </div>
      {isDialogOpen && (
        <TaskDialog 
          isOpen={isDialogOpen} 
          setIsOpen={setIsDialogOpen}
          task={editingTask}
        />
      )}
    </>
  );
}
