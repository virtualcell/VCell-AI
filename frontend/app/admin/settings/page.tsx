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
    apiRateLimit: 24,
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
            <div className="flex justify-center">
              <Card className="shadow-lg border-slate-200 w-full max-w-4xl">
                <CardHeader className="bg-gradient-to-r from-green-100 to-green-50 border-b border-slate-200 px-6 py-5">
                  <CardTitle className="text-xl font-extrabold text-green-900 flex items-center gap-3">
                    <Shield className="h-6 w-6 text-green-500" />
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
                      API Rate Limit (requests/hour)
                    </label>
                    <Input
                      type="number"
                      value={settings.apiRateLimit}
                      onChange={(e) =>
                        handleInputChange("apiRateLimit", parseInt(e.target.value))
                      }
                      className="w-full"
                    />
                  </div>

                  <div className="pt-4">
                    <Button
                      onClick={handleSaveSettings}
                      disabled={saving}
                      className="inline-flex items-center gap-2 px-6 py-2 rounded border border-green-600 text-green-700 bg-white font-semibold shadow-sm transition-colors hover:bg-green-50"
                    >
                      <Save className="h-4 w-4" />{" "}
                      {saving ? "Saving..." : "Save Hosted Settings"}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Local Settings Tab */}
          <TabsContent value="local">
            <div className="space-y-6">
              {/* Setup Guide */}
              <Card className="shadow-lg border-slate-200">
                <CardHeader className="bg-gradient-to-r from-blue-100 to-blue-50 border-b border-slate-200 px-6 py-5">
                  <CardTitle className="text-xl font-extrabold text-blue-900 flex items-center gap-3">
                    <Monitor className="h-6 w-6 text-blue-500" />
                    Local Setup Guide
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-4">
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
                    <div className="flex items-center gap-2">
                      <code className="bg-slate-800 text-green-400 px-3 py-2 rounded flex-1">
                        # Frontend .env
                        cp frontend/.env.example frontend/.env
                        # Backend .env  
                        cp backend/.env.example backend/.env
                      </code>
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
              <Card className="shadow-lg border-slate-200">
                <CardHeader className="bg-gradient-to-r from-purple-100 to-purple-50 border-b border-slate-200 px-6 py-5">
                  <CardTitle className="text-xl font-extrabold text-purple-900 flex items-center gap-3">
                    <Monitor className="h-6 w-6 text-purple-500" />
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
                      className="inline-flex items-center gap-2 px-6 py-2 rounded border border-purple-600 text-purple-700 bg-white font-semibold shadow-sm transition-colors hover:bg-purple-50"
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
