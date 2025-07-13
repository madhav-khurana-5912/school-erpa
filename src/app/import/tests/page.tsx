
import { Header } from "@/components/Header";
import { DatesheetImporter } from "@/components/DatesheetImporter";

export default function ImportTestsPage() {
  return (
    <div className="flex flex-col h-full">
      <Header title="Import Test Datesheet" />
      <div className="p-4 md:p-6">
        <DatesheetImporter />
      </div>
    </div>
  );
}
