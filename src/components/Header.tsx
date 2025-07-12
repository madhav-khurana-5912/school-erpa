"use client";

import * as React from 'react';
import { SidebarTrigger } from "@/components/ui/sidebar";
import { useSidebar } from "@/components/ui/sidebar";

type HeaderProps = {
    title: string;
    children?: React.ReactNode;
}

export function Header({ title, children }: HeaderProps) {
  const { isMobile } = useSidebar();
  
  return (
    <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-background px-4 md:px-6">
      {isMobile && <SidebarTrigger />}
      <h1 className="text-xl font-semibold">{title}</h1>
      <div className="ml-auto flex items-center gap-2">
        {children}
      </div>
    </header>
  );
}
