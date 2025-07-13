import { Header } from "@/components/Header";
import { TestsClient } from "@/components/TestsClient";

export default function TestsPage() {
  return (
    <div className="flex flex-col h-full">
      <Header title="All Tests" />
      <div className="flex-1 overflow-y-auto p-4 md:p-6">
        <TestsClient />
      </div>
    </div>
  );
}
