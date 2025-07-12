import { Header } from "@/components/Header";
import { SyllabusImporter } from "@/components/SyllabusImporter";

export default function ImportPage() {
  return (
    <div className="flex flex-col h-full">
      <Header title="Import Syllabus" />
      <div className="p-4 md:p-6">
        <SyllabusImporter />
      </div>
    </div>
  );
}
