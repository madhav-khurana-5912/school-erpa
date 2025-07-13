// src/components/BottomNavBar.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, CalendarDays, FileUp, FileText, MoreHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";

const menuItems = [
  { href: "/", label: "Home", icon: Home },
  { href: "/planner", label: "Planner", icon: CalendarDays },
  { href: "/import", label: "Import", icon: FileUp },
  { href: "/tests", label: "Tests", icon: FileText },
  { href: "/more", label: "More", icon: MoreHorizontal },
];

export function BottomNavBar() {
  const pathname = usePathname();
  const isMobile = useIsMobile();

  if (!isMobile) {
    return null;
  }

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 w-full md:hidden">
      <div className="flex h-16 items-stretch justify-around border-t bg-background/95 backdrop-blur-sm">
        {menuItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center gap-1 flex-1 p-2 text-xs font-medium transition-colors duration-200 ease-in-out relative group",
                isActive
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {isActive && (
                <span className="absolute top-0 h-0.5 w-1/2 rounded-b-full bg-primary transition-all duration-300"></span>
              )}
              <item.icon className="h-5 w-5" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
