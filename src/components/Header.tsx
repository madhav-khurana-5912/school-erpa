"use client";

import * as React from 'react';
import { useSidebar } from "@/components/ui/sidebar";
import { Avatar, AvatarFallback } from './ui/avatar';

type HeaderProps = {
    title: string;
    children?: React.ReactNode;
}

export function Header({ title, children }: HeaderProps) {
  const { isMobile } = useSidebar();
  
  return (
    <header className="sticky top-0 z-10 flex h-16 items-center justify-between gap-4 border-b bg-background px-4 md:px-6">
      <div className="flex items-center gap-2">
        <Avatar>
            <AvatarFallback>N</AvatarFallback>
        </Avatar>
      </div>
      <h1 className="text-xl font-semibold absolute left-1/2 -translate-x-1/2">{title}</h1>
      <div className="flex items-center gap-2">
        {children}
      </div>
    </header>
  );
}
