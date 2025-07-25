"use client"

import { useEffect, useState, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { 
  FileText, 
  Upload, 
  Download, 
  Eye, 
  Trash2, 
  Search,
  FolderOpen,
  File,
  FileImage,
  FileCode,
  FileArchive,
  Calendar,
  HardDrive,
  Plus,
  Filter
} from "lucide-react"

interface KnowledgeFile {
  id: string
  name: string
  type: "pdf" | "docx" | "txt" | "csv" | "json" | "image" | "archive" | "other"
  size: number
  uploadDate: string
  uploadedBy: string
  description: string
  tags?: string[]
  status: "active" | "archived" | "processing"
  content?: string
}

export default function KnowledgeBasePage() {
  const [files, setFiles] = useState<KnowledgeFile[]>([])
  const [filteredFiles, setFilteredFiles] = useState<KnowledgeFile[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedFile, setSelectedFile] = useState<KnowledgeFile | null>(null)
  const [showUploadModal, setShowUploadModal] = useState(false)
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    // Mock data - replace with actual API calls
    const fetchFiles = async () => {
      try {
        setLoading(true)
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 1000))
        
        // Mock files data
        const mockFiles: KnowledgeFile[] = [
          {
            id: "1",
            name: "VCell_Quickstart_7_B.pdf",
            type: "pdf",
            size: 706000,
            uploadDate: "2019-12-23T15:38:00Z",
            uploadedBy: "admin@example.com",
            description: "VCell Quickstart Guide version 7",
            status: "active"
          },
          {
            id: "2",
            name: "VCell_Quickstart_6.pdf",
            type: "pdf",
            size: 872000,
            uploadDate: "2016-11-01T11:01:00Z",
            uploadedBy: "admin@example.com",
            description: "VCell Quickstart Guide version 6",
            status: "active"
          },
          {
            id: "3",
            name: "VCell6.1_Rule-Based_Modeling.pdf",
            type: "pdf",
            size: 8200000,
            uploadDate: "2017-07-18T15:51:00Z",
            uploadedBy: "admin@example.com",
            description: "Rule-Based Modeling Guide for VCell 6.1",
            status: "active"
          },
          {
            id: "4",
            name: "VCell6.1_Rule-Based_Modeling_Extended.pdf",
            type: "pdf",
            size: 9800000,
            uploadDate: "2017-07-18T16:19:00Z",
            uploadedBy: "admin@example.com",
            description: "Extended Rule-Based Modeling Guide for VCell 6.1",
            status: "active"
          },
          {
            id: "5",
            name: "Tutorial06_PathwayComplex.pdf",
            type: "pdf",
            size: 4500000,
            uploadDate: "2016-11-01T11:51:00Z",
            uploadedBy: "admin@example.com",
            description: "Tutorial 06: Pathway Complex Modeling",
            status: "active"
          },
          {
            id: "6",
            name: "SpatialRuleBasedGuide.pdf",
            type: "pdf",
            size: 679000,
            uploadDate: "2017-06-14T19:25:00Z",
            uploadedBy: "admin@example.com",
            description: "Spatial Rule-Based Modeling Guide",
            status: "active"
          },
          {
            id: "7",
            name: "SingleCompartmentRuleBased.pdf",
            type: "pdf",
            size: 1300000,
            uploadDate: "2017-06-14T19:25:00Z",
            uploadedBy: "admin@example.com",
            description: "Single Compartment Rule-Based Modeling",
            status: "active"
          },
          {
            id: "8",
            name: "SimpleFRAP_7.2.pdf",
            type: "pdf",
            size: 8200000,
            uploadDate: "2020-05-11T08:07:00Z",
            uploadedBy: "admin@example.com",
            description: "Simple FRAP Tutorial version 7.2",
            status: "active"
          },
          {
            id: "9",
            name: "SimpleFRAP_7.0.pdf",
            type: "pdf",
            size: 3700000,
            uploadDate: "2019-04-30T15:17:00Z",
            uploadedBy: "admin@example.com",
            description: "Simple FRAP Tutorial version 7.0",
            status: "active"
          },
          {
            id: "10",
            name: "PHGFP_7.2.pdf",
            type: "pdf",
            size: 9500000,
            uploadDate: "2020-07-24T16:42:00Z",
            uploadedBy: "admin@example.com",
            description: "PHGFP Tutorial version 7.2",
            status: "active"
          },
          {
            id: "11",
            name: "PHGFP_7.0.pdf",
            type: "pdf",
            size: 5500000,
            uploadDate: "2019-05-01T13:27:00Z",
            uploadedBy: "admin@example.com",
            description: "PHGFP Tutorial version 7.0",
            status: "active"
          },
          {
            id: "12",
            name: "MultiApp_Tutorial_Data.txt",
            type: "txt",
            size: 433,
            uploadDate: "2018-11-02T08:23:00Z",
            uploadedBy: "admin@example.com",
            description: "MultiApp Tutorial Data File",
            status: "active"
          },
          {
            id: "13",
            name: "MultiAppTransport_7.2.pdf",
            type: "pdf",
            size: 16000000,
            uploadDate: "2020-05-11T08:27:00Z",
            uploadedBy: "admin@example.com",
            description: "MultiApp Transport Tutorial version 7.2",
            status: "active"
          },
          {
            id: "14",
            name: "MultiAppTransport_7.0.pdf",
            type: "pdf",
            size: 14000000,
            uploadDate: "2018-09-24T14:20:00Z",
            uploadedBy: "admin@example.com",
            description: "MultiApp Transport Tutorial version 7.0",
            status: "active"
          },
          {
            id: "15",
            name: "MovingBoundaries.pdf",
            type: "pdf",
            size: 9400000,
            uploadDate: "2022-09-13T10:28:00Z",
            uploadedBy: "admin@example.com",
            description: "Moving Boundaries Tutorial",
            status: "active"
          },
          {
            id: "16",
            name: "FRAPBinding_7.2.pdf",
            type: "pdf",
            size: 17000000,
            uploadDate: "2020-07-24T16:04:00Z",
            uploadedBy: "admin@example.com",
            description: "FRAP Binding Tutorial version 7.2",
            status: "active"
          },
          {
            id: "17",
            name: "FRAPBinding_7.0.pdf",
            type: "pdf",
            size: 7900000,
            uploadDate: "2019-04-30T15:30:00Z",
            uploadedBy: "admin@example.com",
            description: "FRAP Binding Tutorial version 7.0",
            status: "active"
          }
        ]
        
        setFiles(mockFiles)
        setFilteredFiles(mockFiles)
      } catch (err) {
        setError("Failed to load knowledge base files")
      } finally {
        setLoading(false)
      }
    }

    fetchFiles()
  }, [])

  useEffect(() => {
    const filtered = files.filter(file =>
      file.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      file.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (file.tags && file.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase())))
    )
    setFilteredFiles(filtered)
  }, [searchTerm, files])

  const getFileIcon = (type: string) => {
    switch (type) {
      case "pdf":
        return <FileText className="h-5 w-5 text-red-500" />
      case "docx":
        return <FileText className="h-5 w-5 text-blue-500" />
      case "txt":
        return <FileText className="h-5 w-5 text-gray-500" />
      case "csv":
        return <FileCode className="h-5 w-5 text-green-500" />
      case "json":
        return <FileCode className="h-5 w-5 text-yellow-500" />
      case "image":
        return <FileImage className="h-5 w-5 text-purple-500" />
      case "archive":
        return <FileArchive className="h-5 w-5 text-orange-500" />
      default:
        return <File className="h-5 w-5 text-gray-500" />
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Active</Badge>
      case "archived":
        return <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-100">Archived</Badge>
      case "processing":
        return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">Processing</Badge>
      default:
        return <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-100">{status}</Badge>
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (!files || files.length === 0) return

    setUploading(true)
    try {
      // Simulate file upload
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      const newFile: KnowledgeFile = {
        id: Date.now().toString(),
        name: files[0].name,
        type: files[0].name.split('.').pop()?.toLowerCase() as any || "other",
        size: files[0].size,
        uploadDate: new Date().toISOString(),
        uploadedBy: "admin@example.com",
        description: `Uploaded file: ${files[0].name}`,
        status: "active"
      }

      setFiles(prev => [newFile, ...prev])
      setShowUploadModal(false)
    } catch (err) {
      setError("Failed to upload file")
    } finally {
      setUploading(false)
    }
  }

  const handleDeleteFile = async (fileId: string) => {
    if (!confirm("Are you sure you want to delete this file?")) return
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500))
      setFiles(prev => prev.filter(file => file.id !== fileId))
    } catch (err) {
      setError("Failed to delete file")
    }
  }

  const handleViewFile = (file: KnowledgeFile) => {
    setSelectedFile(file)
  }

  if (loading) return <div className="p-8 text-center">Loading knowledge base...</div>
  if (error) return <div className="p-8 text-center text-red-600">{error}</div>

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="container mx-auto p-8 max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-extrabold text-blue-900 flex items-center gap-3">
                <FolderOpen className="h-8 w-8 text-blue-500" />
                Knowledge Base Management
              </h1>
              <p className="text-slate-600 mt-2">Upload, manage, and organize knowledge base files</p>
            </div>
            <div className="flex gap-3">
              <Button
                onClick={() => setShowUploadModal(true)}
                className="inline-flex items-center gap-2 px-4 py-2 rounded border border-green-600 text-green-700 bg-white font-semibold shadow-sm transition-colors hover:bg-green-50"
              >
                <Plus className="h-4 w-4" /> Upload File
              </Button>
              <Button
                onClick={() => window.open('/admin', '_blank')}
                className="inline-flex items-center gap-2 px-4 py-2 rounded border border-blue-600 text-blue-700 bg-white font-semibold shadow-sm transition-colors hover:bg-blue-50"
              >
                <FileText className="h-4 w-4" /> Back to Dashboard
              </Button>
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <Card className="shadow-lg border-slate-200 mb-8">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  placeholder="Search files by name, description, or tags..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Files Table */}
        <Card className="shadow-lg border-slate-200">
          <CardHeader className="bg-gradient-to-r from-blue-100 to-blue-50 border-b border-slate-200 px-6 py-5">
            <CardTitle className="text-2xl font-extrabold text-blue-900 flex items-center gap-3">
              <FileText className="h-6 w-6 text-blue-500" />
              Knowledge Base Files
              <Badge className="ml-2 bg-blue-600 text-white">{files.length} files</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">File</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Type</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-slate-200">
                  {filteredFiles.map((file) => (
                    <tr key={file.id} className="hover:bg-slate-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            <div className="h-10 w-10 rounded-lg bg-slate-100 flex items-center justify-center">
                              {getFileIcon(file.type)}
                            </div>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-slate-900">{file.name}</div>
                            <div className="text-sm text-slate-500">{file.description}</div>
                            <div className="flex gap-1 mt-1">
                              {file.tags && file.tags.map((tag, index) => (
                                <Badge key={index} variant="secondary" className="text-xs">
                                  {tag}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">
                        {file.type.toUpperCase()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 text-blue-600 hover:text-blue-800 hover:bg-blue-50"
                            title="View File"
                            onClick={() => handleViewFile(file)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 text-red-600 hover:text-red-800 hover:bg-red-50"
                            title="Delete File"
                            onClick={() => handleDeleteFile(file.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Upload Modal */}
        {showUploadModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <h3 className="text-lg font-semibold mb-4">Upload File</h3>
              <div className="space-y-4">
                <div className="border-2 border-dashed border-slate-300 rounded-lg p-6 text-center">
                  <Upload className="h-8 w-8 text-slate-400 mx-auto mb-2" />
                  <p className="text-sm text-slate-600 mb-2">Click to select or drag and drop</p>
                  <input
                    ref={fileInputRef}
                    type="file"
                    onChange={handleFileUpload}
                    className="hidden"
                    accept=".pdf,.docx,.txt,.csv,.json,.png,.jpg,.jpeg,.zip,.rar"
                  />
                  <Button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading}
                    className="inline-flex items-center gap-2"
                  >
                    <Upload className="h-4 w-4" />
                    {uploading ? "Uploading..." : "Select File"}
                  </Button>
                </div>
                <div className="flex gap-2">
                  <Button
                    onClick={() => setShowUploadModal(false)}
                    variant="outline"
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* File Preview Modal */}
        {selectedFile && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[80vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  {getFileIcon(selectedFile.type)}
                  {selectedFile.name}
                </h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedFile(null)}
                >
                  ×
                </Button>
              </div>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium">Size:</span> {formatFileSize(selectedFile.size)}
                  </div>
                  <div>
                    <span className="font-medium">Type:</span> {selectedFile.type.toUpperCase()}
                  </div>
                  <div>
                    <span className="font-medium">Uploaded:</span> {new Date(selectedFile.uploadDate).toLocaleString()}
                  </div>
                  <div>
                    <span className="font-medium">By:</span> {selectedFile.uploadedBy}
                  </div>
                </div>
                <div>
                  <span className="font-medium">Description:</span>
                  <p className="text-slate-600 mt-1">{selectedFile.description}</p>
                </div>
                <div>
                  <span className="font-medium">Tags:</span>
                  <div className="flex gap-1 mt-1">
                    {selectedFile.tags && selectedFile.tags.map((tag, index) => (
                      <Badge key={index} variant="secondary">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
                <div className="border-t pt-4">
                  <span className="font-medium">Content Preview:</span>
                  <div className="mt-2 p-4 bg-slate-50 rounded-lg text-sm">
                    <p className="text-slate-600">
                      {selectedFile.content || "No content preview available for this file type."}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
} 