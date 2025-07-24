"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { 
  Settings, 
  Shield, 
  Database, 
  Globe, 
  Save,
  ArrowLeft,
  CheckCircle,
  AlertCircle,
  Clock
} from "lucide-react"

interface SystemSettings {
  maxFileSize: number
  allowedFileTypes: string[]
  modelProvider: string
  modelName: string
  apiRateLimit: number
  storageLimit: number
  systemMaintenance: boolean
  maintenanceMessage: string
  emailNotifications: boolean
  autoBackup: boolean
  backupFrequency: string
}

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<SystemSettings>({
    maxFileSize: 10,
    allowedFileTypes: ["pdf", "docx", "txt", "csv", "json", "png", "jpg", "jpeg", "zip"],
    modelProvider: "Azure OpenAI",
    modelName: "gpt-4",
    apiRateLimit: 100,
    storageLimit: 10,
    systemMaintenance: false,
    maintenanceMessage: "",
    emailNotifications: true,
    autoBackup: true,
    backupFrequency: "daily"
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  useEffect(() => {
    // Mock data - replace with actual API calls
    const fetchSettings = async () => {
      try {
        setLoading(true)
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 1000))
        // Settings are already initialized with default values
      } catch (err) {
        setError("Failed to load settings")
      } finally {
        setLoading(false)
      }
    }

    fetchSettings()
  }, [])

  const handleSaveSettings = async () => {
    setSaving(true)
    setError("")
    setSuccess("")
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500))
      setSuccess("Settings saved successfully!")
    } catch (err) {
      setError("Failed to save settings")
    } finally {
      setSaving(false)
    }
  }

  const handleInputChange = (field: keyof SystemSettings, value: any) => {
    setSettings(prev => ({ ...prev, [field]: value }))
  }

  if (loading) return <div className="p-8 text-center">Loading settings...</div>

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
              <p className="text-slate-600 mt-2">Configure system settings and preferences</p>
            </div>
            <div className="flex gap-3">
              <Button
                onClick={() => window.open('/admin', '_blank')}
                className="inline-flex items-center gap-2 px-4 py-2 rounded border border-blue-600 text-blue-700 bg-white font-semibold shadow-sm transition-colors hover:bg-blue-50"
              >
                <ArrowLeft className="h-4 w-4" /> Back to Dashboard
              </Button>
              <Button
                onClick={handleSaveSettings}
                disabled={saving}
                className="inline-flex items-center gap-2 px-4 py-2 rounded border border-green-600 text-green-700 bg-white font-semibold shadow-sm transition-colors hover:bg-green-50"
              >
                <Save className="h-4 w-4" /> {saving ? "Saving..." : "Save Settings"}
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

        {/* Settings Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* File Management Settings */}
          <Card className="shadow-lg border-slate-200">
            <CardHeader className="bg-gradient-to-r from-blue-100 to-blue-50 border-b border-slate-200 px-6 py-5">
              <CardTitle className="text-xl font-extrabold text-blue-900 flex items-center gap-3">
                <Database className="h-6 w-6 text-blue-500" />
                File Management
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Maximum File Size (MB)
                </label>
                <Input
                  type="number"
                  value={settings.maxFileSize}
                  onChange={(e) => handleInputChange('maxFileSize', parseInt(e.target.value))}
                  className="w-full"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Allowed File Types
                </label>
                <div className="flex flex-wrap gap-2">
                  {settings.allowedFileTypes.map((type, index) => (
                    <Badge key={index} variant="secondary" className="text-sm">
                      {type}
                    </Badge>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Storage Limit (GB)
                </label>
                <Input
                  type="number"
                  value={settings.storageLimit}
                  onChange={(e) => handleInputChange('storageLimit', parseInt(e.target.value))}
                  className="w-full"
                />
              </div>
            </CardContent>
          </Card>

          {/* LLM Management Settings */}
          <Card className="shadow-lg border-slate-200">
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
                  onChange={(e) => handleInputChange('modelProvider', e.target.value)}
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
                  onChange={(e) => handleInputChange('modelName', e.target.value)}
                  className="w-full"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  API Rate Limit (requests/hour)
                </label>
                <Input
                  type="number"
                  value={settings.apiRateLimit}
                  onChange={(e) => handleInputChange('apiRateLimit', parseInt(e.target.value))}
                  className="w-full"
                />
              </div>
            </CardContent>
          </Card>

          {/* System Maintenance Settings */}
          <Card className="shadow-lg border-slate-200">
            <CardHeader className="bg-gradient-to-r from-orange-100 to-orange-50 border-b border-slate-200 px-6 py-5">
              <CardTitle className="text-xl font-extrabold text-orange-900 flex items-center gap-3">
                <Clock className="h-6 w-6 text-orange-500" />
                System Maintenance
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-medium text-slate-700">Maintenance Mode</label>
                  <p className="text-xs text-slate-500">Put system in maintenance mode</p>
                </div>
                <Button
                  variant={settings.systemMaintenance ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleInputChange('systemMaintenance', !settings.systemMaintenance)}
                >
                  {settings.systemMaintenance ? "Enabled" : "Disabled"}
                </Button>
              </div>

              {settings.systemMaintenance && (
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Maintenance Message
                  </label>
                  <Input
                    type="text"
                    value={settings.maintenanceMessage}
                    onChange={(e) => handleInputChange('maintenanceMessage', e.target.value)}
                    placeholder="System is under maintenance..."
                    className="w-full"
                  />
                </div>
              )}

              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-medium text-slate-700">Auto Backup</label>
                  <p className="text-xs text-slate-500">Automatically backup system data</p>
                </div>
                <Button
                  variant={settings.autoBackup ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleInputChange('autoBackup', !settings.autoBackup)}
                >
                  {settings.autoBackup ? "Enabled" : "Disabled"}
                </Button>
              </div>

              {settings.autoBackup && (
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Backup Frequency
                  </label>
                  <select
                    value={settings.backupFrequency}
                    onChange={(e) => handleInputChange('backupFrequency', e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="hourly">Hourly</option>
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                  </select>
                </div>
              )}
            </CardContent>
          </Card>

          {/* System Information */}
          <Card className="shadow-lg border-slate-200">
            <CardHeader className="bg-gradient-to-r from-purple-100 to-purple-50 border-b border-slate-200 px-6 py-5">
              <CardTitle className="text-xl font-extrabold text-purple-900 flex items-center gap-3">
                <Globe className="h-6 w-6 text-purple-500" />
                System Information
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-600">System Version</span>
                <Badge variant="secondary">v1.2.3</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-600">Last Updated</span>
                <span className="text-sm text-slate-900">2024-12-19</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-600">Database Status</span>
                <Badge className="bg-green-100 text-green-800">Connected</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-600">API Status</span>
                <Badge className="bg-green-100 text-green-800">Healthy</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-600">Storage Used</span>
                <span className="text-sm text-slate-900">2.4 GB / 10 GB</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-600">Active Users</span>
                <span className="text-sm text-slate-900">892 / 1000</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
} 