import type React from 'react';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { SidebarProvider } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/app-sidebar';
import { AppHeader } from '@/components/app-header';
import { Auth0Provider } from '@auth0/nextjs-auth0/client';
import { AuthSync } from '@/components/auth-sync';
import { auth0 } from '@/lib/auth0';
import { ChatHistoryProvider } from '@/hooks/use-chat-history';

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
          <ChatHistoryProvider>
            <SidebarProvider defaultOpen={true}>
              <AppSidebar />
              {/* The header sits outside the scrolling <main> so it holds the
                  same position on every page while the content scrolls. */}
              <div className="flex h-svh min-w-0 flex-1 flex-col">
                <AppHeader />
                <main className="flex-1 overflow-auto">{children}</main>
              </div>
            </SidebarProvider>
          </ChatHistoryProvider>
        </Auth0Provider>
      </body>
    </html>
  );
}
