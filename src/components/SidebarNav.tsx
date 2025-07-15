
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  CalendarDays,
  ClipboardCheck,
  FileText,
  MoreHorizontal,
  FileUp,
  FilePlus,
  ListTodo,
  School,
} from "lucide-react";
import {
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";

const menuItems = [
  { href: "/", label: "Home", icon: Home },
  { href: "/planner", label: "My Tasks", icon: ListTodo },
  { href: "/import", label: "Import Syllabus", icon: FileUp },
  { href: "/import/tests", label: "Import Tests", icon: FilePlus },
  { href: "/test-scores", label: "Test Scores", icon: ClipboardCheck },
  { href: "/tests", label: "Tests", icon: FileText },
  { href: "/more", label: "More", icon: MoreHorizontal },
];

export function SidebarNav() {
  const pathname = usePathname();

  return (
    <>
      <SidebarHeader>
        <div className="flex items-center gap-2">
          <div className="bg-blue-600 text-white rounded-md p-2">
            <School className="h-6 w-6" />
          </div>
          <span className="text-lg font-semibold">School Erp</span>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarMenu>
          {menuItems.map((item) => (
            <SidebarMenuItem key={item.href}>
              <Link href={item.href}>
                <SidebarMenuButton
                  asChild
                  isActive={(item.href === '/' && pathname === '/') || (item.href !== '/' && pathname.startsWith(item.href))}
                  tooltip={item.label}
                  className={cn(
                    "w-full justify-start",
                    "data-[active=true]:bg-primary data-[active=true]:text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground"
                  )}
                >
                  <span className="flex items-center gap-2">
                    <item.icon />
                    <span>{item.label}</span>
                  </span>
                </SidebarMenuButton>
              </Link>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>
    </>
  );
}
