// src/components/TestsClient.tsx
"use client";

import * as React from "react";
import { useTests } from "@/hooks/use-tests";
import { Loader2, Calendar, Trash2 } from "lucide-react";
import { format, parseISO, isPast } from "date-fns";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "./ui/button";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { Test } from "@/types";
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
import { useToast } from "@/hooks/use-toast";


const TestList = ({ tests }: { tests: Test[] }) => {
  if (tests.length === 0) {
    return (
      <div className="text-center text-muted-foreground py-10 border-2 border-dashed rounded-lg mt-4">
        <p className="text-lg font-semibold">No tests here.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 mt-4">
      {tests.map((test) => {
        const hasEnded = isPast(parseISO(test.endDate));
        return (
          <Card key={test.id} className={cn("shadow-sm", hasEnded && "bg-muted/50")}>
            <CardContent className="p-4">
              <div className="flex justify-between items-start">
                <h4 className={cn("font-bold text-lg", hasEnded && "text-muted-foreground")}>{test.testName}</h4>
                <span className={cn(
                  "text-xs font-medium px-2.5 py-0.5 rounded-full",
                  hasEnded ? "bg-gray-100 text-gray-800" : "bg-purple-100 text-purple-800"
                )}>
                  {hasEnded ? "Completed" : "Upcoming"}
                </span>
              </div>
              <div className="text-muted-foreground text-sm space-y-2 mt-2">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  <span>
                    {format(parseISO(test.startDate), "dd MMM yyyy")}
                  </span>
                </div>
              </div>
              <div className="mt-4">
                 <Button variant="link" asChild className="text-sm font-semibold text-blue-600 p-0 h-auto">
                    <Link href={`/tests/${test.id}`}>
                        View Details & Syllabus
                    </Link>
                 </Button>
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  );
};


export function TestsClient() {
  const { tests, isLoaded, clearAllTests } = useTests();
  const [isClearing, setIsClearing] = React.useState(false);
  const { toast } = useToast();

  const upcomingTests = React.useMemo(() => tests.filter(test => !isPast(parseISO(test.endDate))), [tests]);
  const completedTests = React.useMemo(() => tests.filter(test => isPast(parseISO(test.endDate))), [tests]);
  
  const handleClearTests = async () => {
    setIsClearing(true);
    try {
      await clearAllTests();
      toast({
        title: "Success",
        description: "All tests have been cleared.",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Could not clear tests. Please try again.",
      });
    } finally {
      setIsClearing(false);
    }
  };


  if (!isLoaded) {
    return (
      <div className="flex justify-center items-center py-10">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (tests.length === 0) {
      return (
        <div className="text-center text-muted-foreground py-10 border-2 border-dashed rounded-lg">
          <p className="text-lg font-semibold">No tests found.</p>
          <p>
            Go to{" "}
            <Button variant="link" asChild className="p-0 h-auto">
                <Link href="/import/tests">Import Tests</Link>
            </Button>
            {" "}to add your datesheet.
          </p>
        </div>
      )
  }

  return (
    <>
        <div className="flex justify-end">
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" size="sm" disabled={isClearing}>
                  <Trash2 className="mr-2 h-4 w-4" />
                  {isClearing ? 'Clearing...' : 'Clear All Tests'}
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete all
                    your test entries.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleClearTests} className="bg-destructive hover:bg-destructive/90">
                    Yes, clear all tests
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
        </div>
        <Tabs defaultValue="upcoming" className="w-full mt-4">
        <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="upcoming">Upcoming ({upcomingTests.length})</TabsTrigger>
            <TabsTrigger value="completed">Completed ({completedTests.length})</TabsTrigger>
        </TabsList>
        <TabsContent value="upcoming">
            <TestList tests={upcomingTests} />
        </TabsContent>
        <TabsContent value="completed">
            <TestList tests={completedTests} />
        </TabsContent>
        </Tabs>
    </>
  );
}
