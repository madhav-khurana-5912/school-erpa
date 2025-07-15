import type { Metadata } from 'next';
import { Roboto } from 'next/font/google';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import {
  Sidebar,
  SidebarInset,
  SidebarProvider,
} from '@/components/ui/sidebar';
import { SidebarNav } from '@/components/SidebarNav';
import { BottomNavBar } from '@/components/BottomNavBar';
import { AuthProvider } from '@/hooks/use-auth';

const roboto = Roboto({
  subsets: ['latin'],
  weight: ['400', '500', '700'],
  variable: '--font-roboto',
});

export const metadata: Metadata = {
  title: {
    default: 'School Erp - Your Personal Study Planner',
    template: '%s | School Erp',
  },
  description: 'A functional and intelligent study planner app that helps you organize your study schedule, analyze your syllabus with AI, and stay on track with your academic goals.',
  metadataBase: new URL('https://school-erp.com'), // Replace with your actual domain
  openGraph: {
    title: 'School Erp - Your Personal Study Planner',
    description: 'Organize your study schedule and analyze your syllabus with AI.',
    url: 'https://school-erp.com', // Replace with your actual domain
    siteName: 'School Erp',
    images: [
      {
        url: '/og-image.png', // Replace with a path to your Open Graph image
        width: 1200,
        height: 630,
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
        <link rel="manifest" href="/site.webmanifest" />
      </head>
      <body className={`${roboto.variable} font-body antialiased`}>
        <AuthProvider>
          <SidebarProvider>
              <Sidebar>
                <SidebarNav />
              </Sidebar>
              <SidebarInset>
                <div className="flex-1 overflow-y-auto pb-20 md:pb-0">
                  {children}
                </div>
                <BottomNavBar />
              </SidebarInset>
          </SidebarProvider>
        </AuthProvider>
        <Toaster />
      </body>
    </html>
  );
}
