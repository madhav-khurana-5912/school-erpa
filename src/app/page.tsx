// src/app/page.tsx
"use client";

import * as React from 'react';
import { Header } from "@/components/Header";
import { DashboardClient } from "@/components/DashboardClient";
import { useAuth } from '@/hooks/use-auth';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';

export default function Home() {
  const { user, loading, logout } = useAuth();
  const router = useRouter();

  React.useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  if (loading || !user) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <Header title="myAakash App">
        <Button onClick={logout} variant="outline" size="sm">Logout</Button>
      </Header>
      <div className="p-4 md:p-6">
        <DashboardClient />
      </div>
    </div>
  );
}
