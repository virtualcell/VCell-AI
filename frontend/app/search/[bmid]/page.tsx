"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ChatBox } from "@/components/ChatBox";
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
} from "lucide-react";

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

export default function BiomodelDetailPage() {
  const params = useParams<{ bmid: string }>();
  const bmid = params?.bmid;
  const [data, setData] = useState<BiomodelDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("overview");

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
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/biomodel?bmId=${bmid}`)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch biomodel details");
        return res.json();
      })
      .then((json) => {
        if (json.data && Array.isArray(json.data) && json.data.length > 0) {
          setData(json.data[0]);
        } else {
          setError("Biomodel not found.");
        }
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [bmid]);

  if (loading)
    return <div className="p-8 text-center">Loading biomodel...</div>;
  if (error) return <div className="p-8 text-center text-red-600">{error}</div>;
  if (!data) return null;

  const biomodelDiagramUrl = `https://vcell.cam.uchc.edu/api/v0/biomodel/${data.bmKey}/diagram`;

  return (
    <div className="min-h-screen bg-slate-50">
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
                  <button
                    onClick={() => {
                      window.open(
                        `/analyze/${data?.bmKey}?prompt=Describe%20model`,
                        "_blank",
                      );
                    }}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded border border-yellow-500 text-yellow-700 bg-white font-semibold shadow-sm transition-colors hover:bg-yellow-50 text-sm"
                  >
                    <FlaskConical className="h-4 w-4" /> AI Analysis
                  </button>
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
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="overview" className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Overview
                </TabsTrigger>
                <TabsTrigger value="analysis" className="flex items-center gap-2">
                  <Search className="h-4 w-4" />
                  AI Analysis
                </TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-6">
                {/* Biomodel Diagram block */}
                <div className="mb-6">
                  <img
                    src={biomodelDiagramUrl || "/placeholder.svg"}
                    alt="Biomodel Diagram"
                    className="max-w-full h-[350px] mx-auto border border-slate-200 rounded shadow"
                    onError={() => setError("Failed to load diagram image.")}
                    onLoad={() => setError("")}
                  />
                </div>
                
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
                        const encodedAppName = encodeURIComponent(app.name || "");
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
                                      {ov.values ? ov.values.join(", ") : "No values"}
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
                {/* AI Analysis Section */}
                <div className="mb-6">
                  <div className="flex items-center gap-2 mb-2">
                    <Search className="h-4 w-4 text-blue-400" />
                    <span className="font-semibold text-slate-800 text-sm">
                      AI Analysis Assistant
                    </span>
                  </div>
                  <div className="bg-slate-50 border border-slate-200 rounded shadow-sm h-[600px] overflow-hidden">
                    <ChatBox
                      startMessage={[]}
                      quickActions={quickActions}
                      cardTitle="VCell AI Assistant"
                      promptPrefix={`Analyze the biomodel with the bmId ${data.bmKey}`}
                      isLoading={false}
                    />
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
