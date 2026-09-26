"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import {
  BookOpen,
  ExternalLink,
  Search,
  ArrowUp,
  ArrowDown,
  ArrowUpDown,
} from "lucide-react";

interface PublishedBiomodel {
  bmKey: string;
  name?: string | null;
  ownerName?: string | null;
}

// A VCell publication and the biomodels it references. Mirrors the shape of
// GET /publications/listing.
interface PublishedModel {
  pubKey: string;
  title: string;
  authors?: string | null;
  year?: number | null;
  citation?: string | null;
  pubmedid?: string | null;
  doi?: string | null;
  biomodels: PublishedBiomodel[];
  owners: string[];
}

type SortDirection = "asc" | "desc";

// Each column knows how to render its own header and how to reduce a row to a
// single sortable value, so adding a column doesn't mean touching the sort.
const COLUMNS: {
  key: string;
  label: string;
  width?: string;
  numeric?: boolean;
  sortValue: (pub: PublishedModel) => string | number | null;
}[] = [
  { key: "title", label: "Title", width: "min-w-[320px]", sortValue: (p) => p.title },
  { key: "authors", label: "Authors", width: "min-w-[200px]", sortValue: (p) => p.authors ?? null },
  { key: "year", label: "Year", numeric: true, sortValue: (p) => p.year ?? null },
  { key: "citation", label: "Citation", width: "min-w-[200px]", sortValue: (p) => p.citation ?? null },
  { key: "pubmedid", label: "PubMed", numeric: true, sortValue: (p) => (p.pubmedid ? Number(p.pubmedid) : null) },
  {
    key: "biomodels",
    label: "Biomodels",
    width: "min-w-[220px]",
    // Sorted by the names as displayed, so the ordering matches what's on screen.
    sortValue: (p) => p.biomodels.map((m) => m.name || m.bmKey).join(", ") || null,
  },
  { key: "owners", label: "Owner", width: "min-w-[120px]", sortValue: (p) => p.owners.join(", ") || null },
];

