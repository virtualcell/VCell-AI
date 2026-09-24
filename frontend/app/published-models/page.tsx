"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { BookOpen, ExternalLink } from "lucide-react";

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

export default function PublishedModelsPage() {
  const [publications, setPublications] = useState<PublishedModel[]>([]);
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
            <div className="flex items-center justify-between mb-3">
              <Badge
                variant="secondary"
                className="bg-blue-100 text-blue-800"
              >
                {publications.length} publication
                {publications.length === 1 ? "" : "s"}
              </Badge>
            </div>

            <Card className="border-slate-200 shadow-sm overflow-hidden">
              {/* Wide table: scrolls inside its own container so the page
                  itself never scrolls sideways. */}
              <div className="overflow-x-auto">
                <table className="w-full text-sm border-collapse">
                  <thead className="bg-slate-100 border-b border-slate-200">
                    <tr className="text-left text-slate-700">
                      <th className="px-4 py-3 font-semibold min-w-[320px]">
                        Title
                      </th>
                      <th className="px-4 py-3 font-semibold min-w-[200px]">
                        Authors
                      </th>
                      <th className="px-4 py-3 font-semibold">Year</th>
                      <th className="px-4 py-3 font-semibold min-w-[200px]">
                        Citation
                      </th>
                      <th className="px-4 py-3 font-semibold">PubMed</th>
                      <th className="px-4 py-3 font-semibold min-w-[180px]">
                        DOI
                      </th>
                      <th className="px-4 py-3 font-semibold min-w-[220px]">
                        Biomodels
                      </th>
                      <th className="px-4 py-3 font-semibold min-w-[120px]">
                        Owner
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {publications.map((pub) => (
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
                          {pub.doi ? (
                            <a
                              href={`https://doi.org/${pub.doi}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-700 hover:underline break-all"
                            >
                              {pub.doi}
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
            </Card>
          </>
        )}
      </div>
    </div>
  );
}
