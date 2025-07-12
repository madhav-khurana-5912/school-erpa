"use client";

import { useState, useTransition } from "react";
import { getStudyTasksFromSyllabus } from "@/lib/actions";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import type { SuggestedTask } from "@/types";
import { TaskDialog } from "./TaskDialog";
import { Skeleton } from "./ui/skeleton";
import { Wand2, Clock, Plus } from "lucide-react";

export function SyllabusImporter() {
  const [syllabusText, setSyllabusText] = useState("");
  const [suggestedTasks, setSuggestedTasks] = useState<SuggestedTask[]>([]);
  const [taskToSchedule, setTaskToSchedule] = useState<SuggestedTask | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();

  const handleAnalyze = () => {
    startTransition(async () => {
      const { data, error } = await getStudyTasksFromSyllabus(syllabusText);
      if (error) {
        toast({
          variant: "destructive",
          title: "Error",
          description: error,
        });
      } else if (data) {
        setSuggestedTasks(data.studyTasks);
        toast({
          title: "Syllabus Analyzed",
          description: `We've generated ${data.studyTasks.length} study tasks for you.`,
        });
      }
    });
  };

  const handleScheduleTask = (task: SuggestedTask) => {
    setTaskToSchedule(task);
    setIsDialogOpen(true);
  };
  
  const handleDialogClose = () => {
    setIsDialogOpen(false);
    setTaskToSchedule(null);
  }

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Analyze Your Syllabus</CardTitle>
          <CardDescription>
            Paste your syllabus below and let our AI create a structured list of
            study tasks for you.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Textarea
            value={syllabusText}
            onChange={(e) => setSyllabusText(e.target.value)}
            placeholder="Paste syllabus text here..."
            rows={15}
            className="w-full"
          />
        </CardContent>
        <CardFooter>
          <Button onClick={handleAnalyze} disabled={isPending || !syllabusText}>
            {isPending ? (
              "Analyzing..."
            ) : (
                <>
                    <Wand2 className="mr-2 h-4 w-4" />
                    Analyze
                </>
            )}
          </Button>
        </CardFooter>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Suggested Tasks</CardTitle>
          <CardDescription>
            Here are the tasks generated from your syllabus. Add them to your study plan.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {isPending ? (
             <div className="space-y-4">
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
            </div>
          ) : suggestedTasks.length > 0 ? (
            <ul className="space-y-2">
              {suggestedTasks.map((task, index) => (
                <li
                  key={index}
                  className="flex items-center justify-between p-3 rounded-md border bg-card"
                >
                  <div>
                    <p className="font-medium">{task.topic}</p>
                    <p className="text-sm text-muted-foreground flex items-center gap-1"><Clock className="w-3 h-3"/> {task.durationMinutes} minutes</p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleScheduleTask(task)}
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Schedule
                  </Button>
                </li>
              ))}
            </ul>
          ) : (
            <div className="text-center text-muted-foreground py-10">
              <p>No tasks suggested yet.</p>
              <p className="text-sm">Analyze a syllabus to get started.</p>
            </div>
          )}
        </CardContent>
      </Card>

      {taskToSchedule && (
        <TaskDialog
          isOpen={isDialogOpen}
          setIsOpen={handleDialogClose}
          initialData={{ topic: taskToSchedule.topic, duration: taskToSchedule.durationMinutes }}
        />
      )}
    </div>
  );
}
