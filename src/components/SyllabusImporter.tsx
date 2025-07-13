
"use client";

import { useState, useTransition, ChangeEvent } from "react";
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
import { Wand2, Clock, Plus, Upload, FileText, Type } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const fileToDataUri = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
}

export function SyllabusImporter() {
  const [syllabusText, setSyllabusText] = useState("");
  const [syllabusFile, setSyllabusFile] = useState<File | null>(null);
  const [activeTab, setActiveTab] = useState("text");
  const [suggestedTasks, setSuggestedTasks] = useState<SuggestedTask[]>([]);
  const [taskToSchedule, setTaskToSchedule] = useState<SuggestedTask | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSyllabusFile(file);
    }
  };

  const handleAnalyze = () => {
    startTransition(async () => {
      setSuggestedTasks([]);
      try {
        let result;
        if (activeTab === 'file' && syllabusFile) {
          const syllabusFileDataUri = await fileToDataUri(syllabusFile);
          result = await getStudyTasksFromSyllabus({ syllabusFileDataUri });
        } else if (activeTab === 'text' && syllabusText.trim()) {
          result = await getStudyTasksFromSyllabus({ syllabusText });
        } else {
            toast({
                variant: "destructive",
                title: "Input Missing",
                description: "Please provide a syllabus to analyze.",
            });
            return;
        }

        const { data, error } = result;
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
      } catch (e) {
        toast({
            variant: "destructive",
            title: "Error",
            description: "Could not process the syllabus. Please try again.",
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

  const canAnalyze = (activeTab === 'text' && !!syllabusText.trim()) || (activeTab === 'file' && !!syllabusFile);

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Analyze Your Syllabus</CardTitle>
          <CardDescription>
            Paste your syllabus text or upload a file (PDF/Image) to generate study tasks.
          </CardDescription>
        </CardHeader>
        <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="text"><Type className="mr-2 h-4 w-4"/>Paste Text</TabsTrigger>
                    <TabsTrigger value="file"><FileText className="mr-2 h-4 w-4"/>Upload File</TabsTrigger>
                </TabsList>
                <TabsContent value="text" className="mt-4">
                    <Textarea
                        value={syllabusText}
                        onChange={(e) => setSyllabusText(e.target.value)}
                        placeholder="Paste syllabus text here..."
                        rows={15}
                        className="w-full"
                    />
                </TabsContent>
                <TabsContent value="file" className="mt-4">
                    <label htmlFor="syllabus-upload" className="block w-full cursor-pointer rounded-lg border-2 border-dashed border-muted-foreground/30 p-10 text-center hover:bg-muted/50">
                        <div className="flex flex-col items-center gap-2 text-muted-foreground">
                            <Upload className="h-8 w-8" />
                            <span className="font-medium">{syllabusFile ? syllabusFile.name : "Click to upload a file"}</span>
                            <span className="text-xs">PDF, PNG, JPG, or GIF</span>
                        </div>
                    </label>
                    <input id="syllabus-upload" type="file" accept="image/*,application/pdf" className="sr-only" onChange={handleFileChange} />
                </TabsContent>
            </Tabs>
        </CardContent>
        <CardFooter>
          <Button onClick={handleAnalyze} disabled={isPending || !canAnalyze}>
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
          initialData={taskToSchedule}
        />
      )}
    </div>
  );
}
