"use client";

import { useEffect, useRef, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ChatBox } from "@/components/ChatBox";
import { BnglVisualizerSection } from "@/components/BnglVisualizerSection";
import {
  User,
  Lock,
  Globe,
  Calendar,
  Hash,
  Layers,
  FlaskConical,
  Users,
  FileText,
  ChevronsUpDown,
  Search,
  Dna,
  Gauge,
  Atom,
  Briefcase,
  Cog,
  BookOpen,
  ExternalLink,
  Sparkles,
} from "lucide-react";
import { MarkdownRenderer } from "@/components/markdown-renderer";
import { useUser } from "@auth0/nextjs-auth0/client";
import { LoginRequiredDialog } from "@/components/login-required-dialog";
import { SignInOutButton } from "@/components/sign-in-out-button";
import { getOptionalAccessToken } from "@/lib/get-optional-access-token";
import { useChatHistory } from "@/hooks/use-chat-history";

interface Simulation {
  key: string;
  branchId: string;
  name: string;
  ownerName: string;
  ownerKey: string;
  mathKey: string;
  solverName: string;
  scanCount: number;
  bioModelLink: {
    bioModelKey: string;
    bioModelBranchId: string;
    bioModelName: string;
    simContextKey: string;
    simContextBranchId: string;
    simContextName: string;
  };
  overrides: Array<{
    name: string;
    type: string;
    values: string[];
    cardinality: number;
  }>;
}

interface Application {
  key: string;
  branchId: string;
  name: string;
  ownerName: string;
  ownerKey: string;
  mathKey: string;
}

// A publication from the VCell publication database that references this
// biomodel. Most fields are optional: a handful of records are missing a DOI,
// a PubMed ID or a citation string.
interface Publication {
  pubKey: string;
  title: string;
  authors?: string | string[];
  year?: number;
  citation?: string;
  pubmedid?: string;
  doi?: string;
  url?: string;
  date?: string;
}

// A precomputed, biologist-facing Markdown explanation of the model. Absent
// (404) for biomodels the generation job hasn't covered yet.
interface BiomodelSummary {
  bmKey: string;
  summary: string;
  modelUsed?: string;
  generatedAt?: string;
}

interface BiomodelDetail {
  bmKey: string;
  name: string;
  privacy: number;
  groupUsers: string[];
  savedDate: number;
  annot: string;
  branchID: string;
  modelKey: string;
  ownerName: string;
  ownerKey: string;
  simulations: Simulation[];
  applications: Application[];
}

// The VCell API splits an author list on commas, so surnames and initials
// arrive as separate array elements. The backend already rejoins them; this
// just covers the case where the raw array comes through.
function formatAuthors(authors?: string | string[]): string | null {
  if (!authors) return null;
  const text = Array.isArray(authors)
    ? authors
        .map((a) => a.trim())
        .filter(Boolean)
        .join(", ")
    : authors;
  return text.trim() || null;
}

// Only the calendar date matters for a publication. Parsing the full ISO
// timestamp would shift the day for viewers west of the server's offset, so
// take the date straight off the string instead.
function formatPublicationDate(value?: string): string | null {
  if (!value) return null;
  const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(value);
  if (!match) return null;
  const [, year, month, day] = match;
  return new Date(
    Date.UTC(Number(year), Number(month) - 1, Number(day)),
  ).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  });
}

