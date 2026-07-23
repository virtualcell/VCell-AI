"use client";

import { LogIn, LogOut } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useUser } from "@auth0/nextjs-auth0/client";

export function SignInOutButton() {
  const pathname = usePathname();
  const { user, isLoading } = useUser();

  if (isLoading) {
    return null;
  }

  const loginReturnHref = `/auth/login?returnTo=${encodeURIComponent(pathname)}`;

  return user ? (
    <Button variant="outline" size="sm" asChild>
      <a href="/auth/logout" className="flex items-center gap-2">
        <LogOut className="h-4 w-4" />
        Sign Out
      </a>
    </Button>
  ) : (
    <Button variant="outline" size="sm" asChild>
      <Link href={loginReturnHref} className="flex items-center gap-2">
        <LogIn className="h-4 w-4" />
        Sign In
      </Link>
    </Button>
  );
}
