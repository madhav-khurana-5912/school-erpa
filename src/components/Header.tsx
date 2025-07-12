"use client";

import * as React from 'react';
import { useSidebar } from "@/components/ui/sidebar";

type HeaderProps = {
    title: string;
    children?: React.ReactNode;
}

export function Header({ title, children }: HeaderProps) {
  const { isMobile } = useSidebar();
  
  return (
    <header className="sticky top-0 z-10 flex h-16 items-center justify-between gap-4 border-b bg-background px-4 md:px-6">
      <div className="flex items-center gap-2">
      <svg
          className="h-8 w-8"
          viewBox="0 0 100 100"
          xmlns="http://www.w3.org/2000/svg"
        >
          <circle cx="50" cy="50" r="48" fill="#00A9E2" />
          <path
            d="M50 2a48 48 0 110 96 48 48 0 010-96zm0 8a40 40 0 100 80 40 40 0 000-80z"
            fill="#fff"
          />
          <path
            d="M50 20a4 4 0 110 8 4 4 0 010-8zm-16 48a4 4 0 01-1.3-7.8L46.3 35a4 4 0 016.6 3.8l-12 28A4 4 0 0150 70a4 4 0 01-2.7-1.2l-.8-.8a4 4 0 010-5.6l.8-.8a4 4 0 015.4-1.2l12 6a4 4 0 012.6 6.8 4 4 0 01-6.8-2.6l-12-6a4 4 0 01-1.2-5.4l12-24a4 4 0 116.8 3.4l-12 24a4 4 0 01-5.4 1.2l-.8.8a4 4 0 01-5.6 0l.8-.8a4 4 0 011.2-5.4L33.7 34a4 4 0 116.8-3.4L53.7 62a4 4 0 01-2.6 6.8 4 4 0 01-6.8-2.6l-1.3-2.6-1.3-2.6-1.4-2.8a4 4 0 01-1.2-5.4L50.3 35a4 4 0 016.6-3.8l13.6 25.2a4 4 0 01-5.8 7.8L51.1 41.6l-13.4 25a4 4 0 01-6.4 1.4z"
            fill="#fff"
          />
           <path
            d="M34.48 66.01c-1.92 1.3-4.43.7-5.73-1.2l-1.3-1.92c-1.3-1.93-.7-4.43 1.2-5.73l18.5-12.33c1.93-1.3 4.43-.7 5.73 1.2l1.3 1.92c1.3 1.93.7 4.43-1.2 5.73l-18.5 12.33z M65.52 66.01c1.92 1.3 4.43.7 5.73-1.2l1.3-1.92c1.3-1.93.7-4.43-1.2-5.73L52.85 44.83c-1.93-1.3-4.43-.7-5.73 1.2l-1.3 1.92c-1.3 1.93-.7 4.43 1.2 5.73l18.5 12.33z"
            fill="#FFFFFF"
          ></path>
          <path d="M50 18a5 5 0 110 10 5 5 0 010-10z" fill="#FFFFFF"></path>
        </svg>
      </div>
      <h1 className="text-xl font-semibold absolute left-1/2 -translate-x-1/2">{title}</h1>
      <div className="flex items-center gap-2">
        {children}
      </div>
    </header>
  );
}
