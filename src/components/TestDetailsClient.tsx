// src/components/TestDetailsClient.tsx
"use client";

import * as React from "react";
import { useTests } from "@/hooks/use-tests";
import { Loader2, ChevronRight, BookPlus } from "lucide-react";
import { format, parseISO, isPast } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { TaskDialog } from "@/components/TaskDialog";
import { cn } from "@/lib/utils";
import type { Test, Task } from "@/types";

const DetailCard = ({ label, value }: { label: string; value: string }) => (
    <Card className="bg-white shadow-sm flex-1">
        <CardContent className="p-3">
            <p className="text-xs text-muted-foreground">{label}</p>
            <p className="font-bold text-sm">{value}</p>
        </CardContent>
    </Card>
);

export function TestDetailsClient({ testId }: { testId: string }) {
  const { tests, isLoaded } = useTests();
  const [test, setTest] = React.useState<Test | null>(null);
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);
  const [initialTaskData, setInitialTaskData] = React.useState<Partial<Task> | undefined>(undefined);

  React.useEffect(() => {
    if (isLoaded) {
      const foundTest = tests.find(t => t.id === testId) || null;
      setTest(foundTest);
    }
  }, [testId, tests, isLoaded]);

  const handleStudyTopic = (topic: string, subject?: string) => {
    setInitialTaskData({ topic: topic, subject: subject || "" });
    setIsDialogOpen(true);
  };

  if (!isLoaded || !test) {
    return (
      <div className="flex justify-center items-center h-full">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const hasEnded = isPast(parseISO(test.endDate));
  const syllabusItems = test.syllabus?.split(/, ?|\n/).map(s => s.trim()).filter(Boolean) || [];

  return (
    <>
        <div className="p-4 md:p-6 space-y-6">
            <Card className="bg-white shadow-md">
                <CardHeader className="pb-4">
                    <div className="flex justify-between items-start">
                        <h1 className="text-2xl font-bold">{test.testName}</h1>
                         <span className={cn(
                            "text-xs font-medium px-2.5 py-0.5 rounded-full",
                            hasEnded ? "bg-gray-100 text-gray-800" : "bg-purple-100 text-purple-800"
                            )}>
                            {hasEnded ? "Completed" : "Upcoming"}
                        </span>
                    </div>
                    <div className="flex items-center gap-2 pt-2">
                        <span className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded-full">Online</span>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-2 gap-4">
                       <DetailCard label="Test date" value={`${format(parseISO(test.startDate), "dd MMM''yy")}`} />
                       <DetailCard label="Test duration" value="-" />
                       <DetailCard label="Result date" value={format(parseISO(test.endDate), "dd MMM''yy")} />
                       <DetailCard label="No. of questions" value="-" />
                       <DetailCard label="Max marks" value="-" />
                    </div>
                </CardContent>
            </Card>

            <Card className="bg-white shadow-md">
                <CardHeader>
                    <CardTitle className="text-lg font-bold">Test Content</CardTitle>
                </CardHeader>
                <CardContent>
                    {syllabusItems.length > 0 ? (
                        <Accordion type="multiple" className="w-full">
                            {syllabusItems.map((item, index) => (
                                <AccordionItem value={`item-${index}`} key={index}>
                                    <AccordionTrigger className="font-medium hover:no-underline">{item}</AccordionTrigger>
                                    <AccordionContent>
                                        <div className="flex justify-between items-center pl-4">
                                            <p className="text-sm text-muted-foreground">No specific sub-topics listed.</p>
                                            <Button size="sm" variant="outline" onClick={() => handleStudyTopic(item)}>
                                                <BookPlus className="mr-2 h-4 w-4" />
                                                Study this topic
                                            </Button>
                                        </div>
                                    </AccordionContent>
                                </AccordionItem>
                            ))}
                        </Accordion>
                    ): (
                        <p className="text-sm text-muted-foreground italic">No syllabus details found for this test.</p>
                    )}
                </CardContent>
            </Card>
        </div>
        <TaskDialog
            isOpen={isDialogOpen}
            setIsOpen={setIsDialogOpen}
            initialData={initialTaskData}
        />
    </>
  );
}
