import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import {
  Sidebar,
  SidebarInset,
  SidebarProvider,
} from '@/components/ui/sidebar';
import { SidebarNav } from '@/components/SidebarNav';
import { BottomNavBar } from '@/components/BottomNavBar';

export const metadata: Metadata = {
  title: 'myAakash App',
  description: 'A functional study planner app',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="font-body antialiased">
        <SidebarProvider>
            <Sidebar>
              <SidebarNav />
            </Sidebar>
            <SidebarInset>
              <div className="flex-1 overflow-y-auto pb-20 md:pb-0">
                {children}
              </div>
            </SidebarInset>
            <BottomNavBar />
        </SidebarProvider>
        <Toaster />
      </body>
    </html>
  );
}
