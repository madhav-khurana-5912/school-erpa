import { Header } from "@/components/Header";
import { PlannerClient } from "@/components/PlannerClient";

export default function PlannerPage() {
  return (
    <div className="flex flex-col h-full">
      <Header title="Study Planner" />
      <div className="flex-1 overflow-y-auto">
        <PlannerClient />
      </div>
    </div>
  );
}