export default function PublishedModelsPage() {
  const [publications, setPublications] = useState<PublishedModel[]>([]);
  const [filter, setFilter] = useState("");
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/publications/listing`,
        );
        if (!res.ok) throw new Error("Failed to load publications");
        const json = await res.json();
        if (!cancelled) setPublications(Array.isArray(json) ? json : []);
      } catch (err: any) {
        if (!cancelled) setError(err.message || "Failed to load publications");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  // One box matching anything shown in the row, like the VCell publications
  // page: a name typed into it should find the paper whether it appears in the
  // authors, the citation, a referenced model or its owner.
  const query = filter.trim().toLowerCase();
  const filtered = query
    ? publications.filter((pub) =>
        [
          pub.title,
          pub.authors,
          pub.year,
          pub.citation,
          pub.pubmedid,
          ...pub.biomodels.map((model) => model.name),
          ...pub.owners,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase()
          .includes(query),
      )
    : publications;

  const activeColumn = COLUMNS.find((column) => column.key === sortKey);
  // Sorted from a copy: `filtered` may be `publications` itself, and sorting in
  // place would reorder the fetched data permanently.
  const rows = activeColumn
    ? [...filtered].sort((a, b) => {
        const left = activeColumn.sortValue(a);
        const right = activeColumn.sortValue(b);

        // Rows with nothing in this column sit at the bottom either way, so a
        // descending sort doesn't open with a wall of blanks.
        if (left === null && right === null) return 0;
        if (left === null) return 1;
        if (right === null) return -1;

        const comparison =
          typeof left === "number" && typeof right === "number"
            ? left - right
            : String(left).localeCompare(String(right), undefined, {
                sensitivity: "base",
              });
        return sortDirection === "asc" ? comparison : -comparison;
      })
    : filtered;

  const toggleSort = (key: string) => {
    if (sortKey !== key) {
      setSortKey(key);
      setSortDirection("asc");
      return;
    }
    // Third click on the same column clears the sort and restores the
    // newest-first order the API returns.
    if (sortDirection === "asc") {
      setSortDirection("desc");
      return;
    }
    setSortKey(null);
    setSortDirection("asc");
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-[1600px] mx-auto px-6 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2.5">
            <BookOpen className="h-6 w-6 text-blue-500" />
            VCell Published Models
          </h1>
          <p className="text-slate-600 text-sm mt-1">
            Publications in the VCell database and the biomodels they reference.
          </p>
        </div>

        {error && (
          <Card className="border-red-200">
            <CardContent className="py-8 text-center text-red-600 text-sm">
              {error}
            </CardContent>
          </Card>
        )}

        {loading && !error && (
          <div className="space-y-2">
            {Array.from({ length: 8 }).map((_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        )}

        {!loading && !error && (
          <>
            <div className="flex flex-wrap items-center gap-3 mb-3">
              <div className="relative w-full max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
                <Input
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                  placeholder="Filter by title, author, citation, model or owner"
                  aria-label="Filter publications"
                  className="pl-9 border-slate-300 focus:border-blue-500"
                />
              </div>
            </div>

            <Card className="border-slate-200 shadow-sm overflow-hidden">
              {/* Wide table: scrolls inside its own container so the page
                  itself never scrolls sideways. */}
              <div className="overflow-x-auto">
                <table className="w-full text-sm border-collapse">
                  <thead className="bg-slate-100 border-b border-slate-200">
                    <tr className="text-left text-slate-700">
                      {COLUMNS.map((column) => {
                        const isSorted = sortKey === column.key;
                        return (
                          <th
                            key={column.key}
                            aria-sort={
                              isSorted
                                ? sortDirection === "asc"
                                  ? "ascending"
                                  : "descending"
                                : "none"
                            }
                            className={`px-4 py-3 font-semibold ${column.width ?? ""}`}
                          >
                            <button
                              type="button"
                              onClick={() => toggleSort(column.key)}
                              className="inline-flex items-center gap-1 hover:text-blue-700 transition-colors"
                            >
                              {isSorted ? (
                                sortDirection === "asc" ? (
                                  <ArrowUp className="h-3.5 w-3.5 shrink-0 text-blue-600" />
                                ) : (
                                  <ArrowDown className="h-3.5 w-3.5 shrink-0 text-blue-600" />
                                )
                              ) : (
                                <ArrowUpDown className="h-3.5 w-3.5 shrink-0 text-slate-400" />
                              )}
                              {column.label}
                            </button>
                          </th>
                        );
                      })}
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((pub) => (
                      <tr
                        key={pub.pubKey}
                        className="border-b border-slate-100 last:border-0 hover:bg-slate-50 align-top"
                      >
                        <td className="px-4 py-3 text-slate-900 font-medium">
                          {pub.title}
                        </td>
                        <td className="px-4 py-3 text-slate-600 italic">
                          {pub.authors || "—"}
                        </td>
                        <td className="px-4 py-3 text-slate-700 whitespace-nowrap">
                          {pub.year ?? "—"}
                        </td>
                        <td className="px-4 py-3 text-slate-600">
                          {pub.citation || "—"}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          {pub.pubmedid ? (
                            <a
                              href={`https://pubmed.ncbi.nlm.nih.gov/${pub.pubmedid}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-700 hover:underline inline-flex items-center gap-1"
                            >
                              {pub.pubmedid}
                              <ExternalLink className="h-3 w-3" />
                            </a>
                          ) : (
                            <span className="text-slate-400">—</span>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          {pub.biomodels.length > 0 ? (
                            <div className="flex flex-col gap-1">
                              {pub.biomodels.map((model) => (
                                <Link
                                  key={model.bmKey}
                                  href={`/search/${model.bmKey}`}
                                  className="text-blue-700 hover:underline"
                                >
                                  {model.name || model.bmKey}
                                </Link>
                              ))}
                            </div>
                          ) : (
                            <span className="text-slate-400">—</span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-slate-700">
                          {pub.owners.length > 0 ? (
                            pub.owners.join(", ")
                          ) : (
                            <span className="text-slate-400">—</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {filtered.length === 0 && (
                <div className="py-12 text-center text-slate-500 text-sm">
                  No publications match “{filter}”.
                </div>
              )}
            </Card>
          </>
        )}
      </div>
    </div>
  );
}
