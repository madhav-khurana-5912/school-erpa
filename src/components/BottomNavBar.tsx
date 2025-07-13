// src/components/BottomNavBar.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, CalendarDays, ClipboardCheck, FileText, MoreHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";

const menuItems = [
  { href: "/", label: "Home", icon: Home },
  { href: "/timetable", label: "Timetable", icon: CalendarDays },
  { href: "/test-scores", label: "Test Scores", icon: ClipboardCheck },
  { href: "/tests", label: "Tests", icon: FileText },
  { href: "/more", label: "More", icon: MoreHorizontal },
];

export function BottomNavBar() {
  const pathname = usePathname();
  const isMobile = useIsMobile();

  if (!isMobile) {
    return null;
  }

  // Create placeholder pages for new nav items if they don't exist
  // This is a simple example. In a real app, you would create actual pages.
  const allRoutes = ["/", "/import", "/login", "/timetable", "/test-scores", "/tests", "/more"];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 w-full md:hidden">
      <div className="flex h-16 items-center justify-around border-t bg-background/95 backdrop-blur-sm">
        {menuItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex h-full flex-col items-center justify-center gap-1 flex-1 px-2 py-2 text-xs font-medium transition-colors",
                isActive
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <item.icon className="h-5 w-5" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
