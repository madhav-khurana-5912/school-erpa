// src/components/TestsClient.tsx
"use client";

import * as React from "react";
import { useTests } from "@/hooks/use-tests";
import { Loader2, Calendar } from "lucide-react";
import { format, parseISO, isPast } from "date-fns";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "./ui/button";
import Link from "next/link";
import { cn } from "@/lib/utils";

export function TestsClient() {
  const { tests, isLoaded } = useTests();

  if (!isLoaded) {
    return (
      <div className="flex justify-center items-center py-10">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {tests.length === 0 ? (
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
      ) : (
        <div className="space-y-4">
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
                                {format(parseISO(test.startDate), "dd MMM yyyy")} - {format(parseISO(test.endDate), "dd MMM yyyy")}
                            </span>
                        </div>
                    </div>
                     <div className="mt-4">
                        <Link href="#" className="text-sm font-semibold text-blue-600 hover:underline">
                            View Details & Syllabus
                        </Link>
                    </div>
                </CardContent>
            </Card>
            )
          })}
        </div>
      )}
    </div>
  );
}
