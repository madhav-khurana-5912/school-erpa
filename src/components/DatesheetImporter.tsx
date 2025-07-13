
"use client";

import { useState, useTransition, ChangeEvent } from "react";
import { getTestsFromDatesheet } from "@/lib/test-actions";
import { useTests } from "@/hooks/use-tests";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import type { Test } from "@/types";
import { Skeleton } from "./ui/skeleton";
import { Wand2, Calendar, Save, Upload, ImageIcon } from "lucide-react";
import { format, parseISO } from "date-fns";

type ExtractedTest = Omit<Test, "id" | "psid">;

export function DatesheetImporter() {
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [extractedTests, setExtractedTests] = useState<ExtractedTest[]>([]);
  const [isAnalyzing, startAnalyzing] = useTransition();
  const [isSaving, startSaving] = useTransition();
  const { addAllTests } = useTests();
  const { toast } = useToast();

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const fileArray = Array.from(files);
      setImageFiles(fileArray);
    }
  };

  const fileToDataUri = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
  }

  const handleAnalyze = () => {
    if (imageFiles.length === 0) return;

    startAnalyzing(async () => {
      setExtractedTests([]);
      try {
        const datesheetPhotoDataUris = await Promise.all(imageFiles.map(fileToDataUri));
        const { data, error } = await getTestsFromDatesheet(datesheetPhotoDataUris);
        if (error) {
          toast({
            variant: "destructive",
            title: "Error",
            description: error,
          });
        } else if (data) {
          setExtractedTests(data.tests);
          toast({
            title: "Datesheet Analyzed",
            description: `We've extracted ${data.tests.length} tests. Review and save them.`,
          });
        }
      } catch (e) {
        toast({
            variant: "destructive",
            title: "Error",
            description: "Could not read the image file(s). Please try again.",
        });
      }
    });
  };

  const handleSaveTests = () => {
    startSaving(async () => {
      try {
        await addAllTests(extractedTests);
        toast({
          title: "Success",
          description: "All extracted tests have been saved to your planner.",
        });
        setExtractedTests([]);
        setImageFiles([]);
      } catch (error) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Could not save tests. Please try again.",
        });
      }
    });
  };

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Analyze Your Datesheet</CardTitle>
          <CardDescription>
            Upload picture(s) of your test schedule. Our AI will extract all the tests and their dates for you.
          </CardDescription>
        </CardHeader>
        <CardContent>
            <div className="space-y-4">
                <label htmlFor="datesheet-upload" className="block w-full cursor-pointer rounded-lg border-2 border-dashed border-muted-foreground/30 p-10 text-center hover:bg-muted/50">
                    <div className="flex flex-col items-center gap-2 text-muted-foreground">
                        <Upload className="h-8 w-8" />
                        <span className="font-medium">{imageFiles.length > 0 ? `${imageFiles.length} image(s) selected` : "Click to upload images"}</span>
                        <span className="text-xs">PNG, JPG, or GIF</span>
                    </div>
                </label>
                <input id="datesheet-upload" type="file" accept="image/*" multiple className="sr-only" onChange={handleFileChange} />
            </div>
        </CardContent>
        <CardFooter>
          <Button onClick={handleAnalyze} disabled={isAnalyzing || imageFiles.length === 0}>
            {isAnalyzing ? "Analyzing..." : <> <Wand2 className="mr-2 h-4 w-4" /> Analyze Datesheet </>}
          </Button>
        </CardFooter>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Extracted Tests</CardTitle>
          <CardDescription>
            Here are the tests generated from your datesheet. Save them to add them to your dashboard.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {isAnalyzing ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}
            </div>
          ) : extractedTests.length > 0 ? (
            <ul className="space-y-2">
              {extractedTests.map((test, index) => (
                <li key={index} className="flex items-center justify-between p-3 rounded-md border bg-card">
                  <div>
                    <p className="font-medium">{test.testName}</p>
                    <p className="text-sm text-muted-foreground flex items-center gap-1.5">
                      <Calendar className="w-3 h-3" />
                      {format(parseISO(test.startDate), "d MMM yyyy")} - {format(parseISO(test.endDate), "d MMM yyyy")}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <div className="text-center text-muted-foreground py-10 flex flex-col items-center justify-center">
              <ImageIcon className="h-12 w-12 text-muted-foreground/50 mb-4" />
              <p>No tests extracted yet.</p>
              <p className="text-sm">Upload a datesheet image to get started.</p>
            </div>
          )}
        </CardContent>
        {extractedTests.length > 0 && (
          <CardFooter>
            <Button onClick={handleSaveTests} disabled={isSaving}>
              {isSaving ? "Saving..." : <><Save className="mr-2 h-4 w-4" /> Save All Tests</>}
            </Button>
          </CardFooter>
        )}
      </Card>
    </div>
  );
}
