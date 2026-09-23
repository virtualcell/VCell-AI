"use client";

import { useCallback, useEffect, useState } from "react";
import {
  AlertCircle,
  AlertTriangle,
  Award,
  ChevronDown,
  Cpu,
  Database,
  Link2,
  Mail,
  Package,
  Quote,
  Scale,
  ShieldCheck,
  Tag,
  Users,
  type LucideIcon,
} from "lucide-react";

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Button } from "@/components/ui/button";
import { MarkdownRenderer } from "@/components/markdown-renderer";
import { ABOUT_INTRO, ABOUT_SECTIONS } from "@/lib/about-content";
import { cn } from "@/lib/utils";

const SECTION_ICONS: Record<string, LucideIcon> = {
  AlertTriangle,
  Cpu,
  AlertCircle,
  ShieldCheck,
  Database,
  Scale,
  Package,
  Quote,
  Users,
  Award,
  Tag,
  Mail,
};

// The disclaimer carries the most weight for a first-time visitor, so it is the
// one section that starts open.
const DEFAULT_OPEN = ["disclaimer"];

export default function AboutPage() {
  const [openIds, setOpenIds] = useState<string[]>(DEFAULT_OPEN);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const isOpen = useCallback(
    (id: string) => openIds.includes(id),
    [openIds],
  );

  const toggle = (id: string, next: boolean) => {
    setOpenIds((prev) =>
      next ? [...prev, id] : prev.filter((openId) => openId !== id),
    );
  };

  const expandAll = () => setOpenIds(ABOUT_SECTIONS.map((s) => s.id));
  const collapseAll = () => setOpenIds([]);

  // Deep links (/about#privacy) only make sense if the target section is open,
  // so open it and scroll to it. Runs on load and again whenever an in-page
  // cross-reference changes the hash.
  useEffect(() => {
    let frame = 0;

    const revealHashTarget = () => {
      const hash = window.location.hash.slice(1);
      if (!hash || !ABOUT_SECTIONS.some((s) => s.id === hash)) return;

      setOpenIds((prev) => (prev.includes(hash) ? prev : [...prev, hash]));

      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        document.getElementById(hash)?.scrollIntoView({ behavior: "smooth" });
      });
    };

    revealHashTarget();
    window.addEventListener("hashchange", revealHashTarget);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("hashchange", revealHashTarget);
    };
  }, []);

  const copyLink = async (id: string) => {
    const url = `${window.location.origin}${window.location.pathname}#${id}`;
    try {
      await navigator.clipboard.writeText(url);
      setCopiedId(id);
      window.setTimeout(() => setCopiedId(null), 1500);
    } catch {
      // Clipboard can be blocked (insecure origin, denied permission). The
      // anchor still works; silently skip the confirmation.
    }
  };

  return (
    <div className="min-h-full bg-slate-50">
      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        <header className="mb-6">
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">
            About VCell-AI
          </h1>
          <div className="mt-4 rounded-lg border border-slate-200 bg-white p-5">
            <MarkdownRenderer content={ABOUT_INTRO} />
          </div>
        </header>

        <div className="mb-4 flex items-center justify-between gap-3">
          <p className="text-sm text-slate-600">
            {ABOUT_SECTIONS.length} sections
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={expandAll}
              className="border-slate-300 text-slate-700"
            >
              Expand all
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={collapseAll}
              className="border-slate-300 text-slate-700"
            >
              Collapse all
            </Button>
          </div>
        </div>

        <div className="space-y-3">
          {ABOUT_SECTIONS.map((section) => {
            const Icon = SECTION_ICONS[section.icon] ?? AlertCircle;
            const open = isOpen(section.id);

            return (
              <Collapsible
                key={section.id}
                id={section.id}
                open={open}
                onOpenChange={(next) => toggle(section.id, next)}
                className="scroll-mt-6 overflow-hidden rounded-lg border border-slate-200 bg-white"
              >
                <div className="flex items-center">
                  <CollapsibleTrigger className="flex flex-1 items-center gap-3 px-5 py-4 text-left transition-colors hover:bg-slate-50">
                    <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-blue-50 text-xs font-semibold text-blue-700">
                      {section.number}
                    </span>
                    <Icon className="h-4 w-4 flex-shrink-0 text-slate-400" />
                    <span className="flex-1 text-base font-semibold text-slate-900">
                      {section.title}
                    </span>
                    <ChevronDown
                      className={cn(
                        "h-4 w-4 flex-shrink-0 text-slate-400 transition-transform duration-200",
                        open && "rotate-180",
                      )}
                    />
                  </CollapsibleTrigger>
                  <button
                    type="button"
                    onClick={() => copyLink(section.id)}
                    title="Copy link to this section"
                    aria-label={`Copy link to "${section.title}"`}
                    className="mr-3 rounded p-2 text-slate-300 transition-colors hover:bg-slate-100 hover:text-slate-600"
                  >
                    <Link2 className="h-4 w-4" />
                  </button>
                </div>

                <CollapsibleContent>
                  <div className="border-t border-slate-100 px-5 py-4">
                    {copiedId === section.id && (
                      <p className="mb-2 text-xs text-green-600">
                        Link copied
                      </p>
                    )}
                    <MarkdownRenderer content={section.content} />
                  </div>
                </CollapsibleContent>
              </Collapsible>
            );
          })}
        </div>

        <footer className="mt-8 text-center text-xs text-slate-500">
          <p>
            VCell-AI ·{" "}
            <a
              href="https://github.com/virtualcell/VCell-AI"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline"
            >
              Source on GitHub
            </a>
          </p>
        </footer>
      </div>
    </div>
  );
}
