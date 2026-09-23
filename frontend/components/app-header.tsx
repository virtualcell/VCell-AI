"use client";

import Image from "next/image";
import Link from "next/link";

import { SignInOutButton } from "@/components/sign-in-out-button";

/**
 * The single top bar for every page. It lives in the root layout rather than in
 * the pages so the brand and the auth controls sit in exactly the same spot
 * everywhere, and it stays put while the page below it scrolls.
 */
export function AppHeader() {
  return (
    <header className="sticky top-0 z-40 h-14 flex-shrink-0 border-b border-slate-200 bg-white/90 backdrop-blur-sm">
      <div className="flex h-full items-center justify-between gap-4 px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2">
          <Image
            src="/VCellLogoCrop.png"
            alt="VCell"
            width={28}
            height={28}
            className="h-7 w-auto rounded"
          />
          <span className="text-base font-semibold text-slate-900">
            AI Explorer
          </span>
        </Link>

        <SignInOutButton />
      </div>
    </header>
  );
}
