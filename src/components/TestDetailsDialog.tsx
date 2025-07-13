// src/components/TestDetailsDialog.tsx
"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import type { Test } from "@/types";
import { format, parseISO } from "date-fns";
import { Calendar, BookOpen } from "lucide-react";
import { ScrollArea } from "./ui/scroll-area";

type TestDetailsDialogProps = {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  test: Test | null;
};

export function TestDetailsDialog({ isOpen, setIsOpen, test }: TestDetailsDialogProps) {
  if (!test) return null;

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{test.testName}</DialogTitle>
          <DialogDescription className="flex items-center gap-2 pt-1">
             <Calendar className="w-4 h-4" />
             {format(parseISO(test.startDate), "dd MMM yyyy")} - {format(parseISO(test.endDate), "dd MMM yyyy")}
          </DialogDescription>
        </DialogHeader>
        <div className="mt-4 space-y-4">
            <h3 className="font-semibold flex items-center gap-2"><BookOpen className="w-5 h-5" /> Syllabus</h3>
            {test.syllabus ? (
                <ScrollArea className="h-48 rounded-md border p-3 bg-muted/20">
                   <p className="text-sm whitespace-pre-wrap">{test.syllabus}</p>
                </ScrollArea>
            ) : (
                <p className="text-sm text-muted-foreground italic">No syllabus was extracted for this test.</p>
            )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