export default function BiomodelDetailPage() {
  const params = useParams<{ bmid: string }>();
  const bmid = params?.bmid;
  const router = useRouter();
  const searchParams = useSearchParams();
  const conversationId = searchParams.get("c");
  const { isHydrated } = useChatHistory();
  const [data, setData] = useState<BiomodelDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState(
    conversationId ? "analysis" : "overview",
  );
  const [diagramAnalysis, setDiagramAnalysis] = useState("");
  const [combinedMessages, setCombinedMessages] = useState<string[]>([]);
  const [showLoginDialog, setShowLoginDialog] = useState(false);
  const [diagramImageUrl, setDiagramImageUrl] = useState("");
  const [diagramError, setDiagramError] = useState("");
  const [publications, setPublications] = useState<Publication[]>([]);
  const [summary, setSummary] = useState<BiomodelSummary | null>(null);
  const [summaryLoading, setSummaryLoading] = useState(true);
  const { user, isLoading: isUserLoading } = useUser();
  const diagramFetchTriggeredRef = useRef(false);

  // Chat history hydrates from localStorage asynchronously. If we're
  // resuming a specific conversation, wait for that to finish before
  // mounting ChatBox — otherwise a getConversation() miss would look like
  // "conversation not found" even though it just hasn't loaded yet.
  const isResumingConversation = !!conversationId && !isHydrated;

  const quickActions = [
    {
      label: "Describe biology of the model",
      value: "Describe biology of the model",
      icon: <Dna className="h-4 w-4" />,
    },
    {
      label: "Describe parameters",
      value: "Describe parameters",
      icon: <Gauge className="h-4 w-4" />,
    },
    {
      label: "Describe species",
      value: "Describe species",
      icon: <Atom className="h-4 w-4" />,
    },
    {
      label: "Describe reactions",
      value: "Describe reactions",
      icon: <FlaskConical className="h-4 w-4" />,
    },
    {
      label: "What Applications are used?",
      value: "What Applications are used?",
      icon: <Briefcase className="h-4 w-4" />,
    },
    {
      label: "What solvers are used?",
      value: "What solvers are used?",
      icon: <Cog className="h-4 w-4" />,
    },
    {
      label: "Analyze VCML",
      value: "Analyze VCML",
      icon: <FileText className="h-4 w-4" />,
    },
  ];

  useEffect(() => {
    if (!bmid) return;
    setLoading(true);
    setError("");
    (async () => {
      try {
        const token = await getOptionalAccessToken();
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/biomodel?bmId=${bmid}`,
          { headers: token ? { Authorization: `Bearer ${token}` } : undefined },
        );
        if (!res.ok) throw new Error("Failed to fetch biomodel details");
        const json = await res.json();
        if (json.data && Array.isArray(json.data) && json.data.length > 0) {
          setData(json.data[0]);
        } else {
          setError("Biomodel not found.");
        }
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    })();
  }, [bmid]);

  // Publications are supplementary metadata — most biomodels have none, so a
  // failure here just leaves the section hidden rather than surfacing an error.
  useEffect(() => {
    if (!data?.bmKey) return;
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/biomodel/${data.bmKey}/publications`,
        );
        if (!res.ok) throw new Error("Failed to fetch publications");
        const json = await res.json();
        if (!cancelled) setPublications(Array.isArray(json) ? json : []);
      } catch {
        if (!cancelled) setPublications([]);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [data?.bmKey]);

  // The precomputed model summary. A 404 just means this biomodel hasn't been
  // summarized yet, which is expected — not an error worth surfacing.
  useEffect(() => {
    if (!data?.bmKey) return;
    let cancelled = false;
    setSummaryLoading(true);
    (async () => {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/biomodel/${data.bmKey}/summary`,
        );
        if (!res.ok) throw new Error("No summary available");
        const json = await res.json();
        if (!cancelled) setSummary(json);
      } catch {
        if (!cancelled) setSummary(null);
      } finally {
        if (!cancelled) setSummaryLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [data?.bmKey]);

  useEffect(() => {
    if (!data?.bmKey) return;
    setDiagramError("");
    (async () => {
      try {
        const token = await getOptionalAccessToken();
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/biomodel/${data.bmKey}/diagram/image`,
          { headers: token ? { Authorization: `Bearer ${token}` } : undefined },
        );
        if (!res.ok) throw new Error("Failed to load diagram image.");
        const blob = await res.blob();
        setDiagramImageUrl(URL.createObjectURL(blob));
      } catch (err: any) {
        setDiagramError(err.message || "Failed to load diagram image.");
      }
    })();
  }, [data?.bmKey]);

  useEffect(() => {
    if (!data?.bmKey) return;
    if (activeTab !== "analysis") return;
    if (isUserLoading || !user) return;
    // Resuming a saved conversation — its diagram analysis (if any) is
    // already part of the stored history, no need to regenerate it.
    if (conversationId) return;
    if (diagramFetchTriggeredRef.current) return;
    diagramFetchTriggeredRef.current = true;

    // Diagram analyses are being precomputed and stored for all biomodels
    // instead of generated on demand per request, so skip the /diagram
    // call for now and show a placeholder instead.
    const fetchDiagramAnalysis = async () => {
      setDiagramAnalysis(
        "AI generated summary/analysis of this biomodel will be displayed here.",
      );
    };

    fetchDiagramAnalysis();
  }, [data?.bmKey, activeTab, isUserLoading, user, conversationId]);

  // Seed the chat with the precomputed summary so follow-up questions carry it
  // as context, falling back to the placeholder for models without one.
  useEffect(() => {
    if (summaryLoading) return;
    if (summary?.summary) {
      setCombinedMessages([`# Model Summary\n\n${summary.summary}`]);
    } else if (diagramAnalysis) {
      setCombinedMessages([`# Diagram Analysis \n ${diagramAnalysis}`]);
    }
  }, [diagramAnalysis, summary, summaryLoading]);

  if (error) return <div className="p-8 text-center text-red-600">{error}</div>;
  if (!data) return null;

  const handleTabChange = (value: string) => {
    if (value !== "analysis") {
      setActiveTab(value);
      return;
    }
    if (isUserLoading) return;
    if (!user) {
      setShowLoginDialog(true);
      return;
    }
    setActiveTab(value);
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <LoginRequiredDialog
        open={showLoginDialog}
        onOpenChange={setShowLoginDialog}
      />
      <div className="container mx-auto p-8 max-w-6xl">
        <Card className="mb-8 shadow-lg border-slate-200">
          <CardHeader className="bg-gradient-to-r from-blue-100 to-blue-50 border-b border-slate-200 px-5 py-4 flex flex-col md:flex-row md:items-center md:justify-between">
            <div className="flex flex-col gap-1.5 w-full">
              <div className="flex items-center justify-between w-full">
                <CardTitle className="text-2xl font-extrabold text-blue-900 flex items-center gap-2.5">
                  <FlaskConical className="h-7 w-7 text-blue-500" />
                  {data.name}
                </CardTitle>
                <div className="flex gap-2.5">
                  <button
                    onClick={() => {
                      const vcellUrl = `https://vcell.cam.uchc.edu/api/v0/biomodel/${data?.bmKey}/biomodel.vcml`;
                      window.open(vcellUrl, "_blank");
                    }}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded border border-blue-600 text-blue-700 bg-white font-semibold shadow-sm transition-colors hover:bg-blue-50 text-sm"
                  >
                    <FileText className="h-4 w-4" /> Download VCML
                  </button>
                  <SignInOutButton />
                  {/* <button
                    onClick={() => {
                      window.open(
                        `/analyze/${data?.bmKey}?prompt=Describe%20model`,
                        "_blank",
                      );
                    }}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded border border-yellow-500 text-yellow-700 bg-white font-semibold shadow-sm transition-colors hover:bg-yellow-50 text-sm"
                  >
                    <FlaskConical className="h-4 w-4" /> AI Analysis
                  </button> */}
                </div>
              </div>
              <div className="flex flex-wrap gap-3 mt-2 text-sm text-slate-600">
                <span className="flex items-center gap-1">
                  <Hash className="h-4 w-4 text-blue-400" />{" "}
                  <span className="font-mono text-blue-700">{data.bmKey}</span>
                </span>
                <span className="flex items-center gap-1">
                  <User className="h-4 w-4 text-blue-400" /> {data.ownerName}
                </span>
                <span className="flex items-center gap-1">
                  <Calendar className="h-4 w-4 text-blue-400" />{" "}
                  {new Date(data.savedDate).toLocaleString()}
                </span>
                <span className="flex items-center gap-1">
                  {data.privacy === 1 ? (
                    <Lock className="h-4 w-4 text-red-400" />
                  ) : (
                    <Globe className="h-4 w-4 text-green-500" />
                  )}
                  <span
                    className={
                      data.privacy === 1 ? "text-red-600" : "text-green-600"
                    }
                  >
                    {data.privacy === 1 ? "Private" : "Public"}
                  </span>
                </span>
                {data.groupUsers.length > 0 && (
                  <span className="flex items-center gap-1">
                    <Users className="h-4 w-4 text-blue-400" />{" "}
                    {data.groupUsers.join(", ")}
                  </span>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-6 bg-white">
            <Tabs
              value={activeTab}
              onValueChange={handleTabChange}
              className="w-full"
            >
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger
                  value="overview"
                  className="flex items-center gap-2 font-bold text-slate-600 data-[state=active]:text-foreground"
                >
                  <FileText className="h-4 w-4" />
                  Overview
                </TabsTrigger>
                <TabsTrigger
                  value="analysis"
                  className="flex items-center gap-2 font-bold text-slate-600 data-[state=active]:text-foreground"
                >
                  <Search className="h-4 w-4" />
                  AI Analysis
                </TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-6">
                {/* Biomodel Diagram block */}
                <div className="mb-6">
                  {diagramError ? (
                    <div className="text-center text-red-600 py-8">
                      {diagramError}
                    </div>
                  ) : (
                    <img
                      src={diagramImageUrl || "/placeholder.svg"}
                      alt="Biomodel Diagram"
                      className="max-w-full h-[350px] mx-auto border border-slate-200 rounded shadow"
                    />
                  )}
                </div>

                {/* BNGL Visualization Section */}
                <BnglVisualizerSection biomodelId={data.bmKey} />

                {/* Description Section */}
                <Collapsible className="mb-6" defaultOpen>
                  <CollapsibleTrigger asChild>
                    <div className="flex items-center gap-2 mb-2 cursor-pointer hover:bg-slate-50 p-2 rounded transition-colors">
                      <FileText className="h-4 w-4 text-blue-400" />
                      <span className="font-semibold text-slate-800 text-sm">
                        Description
                      </span>
                      <ChevronsUpDown className="h-4 w-4 text-slate-400 ml-auto" />
                    </div>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <div className="whitespace-pre-line text-slate-700 bg-blue-50 rounded p-3 border border-blue-100 shadow-sm text-sm">
                      {data.annot && data.annot.trim() !== ""
                        ? data.annot
                        : "No description is available for this biomodel"}
                    </div>
                  </CollapsibleContent>
                </Collapsible>

                {/* Publications Section — hidden entirely for the great
                    majority of biomodels, which no publication references. */}
                {publications.length > 0 && (
                  <Collapsible className="mb-6" defaultOpen>
                    <CollapsibleTrigger asChild>
                      <div className="flex items-center gap-2 mb-2 cursor-pointer hover:bg-slate-50 p-2 rounded transition-colors">
                        <BookOpen className="h-4 w-4 text-blue-400" />
                        <span className="font-semibold text-slate-800 text-sm">
                          Publications
                        </span>
                        <span className="text-xs text-slate-500">
                          ({publications.length})
                        </span>
                        <ChevronsUpDown className="h-4 w-4 text-slate-400 ml-auto" />
                      </div>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <ul className="space-y-2 mt-1">
                        {publications.map((pub) => {
                          const doiUrl = pub.doi
                            ? `https://doi.org/${pub.doi}`
                            : null;
                          const pubmedUrl = pub.pubmedid
                            ? `https://pubmed.ncbi.nlm.nih.gov/${pub.pubmedid}`
                            : pub.url || null;
                          const primaryUrl = doiUrl || pubmedUrl;
                          const authors = formatAuthors(pub.authors);
                          const publishedOn = formatPublicationDate(pub.date);
                          return (
                            <li
                              key={pub.pubKey}
                              className="bg-slate-50 border border-slate-200 rounded p-3 shadow-sm"
                            >
                              {primaryUrl ? (
                                <a
                                  href={primaryUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="font-medium text-blue-900 hover:text-blue-700 hover:underline inline-flex items-start gap-1 text-sm"
                                >
                                  {pub.title}
                                  <ExternalLink className="h-3 w-3 mt-0.5 shrink-0 text-blue-400" />
                                </a>
                              ) : (
                                <span className="font-medium text-blue-900 text-sm">
                                  {pub.title}
                                </span>
                              )}
                              {authors && (
                                <div className="text-xs text-slate-600 italic mt-1">
                                  {authors}
                                </div>
                              )}
                              {(pub.citation || pub.year) && (
                                <div className="text-xs text-slate-500 mt-1">
                                  {pub.citation || pub.year}
                                </div>
                              )}
                              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-2 text-xs text-slate-500">
                                {publishedOn && (
                                  <span className="inline-flex items-center gap-1">
                                    <Calendar className="h-3 w-3 text-slate-400" />
                                    {publishedOn}
                                  </span>
                                )}
                                {pub.doi && (
                                  <a
                                    href={doiUrl!}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-blue-700 hover:underline"
                                  >
                                    DOI: {pub.doi}
                                  </a>
                                )}
                                {pub.pubmedid && (
                                  <a
                                    href={`https://pubmed.ncbi.nlm.nih.gov/${pub.pubmedid}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-blue-700 hover:underline"
                                  >
                                    PubMed: {pub.pubmedid}
                                  </a>
                                )}
                                <span>
                                  Pub Key:{" "}
                                  <span className="font-mono text-blue-700">
                                    {pub.pubKey}
                                  </span>
                                </span>
                              </div>
                            </li>
                          );
                        })}
                      </ul>
                    </CollapsibleContent>
                  </Collapsible>
                )}

                {/* Applications Section */}
                <Collapsible className="mb-6" defaultOpen>
                  <CollapsibleTrigger asChild>
                    <div className="flex items-center gap-2 mb-2 cursor-pointer hover:bg-slate-50 p-2 rounded transition-colors">
                      <Layers className="h-4 w-4 text-blue-400" />
                      <span className="font-semibold text-slate-800 text-sm">
                        Applications
                      </span>
                      <ChevronsUpDown className="h-4 w-4 text-slate-400 ml-auto" />
                    </div>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <ul className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-1">
                      {data.applications?.map((app) => {
                        const encodedAppName = encodeURIComponent(
                          app.name || "",
                        );
                        const bnglUrl = `https://vcell.cam.uchc.edu/api/v0/biomodel/${data.bmKey}/biomodel.bngl?appname=${encodedAppName}`;
                        const sbmlUrl = `https://vcell.cam.uchc.edu/api/v0/biomodel/${data.bmKey}/biomodel.sbml?appname=${encodedAppName}`;
                        return (
                          <li
                            key={app.key}
                            className="bg-slate-50 border border-slate-200 rounded p-2 flex flex-col gap-1 shadow-sm"
                          >
                            <span className="font-medium text-blue-900 flex items-center gap-2 text-sm">
                              <Hash className="h-3 w-3 text-blue-300" />
                              {app.name}
                            </span>
                            <span className="text-xs text-slate-500 flex gap-3">
                              App Key:{" "}
                              <span className="font-mono text-blue-700">
                                {app.key}
                              </span>
                              MathKey:{" "}
                              <span className="font-mono text-blue-700">
                                {app.mathKey}
                              </span>
                            </span>
                            <div className="flex gap-2 mt-1">
                              <button
                                onClick={() => window.open(bnglUrl, "_blank")}
                                className="inline-flex items-center gap-1 px-2 py-1 rounded border border-green-600 text-green-700 bg-white font-semibold shadow-sm transition-colors hover:bg-green-50 text-xs"
                              >
                                Download BNGL
                              </button>
                              <button
                                onClick={() => window.open(sbmlUrl, "_blank")}
                                className="inline-flex items-center gap-1 px-2 py-1 rounded border border-blue-600 text-blue-700 bg-white font-semibold shadow-sm transition-colors hover:bg-blue-50 text-xs"
                              >
                                Download SBML
                              </button>
                            </div>
                          </li>
                        );
                      })}
                    </ul>
                  </CollapsibleContent>
                </Collapsible>

                {/* Simulations Section */}
                <Collapsible defaultOpen>
                  <CollapsibleTrigger asChild>
                    <div className="flex items-center gap-2 mb-2 cursor-pointer hover:bg-slate-50 p-2 rounded transition-colors">
                      <FlaskConical className="h-4 w-4 text-blue-400" />
                      <span className="font-semibold text-slate-800 text-sm">
                        Simulations
                      </span>
                      <ChevronsUpDown className="h-4 w-4 text-slate-400 ml-auto" />
                    </div>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <ul className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-1">
                      {data.simulations?.map((sim) => (
                        <li
                          key={sim.key}
                          className="bg-slate-50 border border-slate-200 rounded p-2 shadow-sm"
                        >
                          <div className="font-medium text-blue-900 flex items-center gap-2 mb-1 text-sm">
                            <Hash className="h-3 w-3 text-blue-300" />
                            {sim.name}
                          </div>
                          <div className="text-xs text-slate-500 mb-1 flex flex-wrap gap-2">
                            <span>
                              Solver:{" "}
                              <span className="font-mono text-blue-700">
                                {sim.solverName}
                              </span>
                            </span>
                            <span>
                              Scan Count:{" "}
                              <span className="font-mono text-blue-700">
                                {sim.scanCount}
                              </span>
                            </span>
                            <span>
                              Sim Context:{" "}
                              <span className="font-mono text-blue-700">
                                {sim.bioModelLink.simContextName}
                              </span>
                            </span>
                          </div>
                          {sim.overrides && sim.overrides.length > 0 && (
                            <div className="text-xs text-slate-600 mt-2">
                              <strong>Overrides:</strong>
                              <ul className="list-disc ml-4">
                                {sim.overrides.map((ov, i) => (
                                  <li key={i}>
                                    {ov.name} ({ov.type}):{" "}
                                    <span className="font-mono text-blue-700">
                                      {ov.values
                                        ? ov.values.join(", ")
                                        : "No values"}
                                    </span>{" "}
                                    (Cardinality: {ov.cardinality})
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </li>
                      ))}
                    </ul>
                  </CollapsibleContent>
                </Collapsible>
              </TabsContent>

              <TabsContent value="analysis" className="space-y-6">
                {/* Precomputed model summary. Rendered only when one exists —
                    models the generation job hasn't reached show nothing here
                    and fall back to the chat placeholder below. */}
                {summary?.summary && (
                  <Collapsible className="mb-6" defaultOpen>
                    <CollapsibleTrigger asChild>
                      <div className="flex items-center gap-2 mb-2 cursor-pointer hover:bg-slate-50 p-2 rounded transition-colors">
                        <Sparkles className="h-4 w-4 text-blue-400" />
                        <span className="font-semibold text-slate-800 text-sm">
                          Model Summary
                        </span>
                        {summary.generatedAt && (
                          <span className="text-xs text-slate-500">
                            generated{" "}
                            {formatPublicationDate(summary.generatedAt) ??
                              "recently"}
                          </span>
                        )}
                        <ChevronsUpDown className="h-4 w-4 text-slate-400 ml-auto" />
                      </div>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <div className="bg-blue-50 border border-blue-100 rounded p-4 shadow-sm overflow-x-auto">
                        <MarkdownRenderer content={summary.summary} />
                      </div>
                    </CollapsibleContent>
                  </Collapsible>
                )}

                {/* AI Analysis Section */}
                <div className="mb-6">
                  <div className="flex items-center gap-2 mb-2">
                    <Search className="h-4 w-4 text-blue-400" />
                    <span className="font-semibold text-slate-800 text-sm">
                      AI Analysis Assistant
                    </span>
                  </div>
                  <div className="bg-slate-50 border border-slate-200 rounded shadow-sm h-[600px] overflow-hidden">
                    {isResumingConversation ? (
                      <div className="h-full flex items-center justify-center text-slate-500 text-sm">
                        Loading conversation...
                      </div>
                    ) : (
                      <ChatBox
                        key={conversationId ?? "new"}
                        startMessage={combinedMessages}
                        quickActions={quickActions}
                        cardTitle="VCell AI Assistant"
                        promptPrefix={`Analyze the biomodel with the bmId ${data.bmKey}`}
                        isLoading={false}
                        surface="search"
                        contextId={data.bmKey}
                        conversationId={conversationId}
                        conversationTitle={data.name}
                        onConversationSaved={(id) =>
                          router.replace(`/search/${data.bmKey}?c=${id}`)
                        }
                      />
                    )}
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
