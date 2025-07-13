
"use client";

import * as React from "react";
import { format, parseISO, isFuture, isToday } from "date-fns";
import { useTests } from "@/hooks/use-tests";
import { useTasks } from "@/hooks/use-tasks";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, MapPin, ChevronRight, Wand2, Loader2, BookOpen, Clock, Lightbulb, Pencil, Repeat, Clapperboard, StickyNote } from "lucide-react";
import Link from "next/link";
import type { Test, Task } from "@/types";
import { cn } from "@/lib/utils";

const activityIcons: { [key: string]: React.ElementType } = {
  "Learn Concept": Lightbulb,
  "Practice Questions": Pencil,
  "Revise": Repeat,
  "Watch Lecture": Clapperboard,
  "Take Notes": StickyNote,
  "default": BookOpen,
};

const TestsSection = () => {
    const { tests, isLoaded } = useTests();

    const upcomingTest = React.useMemo(() => {
        const now = new Date();
        return tests.find(test => parseISO(test.endDate) >= now);
    }, [tests]);

    return (
        <div>
            <div className="flex justify-between items-center mb-2">
                <h3 className="text-lg font-bold">Tests</h3>
                <Link href="/tests" className="text-sm text-blue-600 hover:underline flex items-center">
                    View all <ChevronRight className="h-4 w-4" />
                </Link>
            </div>
            <Card className="shadow-md">
                <CardContent className="p-4">
                    {!isLoaded ? (
                         <div className="flex items-center justify-center h-24">
                            <Loader2 className="h-6 w-6 animate-spin text-primary" />
                        </div>
                    ) : upcomingTest ? (
                        <>
                            <div className="flex justify-between items-start">
                                <h4 className="font-bold text-lg">{upcomingTest.testName}</h4>
                                <span className="bg-purple-100 text-purple-800 text-xs font-medium px-2.5 py-0.5 rounded-full">Upcoming</span>
                            </div>
                            <div className="text-muted-foreground text-sm space-y-2 mt-2">
                                <div className="flex items-center gap-2">
                                    <Calendar className="w-4 h-4" />
                                    <span>
                                        {format(parseISO(upcomingTest.startDate), "dd MMM'yy")} - {format(parseISO(upcomingTest.endDate), "dd MMM'yy")}
                                    </span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <MapPin className="w-4 h-4" />
                                    <span>Online</span>
                                </div>
                            </div>
                            <div className="mt-4">
                                <Button variant="link" asChild className="text-sm font-semibold text-blue-600 p-0 h-auto">
                                    <Link href={`/tests/${upcomingTest.id}`}>
                                        View Details & Syllabus
                                    </Link>
                                </Button>
                            </div>
                        </>
                    ) : (
                        <div className="text-center text-muted-foreground py-4">
                            <p>No upcoming tests found.</p>
                             <Button variant="link" asChild className="p-0 h-auto">
                                <Link href="/import/tests">Import your test datesheet</Link>
                            </Button>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
};

const TasksSection = () => {
    const { tasks, isLoaded } = useTasks();

    const upcomingTasks = React.useMemo(() => {
        const now = new Date();
        now.setHours(0, 0, 0, 0); // Start of today
        return tasks
            .filter(task => !task.completed && isFuture(parseISO(task.date)))
            .slice(0, 3); // Show up to 3 upcoming tasks
    }, [tasks]);

    return (
        <div>
            <div className="flex justify-between items-center mb-2">
                <h3 className="text-lg font-bold">Upcoming Tasks</h3>
                <Link href="/planner" className="text-sm text-blue-600 hover:underline flex items-center">
                    View all <ChevronRight className="h-4 w-4" />
                </Link>
            </div>
            <Card className="shadow-md">
                <CardContent className="p-4">
                     {!isLoaded ? (
                         <div className="flex items-center justify-center h-24">
                            <Loader2 className="h-6 w-6 animate-spin text-primary" />
                        </div>
                    ) : upcomingTasks.length > 0 ? (
                        <ul className="space-y-3">
                            {upcomingTasks.map((task) => {
                                const ActivityIcon = activityIcons[task.activityType || 'default'] || activityIcons.default;
                                return (
                                <li key={task.id} className="flex items-start gap-4">
                                    <div className="flex-1">
                                        <p className="font-semibold">{task.topic}</p>
                                        <p className="text-sm text-muted-foreground">{task.subject}</p>
                                        <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1 flex-wrap">
                                            <span className="flex items-center gap-1.5"><Calendar className="w-4 h-4" /> {format(parseISO(task.date), "E, d MMM 'at' p")}</span>
                                            <span className="flex items-center gap-1.5"><ActivityIcon className="w-4 h-4" /> {task.activityType}</span>
                                        </div>
                                    </div>
                                    <div className="text-sm text-muted-foreground text-right">
                                       <span className="flex items-center gap-1.5"><Clock className="w-4 h-4" /> {task.duration}m</span>
                                    </div>
                                </li>
                                );
                            })}
                        </ul>
                    ) : (
                        <div className="text-center text-muted-foreground py-4">
                            <p>No upcoming tasks.</p>
                            <Button variant="link" asChild className="p-0 h-auto">
                                <Link href="/planner">Go to Planner to add tasks</Link>
                            </Button>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}

export function DashboardClient() {
  return (
    <div className="space-y-6">
      <TestsSection />
      <TasksSection />
    </div>
  );
}
