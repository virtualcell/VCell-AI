"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Settings,
  Shield,
  Save,
  ArrowLeft,
  CheckCircle,
  AlertCircle,
  Server,
  Monitor,
  Copy,
  ExternalLink,
} from "lucide-react";

interface SystemSettings {
  modelProvider: string;
  modelName: string;
  apiKey: string;
  apiRateLimit: number;
}

interface LocalSettings {
  baseUrl: string;
  modelName: string;
  apiKey: string;
  port: number;
}

export default function AdminSettingsPage() {
  const [activeTab, setActiveTab] = useState("hosted");
  const [settings, setSettings] = useState<SystemSettings>({
    modelProvider: "Azure OpenAI",
    modelName: "gpt-4o-mini",
    apiKey: "sk-proj-1234567890",
    apiRateLimit: 1000000,
  });
  const [localSettings, setLocalSettings] = useState<LocalSettings>({
    baseUrl: "http://localhost:11434",
    modelName: "llama2",
    apiKey: "",
    port: 11434,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    // Mock data - replace with actual API calls
    const fetchSettings = async () => {
      try {
        setLoading(true);
        // Simulate API delay
        await new Promise((resolve) => setTimeout(resolve, 1000));
        // Settings are already initialized with default values
      } catch (err) {
        setError("Failed to load settings");
      } finally {
        setLoading(false);
      }
    };

    fetchSettings();
  }, []);

  const handleSaveSettings = async () => {
    setSaving(true);
    setError("");
    setSuccess("");

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500));
      setSuccess("Settings saved successfully!");
    } catch (err) {
      setError("Failed to save settings");
    } finally {
      setSaving(false);
    }
  };

  const handleSaveLocalSettings = async () => {
    setSaving(true);
    setError("");
    setSuccess("");

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500));
      setSuccess("Local settings saved successfully!");
    } catch (err) {
      setError("Failed to save local settings");
    } finally {
      setSaving(false);
    }
  };

  const handleInputChange = (field: keyof SystemSettings, value: any) => {
    setSettings((prev) => ({ ...prev, [field]: value }));
  };

  const handleLocalInputChange = (field: keyof LocalSettings, value: any) => {
    setLocalSettings((prev) => ({ ...prev, [field]: value }));
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  if (loading)
    return <div className="p-8 text-center">Loading settings...</div>;

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="container mx-auto p-8 max-w-6xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-extrabold text-blue-900 flex items-center gap-3">
                <Settings className="h-8 w-8 text-blue-500" />
                Admin Settings
              </h1>
              <p className="text-slate-600 mt-2">
                Configure LLM settings and preferences
              </p>
            </div>
            <div className="flex gap-3">
              <Button
                onClick={() => window.open("/admin", "_blank")}
                className="inline-flex items-center gap-2 px-4 py-2 rounded border border-blue-600 text-blue-700 bg-white font-semibold shadow-sm transition-colors hover:bg-blue-50"
              >
                <ArrowLeft className="h-4 w-4" /> Back to Dashboard
              </Button>
            </div>
          </div>
        </div>

        {/* Success/Error Messages */}
        {success && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-600" />
            <span className="text-green-800">{success}</span>
          </div>
        )}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-red-600" />
            <span className="text-red-800">{error}</span>
          </div>
        )}

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="hosted" className="flex items-center gap-2">
              <Server className="h-4 w-4" />
              Hosted Settings
            </TabsTrigger>
            <TabsTrigger value="local" className="flex items-center gap-2">
              <Monitor className="h-4 w-4" />
              Local Settings
            </TabsTrigger>
          </TabsList>

          {/* Hosted Settings Tab */}
          <TabsContent value="hosted">
            <Card className="shadow-lg border-slate-200 w-full">
              <CardHeader className="bg-gradient-to-r from-blue-100 to-blue-50 border-b border-slate-200 px-6 py-5">
                <CardTitle className="text-xl font-extrabold text-blue-900 flex items-center gap-3">
                  <Shield className="h-6 w-6 text-blue-500" />
                  Hosted LLM Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Model Provider
                  </label>
                  <Input
                    type="text"
                    value={settings.modelProvider}
                    onChange={(e) =>
                      handleInputChange("modelProvider", e.target.value)
                    }
                    className="w-full"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Model Name
                  </label>
                  <Input
                    type="text"
                    value={settings.modelName}
                    onChange={(e) =>
                      handleInputChange("modelName", e.target.value)
                    }
                    className="w-full"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    API Key
                  </label>
                  <Input
                    type="password"
                    value={settings.apiKey}
                    onChange={(e) =>
                      handleInputChange("apiKey", e.target.value)
                    }
                    className="w-full"
                    placeholder="Enter your API key"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Monthly Token Limit
                  </label>
                  <Input
                    type="number"
                    value={settings.apiRateLimit}
                    onChange={(e) =>
                      handleInputChange("apiRateLimit", parseInt(e.target.value))
                    }
                    className="w-full"
                    placeholder="e.g., 1000000 for 1M tokens"
                  />
                  <p className="text-xs text-slate-500 mt-1">
                    This applies to all users. To set a specific limit for a certain user, go to the admin dashboard and set it manually there.
                  </p>
                </div>

                <div className="pt-4">
                  <Button
                    onClick={handleSaveSettings}
                    disabled={saving}
                    className="inline-flex items-center gap-2 px-6 py-2 rounded border border-blue-600 text-blue-700 bg-white font-semibold shadow-sm transition-colors hover:bg-blue-50"
                  >
                    <Save className="h-4 w-4" />{" "}
                    {saving ? "Saving..." : "Save Hosted Settings"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Local Settings Tab */}
          <TabsContent value="local">
            <div className="space-y-6">
              {/* Setup Guide */}
              <Card className="shadow-lg border-slate-200 w-full">
                <CardHeader className="bg-gradient-to-r from-blue-100 to-blue-50 border-b border-slate-200 px-6 py-5">
                  <CardTitle className="text-xl font-extrabold text-blue-900 flex items-center gap-3">
                    <Monitor className="h-6 w-6 text-blue-500" />
                    Local Setup Guide
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-4">
                  <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                    <div className="flex items-start gap-3">
                      <svg className="h-6 w-6 text-slate-700 mt-0.5 flex-shrink-0" viewBox="0 0 16 16" fill="currentColor">
                        <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0 0 16 8c0-4.42-3.58-8-8-8z"/>
                      </svg>
                      <div className="text-blue-800 text-sm leading-relaxed">
                        <p>
                          This is a guide to setup this platform locally on your machine and use your own LLM for unlimited usage. 
                          <br/>Follow the steps below to get started with your local deployment.
                        </p>
                        <p className="mt-2">
                          For more details, check <a href="https://github.com/KacemMathlouthi/VCell-GSoC" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 underline font-medium">https://github.com/KacemMathlouthi/VCell-GSoC</a>
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-slate-50 p-4 rounded-lg space-y-3">
                    <h3 className="font-semibold text-slate-800">Step 1: Clone the Repository</h3>
                    <div className="flex items-center gap-2">
                      <code className="bg-slate-800 text-green-400 px-3 py-2 rounded flex-1">
                        git clone https://github.com/KacemMathlouthi/VCell-GSoC.git
                      </code>
                      <Button
                        onClick={() => copyToClipboard("git clone https://github.com/KacemMathlouthi/VCell-GSoC.git")}
                        size="sm"
                        variant="outline"
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="bg-slate-50 p-4 rounded-lg space-y-3">
                    <h3 className="font-semibold text-slate-800">Step 2: Configure Environment Variables</h3>
                    <p className="text-slate-600">Configure the .env files following the .env.example in both frontend and backend folders</p>
                    <div className="flex items-start gap-2">
                      <pre className="bg-slate-800 text-green-400 px-3 py-2 rounded flex-1 text-sm whitespace-pre-wrap">
{`# Frontend .env
cp frontend/.env.example frontend/.env
# Backend .env  
cp backend/.env.example backend/.env`}
                      </pre>
                      <Button
                        onClick={() => copyToClipboard("cp frontend/.env.example frontend/.env && cp backend/.env.example backend/.env")}
                        size="sm"
                        variant="outline"
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="bg-slate-50 p-4 rounded-lg space-y-3">
                    <h3 className="font-semibold text-slate-800">Step 3: Start the Application</h3>
                    <div className="flex items-center gap-2">
                      <code className="bg-slate-800 text-green-400 px-3 py-2 rounded flex-1">
                        docker compose up --build -d
                      </code>
                      <Button
                        onClick={() => copyToClipboard("docker compose up --build -d")}
                        size="sm"
                        variant="outline"
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="bg-slate-50 p-4 rounded-lg space-y-3">
                    <h3 className="font-semibold text-slate-800">Step 4: Access the Application</h3>
                    <p className="text-slate-600">Once running, access this page at:</p>
                    <div className="flex items-center gap-2">
                      <code className="bg-slate-800 text-green-400 px-3 py-2 rounded flex-1">
                        http://localhost:3000/admin/settings
                      </code>
                      <Button
                        onClick={() => window.open("http://localhost:3000/admin/settings", "_blank")}
                        size="sm"
                        variant="outline"
                      >
                        <ExternalLink className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Local Settings Form */}
              <Card className="shadow-lg border-slate-200 w-full">
                <CardHeader className="bg-gradient-to-r from-blue-100 to-blue-50 border-b border-slate-200 px-6 py-5">
                  <CardTitle className="text-xl font-extrabold text-blue-900 flex items-center gap-3">
                    <Monitor className="h-6 w-6 text-blue-500" />
                    Local LLM Configuration
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Base URL
                    </label>
                    <Input
                      type="url"
                      value={localSettings.baseUrl}
                      onChange={(e) =>
                        handleLocalInputChange("baseUrl", e.target.value)
                      }
                      className="w-full"
                      placeholder="http://localhost:11434"
                    />
                    <p className="text-sm text-slate-500 mt-1">
                      URL of your local LLM server (e.g., Ollama, LM Studio)
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Model Name
                    </label>
                    <Input
                      type="text"
                      value={localSettings.modelName}
                      onChange={(e) =>
                        handleLocalInputChange("modelName", e.target.value)
                      }
                      className="w-full"
                      placeholder="llama2"
                    />
                    <p className="text-sm text-slate-500 mt-1">
                      Name of the model you have loaded locally
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      API Key (Optional)
                    </label>
                    <Input
                      type="password"
                      value={localSettings.apiKey}
                      onChange={(e) =>
                        handleLocalInputChange("apiKey", e.target.value)
                      }
                      className="w-full"
                      placeholder="Leave empty if no authentication required"
                    />
                    <p className="text-sm text-slate-500 mt-1">
                      API key if your local server requires authentication
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Port
                    </label>
                    <Input
                      type="number"
                      value={localSettings.port}
                      onChange={(e) =>
                        handleLocalInputChange("port", parseInt(e.target.value))
                      }
                      className="w-full"
                      placeholder="11434"
                    />
                    <p className="text-sm text-slate-500 mt-1">
                      Port number of your local LLM server
                    </p>
                  </div>

                  <div className="pt-4">
                    <Button
                      onClick={handleSaveLocalSettings}
                      disabled={saving}
                      className="inline-flex items-center gap-2 px-6 py-2 rounded border border-blue-600 text-blue-700 bg-white font-semibold shadow-sm transition-colors hover:bg-blue-50"
                    >
                      <Save className="h-4 w-4" />{" "}
                      {saving ? "Saving..." : "Save Local Settings"}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
