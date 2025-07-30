"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Settings,
  Shield,
  Save,
  ArrowLeft,
  CheckCircle,
  AlertCircle,
} from "lucide-react";

interface SystemSettings {
  modelProvider: string;
  modelName: string;
  apiKey: string;
  apiRateLimit: number;
}

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<SystemSettings>({
    modelProvider: "Azure OpenAI",
    modelName: "gpt-4o-mini",
    apiKey: "sk-proj-1234567890",
    apiRateLimit: 24,
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

  const handleInputChange = (field: keyof SystemSettings, value: any) => {
    setSettings((prev) => ({ ...prev, [field]: value }));
  };

  if (loading)
    return <div className="p-8 text-center">Loading settings...</div>;

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="container mx-auto p-8 max-w-4xl">
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
              <Button
                onClick={handleSaveSettings}
                disabled={saving}
                className="inline-flex items-center gap-2 px-4 py-2 rounded border border-green-600 text-green-700 bg-white font-semibold shadow-sm transition-colors hover:bg-green-50"
              >
                <Save className="h-4 w-4" />{" "}
                {saving ? "Saving..." : "Save Settings"}
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

        {/* LLM Management Settings */}
        <div className="flex justify-center">
          <Card className="shadow-lg border-slate-200 w-full max-w-4xl">
            <CardHeader className="bg-gradient-to-r from-green-100 to-green-50 border-b border-slate-200 px-6 py-5">
              <CardTitle className="text-xl font-extrabold text-green-900 flex items-center gap-3">
                <Shield className="h-6 w-6 text-green-500" />
                LLM Management
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
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
