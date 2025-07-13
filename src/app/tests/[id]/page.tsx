// src/app/tests/[id]/page.tsx
import { Header } from "@/components/Header";
import { TestDetailsClient } from "@/components/TestDetailsClient";
import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";
import Link from "next/link";

export default function TestDetailsPage({ params }: { params: { id: string } }) {
  return (
    <div className="flex flex-col h-full bg-gray-50/50">
        <Header title="Test Details">
            <Button variant="ghost" size="icon" asChild>
                <Link href="/tests">
                    <ChevronLeft />
                </Link>
            </Button>
        </Header>
      <div className="flex-1 overflow-y-auto">
        <TestDetailsClient testId={params.id} />
      </div>
    </div>
  );
}
