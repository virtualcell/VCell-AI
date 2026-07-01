import type React from 'react';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { SidebarProvider } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/app-sidebar';
import { Auth0Provider } from '@auth0/nextjs-auth0/client';
import { AuthSync } from '@/components/auth-sync';
import { auth0 } from '@/lib/auth0';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'VCell Model Explorer',
  description: 'Professional biomodel analysis and visualization platform',
  generator: 'vcell-gsoc-frontend',
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth0.getSession();

  return (
    <html lang="en">
      <body className={inter.className}>
        <Auth0Provider user={session?.user}>
          <AuthSync />
          <SidebarProvider defaultOpen={true}>
            <AppSidebar />
            <main className="flex-1 overflow-auto">{children}</main>
          </SidebarProvider>
        </Auth0Provider>
      </body>
    </html>
  );
}
