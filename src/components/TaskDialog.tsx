
"use client";

import { useEffect, useState, useTransition } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useTasks } from "@/hooks/use-tasks";
import { useSyllabus } from "@/hooks/use-syllabus";
import { getTopicSuggestions } from "@/lib/actions";
import type { Task, SuggestedTask } from "@/types";
import { Textarea } from "./ui/textarea";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { cn } from "@/lib/utils";
import { format, setHours, setMinutes, parseISO } from "date-fns";
import { CalendarIcon, Check, ChevronsUpDown, Loader2 } from "lucide-react";
import { Calendar } from "./ui/calendar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "./ui/command";

const formSchema = z.object({
  subject: z.string().min(1, "Subject is required."),
  topic: z.string().min(1, "Topic is required."),
  activityType: z.string().optional(),
  date: z.date({ required_error: "A date is required." }),
  time: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Invalid time format (HH:mm)."),
  duration: z.coerce.number().min(1, "Duration must be at least 1 minute."),
  notes: z.string().optional(),
});

type TaskDialogProps = {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  task?: Task | null;
  initialData?: Partial<Task & SuggestedTask>;
};

export function TaskDialog({ isOpen, setIsOpen, task, initialData }: TaskDialogProps) {
  const { addTask, updateTask } = useTasks();
  const { syllabus, isLoaded: isSyllabusLoaded } = useSyllabus();
  const [suggestedTopics, setSuggestedTopics] = useState<string[]>([]);
  const [isSuggesting, startSuggesting] = useTransition();
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      subject: "",
      topic: "",
      activityType: "Learn Concept",
      date: new Date(),
      time: format(new Date(), "HH:mm"),
      duration: 60,
      notes: "",
    },
  });
  
  const watchedSubject = useWatch({ control: form.control, name: "subject" });
  const watchedTopic = useWatch({ control: form.control, name: "topic" });

  useEffect(() => {
    if (isOpen) {
        const defaultValues = task
        ? { // Editing an existing task
            ...task,
            date: parseISO(task.date),
            time: format(parseISO(task.date), "HH:mm"),
            activityType: task.activityType || "Learn Concept",
          }
        : { // Creating a new task, potentially with initial data
            subject: initialData?.subject || "",
            topic: initialData?.topic || "",
            activityType: initialData?.activityType || "Learn Concept",
            date: new Date(),
            time: format(new Date(), "HH:mm"),
            duration: initialData?.durationMinutes || initialData?.duration || 60,
            notes: initialData?.notes || "",
          };
      form.reset(defaultValues);
      setSuggestedTopics([]); // Reset suggestions on open
    }
  }, [isOpen, task, initialData, form]);

  useEffect(() => {
    if (!watchedSubject || !isSyllabusLoaded || !syllabus?.topics?.length) {
      setSuggestedTopics([]);
      return;
    }

    startSuggesting(async () => {
      const { data } = await getTopicSuggestions({
        subject: watchedSubject,
        syllabusTopics: syllabus.topics,
      });
      if (data) {
        setSuggestedTopics(data.suggestedTopics);
      }
    });
  }, [watchedSubject, isSyllabusLoaded, syllabus]);


  function onSubmit(values: z.infer<typeof formSchema>) {
    const [hours, minutes] = values.time.split(':').map(Number);
    const combinedDateTime = setMinutes(setHours(values.date, hours), minutes);

    const taskData = {
      subject: values.subject,
      topic: values.topic,
      activityType: values.activityType,
      date: combinedDateTime.toISOString(),
      duration: values.duration,
      notes: values.notes,
    };

    if (task) {
      updateTask({ ...task, ...taskData });
    } else {
      addTask(taskData);
    }
    setIsOpen(false);
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{task ? "Edit Task" : "Add New Task"}</DialogTitle>
          <DialogDescription>
            {task ? "Update the details of your study session." : "Plan a new study session to stay on track."}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="subject"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Subject</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. Mathematics" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="topic"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Topic</FormLabel>
                   <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant="outline"
                          role="combobox"
                          className={cn(
                            "w-full justify-between",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          {field.value || "Select a topic or type your own"}
                          {isSuggesting ? <Loader2 className="ml-2 h-4 w-4 animate-spin" /> : <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />}
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                      <Command shouldFilter={false}>
                        <CommandInput
                          placeholder="Search or type topic..."
                          value={field.value}
                          onValueChange={field.onChange}
                         />
                        <CommandList>
                          <CommandEmpty>No topic found.</CommandEmpty>
                          <CommandGroup>
                            {suggestedTopics.map((topic) => (
                               <div
                                key={topic}
                                className="cursor-pointer"
                                onClick={() => {
                                  form.setValue("topic", topic);
                                  setIsPopoverOpen(false);
                                }}
                              >
                                <CommandItem>
                                  <Check
                                    className={cn(
                                      "mr-2 h-4 w-4",
                                      topic === field.value
                                        ? "opacity-100"
                                        : "opacity-0"
                                    )}
                                  />
                                  {topic}
                                </CommandItem>
                              </div>
                            ))}
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="activityType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Activity Type</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select an activity" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="Learn Concept">Learn Concept</SelectItem>
                      <SelectItem value="Practice Questions">Practice Questions</SelectItem>
                      <SelectItem value="Revise">Revise</SelectItem>
                      <SelectItem value="Watch Lecture">Watch Lecture</SelectItem>
                      <SelectItem value="Take Notes">Take Notes</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="date"
                render={({ field }) => (
                    <FormItem className="flex flex-col">
                    <FormLabel>Date</FormLabel>
                    <Popover>
                        <PopoverTrigger asChild>
                        <FormControl>
                            <Button
                            variant={"outline"}
                            className={cn(
                                "pl-3 text-left font-normal",
                                !field.value && "text-muted-foreground"
                            )}
                            >
                            {field.value ? (
                                format(field.value, "PPP")
                            ) : (
                                <span>Pick a date</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                        </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            initialFocus
                        />
                        </PopoverContent>
                    </Popover>
                    <FormMessage />
                    </FormItem>
                )}
                />
                 <FormField
                    control={form.control}
                    name="time"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Time</FormLabel>
                        <FormControl>
                            <Input type="time" {...field} />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                 />
            </div>
             <FormField
                control={form.control}
                name="duration"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Duration (minutes)</FormLabel>
                    <FormControl>
                        <Input type="number" placeholder="e.g. 60" {...field} />
                    </FormControl>
                    <FormMessage />
                    </FormItem>
                )}
            />
            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes</FormLabel>
                  <FormControl>
                    <Textarea placeholder="e.g. Review chapter 3 exercises" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="submit">{task ? "Save Changes" : "Add Task"}</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
