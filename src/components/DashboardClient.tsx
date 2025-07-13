
"use client";

import * as React from "react";
import { format, parseISO } from "date-fns";
import { useTests } from "@/hooks/use-tests";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, MapPin, ChevronRight, Wand2, Loader2, BookOpen } from "lucide-react";
import Link from "next/link";
import type { Test } from "@/types";

const SyllabusAnalyzerCard = () => (
    <Card className="shadow-md bg-primary/10 border-primary/20">
        <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-lg">
                <Wand2 className="text-primary"/>
                AI Study Planner
            </CardTitle>
            <CardDescription>
                Let our AI analyze your syllabus and create a personalized study plan for you.
            </CardDescription>
        </CardHeader>
        <CardContent>
            <Link href="/import">
                <Button className="w-full">
                    Analyze Syllabus
                </Button>
            </Link>
        </CardContent>
    </Card>
);

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

export function DashboardClient() {
  return (
    <div className="space-y-6">
      <SyllabusAnalyzerCard />
      <TestsSection />
    </div>
  );
}
