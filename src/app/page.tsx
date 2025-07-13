// src/app/page.tsx
"use client";

import * as React from 'react';
import { useAuth } from '@/hooks/use-auth';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Loader2, Bell, Bookmark, Star } from 'lucide-react';
import { DashboardClient } from '@/components/DashboardClient';

function DashboardHeader({ name }: { name: string | null }) {
  const { logout } = useAuth();
  const getGreeting = () => {
    const hours = new Date().getHours();
    if (hours < 12) return "Good Morning";
    if (hours < 18) return "Good Afternoon";
    return "Good Evening";
  };

  return (
    <header className="sticky top-0 z-10 flex h-auto items-start justify-between gap-4 border-b bg-background p-4 md:px-6">
      <div className="flex flex-col">
        <p className="text-sm text-muted-foreground">{getGreeting()}!</p>
        <h1 className="text-xl font-bold">{name || 'User'}</h1>
      </div>
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon">
          <Bookmark className="h-5 w-5" />
          <span className="sr-only">Bookmarks</span>
        </Button>
        <Button variant="ghost" size="icon">
          <Star className="h-5 w-5" />
          <span className="sr-only">Favorites</span>
        </Button>
        <Button variant="ghost" size="icon">
          <Bell className="h-5 w-5" />
          <span className="sr-only">Notifications</span>
        </Button>
        <div className="hidden md:block">
            <Button onClick={logout} variant="outline" size="sm">Logout</Button>
        </div>
      </div>
    </header>
  );
}


export default function Home() {
  const { user, loading, logout, psid } = useAuth();
  const router = useRouter();

  React.useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  if (loading || !user) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // A simple way to capitalize the PSID for display
  const displayName = psid ? psid.charAt(0).toUpperCase() + psid.slice(1) : "User";

  return (
    <div className="flex flex-col h-full bg-gray-50/50">
       <DashboardHeader name={displayName} />
      <div className="flex-1 overflow-y-auto p-4 md:p-6">
        <DashboardClient />
      </div>
       <div className="block md:hidden m-4">
          <Button onClick={logout} variant="outline" size="sm" className="w-full">Logout</Button>
       </div>
    </div>
  );
}
