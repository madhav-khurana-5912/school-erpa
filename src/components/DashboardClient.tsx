
"use client";

import * as React from "react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, Clock, MapPin, CheckCircle2, ChevronRight, BookOpen, FlaskConical, Atom, BrainCircuit, Wand2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";


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

const TestsSection = () => (
    <div>
        <div className="flex justify-between items-center mb-2">
            <h3 className="text-lg font-bold">Tests</h3>
            <Link href="#" className="text-sm text-blue-600 hover:underline flex items-center">
                View all <ChevronRight className="h-4 w-4" />
            </Link>
        </div>
        <Card className="shadow-md">
            <CardContent className="p-4">
                <div className="flex justify-between items-start">
                    <h4 className="font-bold text-lg">Unit Test - UT-01</h4>
                    <span className="bg-purple-100 text-purple-800 text-xs font-medium px-2.5 py-0.5 rounded-full">Upcoming</span>
                </div>
                <div className="text-muted-foreground text-sm space-y-2 mt-2">
                    <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        <span>15 Jul'25 - 17 Jul'25</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4" />
                        <span>Online</span>
                    </div>
                </div>
                <div className="mt-4">
                    <Link href="#" className="text-sm font-semibold text-blue-600 hover:underline">
                        Test Details
                    </Link>
                </div>
            </CardContent>
        </Card>
    </div>
);

const UpcomingClasses = () => (
    <div>
        <h3 className="text-lg font-bold mb-2">Upcoming Classes</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="shadow-md bg-orange-50 border-orange-100">
                <CardContent className="p-4">
                    <div className="flex justify-between items-start">
                        <h4 className="font-bold text-md">Social Science</h4>
                        <div className="bg-orange-200 p-2 rounded-full">
                           <BookOpen className="w-5 h-5 text-orange-700" />
                        </div>
                    </div>
                    <div className="text-muted-foreground text-sm space-y-2 mt-4">
                        <div className="flex items-center gap-2">
                           <Calendar className="w-4 h-4" />
                           <span>19 Jul 2025</span>
                        </div>
                        <div className="flex items-center gap-2">
                           <Clock className="w-4 h-4" />
                           <span>09:05 AM - 10:05 AM</span>
                        </div>
                    </div>
                </CardContent>
            </Card>
            <Card className="shadow-md bg-teal-50 border-teal-100">
                <CardContent className="p-4">
                    <div className="flex justify-between items-start">
                        <h4 className="font-bold text-md">Mathematics</h4>
                         <div className="bg-teal-200 p-2 rounded-full">
                           <BrainCircuit className="w-5 h-5 text-teal-700" />
                        </div>
                    </div>
                     <div className="text-muted-foreground text-sm space-y-2 mt-4">
                        <div className="flex items-center gap-2">
                           <Calendar className="w-4 h-4" />
                           <span>19 Jul 2025</span>
                        </div>
                        <div className="flex items-center gap-2">
                           <Clock className="w-4 h-4" />
                           <span>10:20 AM - 11:20 AM</span>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    </div>
);


const LearnToday = () => {
    const subjects = [
        { name: 'Physics', icon: Atom, color: 'bg-red-500' },
        { name: 'Chemistry', icon: FlaskConical, color: 'bg-orange-500' },
        { name: 'Biology', icon: BrainCircuit, color: 'bg-blue-500' },
    ]
    return (
        <Card className="shadow-md">
            <CardContent className="p-4">
                <h3 className="text-lg font-bold mb-4 text-center">What would you like to learn today?</h3>
                <div className="flex justify-around">
                    {subjects.map((subject) => (
                        <div key={subject.name} className="flex flex-col items-center gap-2">
                            <Button size="icon" className={cn("w-16 h-16 rounded-full text-white shadow-lg", subject.color)}>
                                <subject.icon className="w-8 h-8" />
                            </Button>
                            <span className="text-sm font-medium">{subject.name}</span>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    )
};


export function DashboardClient() {
  return (
    <div className="space-y-6">
      <SyllabusAnalyzerCard />
      <TestsSection />
      <UpcomingClasses />
      <LearnToday />
    </div>
  );
}
