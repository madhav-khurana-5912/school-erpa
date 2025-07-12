import { Header } from "@/components/Header";
import { DashboardClient } from "@/components/DashboardClient";

export default function Home() {
  return (
    <div className="flex flex-col h-full">
      <Header title="Dashboard" />
      <div className="p-4 md:p-6">
        <DashboardClient />
      </div>
    </div>
  );
}
