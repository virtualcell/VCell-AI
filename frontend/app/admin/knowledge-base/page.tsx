"use client";

import { useEffect, useState, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MarkdownRenderer } from "@/components/markdown-renderer";
import { Input } from "@/components/ui/input";
import {
  FileText,
  Upload,
  Eye,
  Trash2,
  Search,
  FolderOpen,
  File,
  Plus,
} from "lucide-react";

interface KnowledgeFile {
  name: string;
  type: "pdf" | "txt";
}

interface FileContent {
  content: string;
  loading: boolean;
  error: string;
}

export default function KnowledgeBasePage() {
  const [files, setFiles] = useState<KnowledgeFile[]>([]);
  const [filteredFiles, setFilteredFiles] = useState<KnowledgeFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedFile, setSelectedFile] = useState<KnowledgeFile | null>(null);
  const [fileContent, setFileContent] = useState<FileContent | null>(null);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const fetchFiles = async () => {
      try {
        setLoading(true);
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/kb/files`, {
          headers: { accept: "application/json" },
        });
        if (!res.ok) throw new Error("Failed to fetch files");
        const data = await res.json();
        if (!data.files || !Array.isArray(data.files))
          throw new Error("Invalid response");
        const files: KnowledgeFile[] = data.files.map((filename: string) => ({
          name: filename,
          type:
            filename.split(".").pop()?.toLowerCase() === "pdf" ? "pdf" : "txt",
        }));
        setFiles(files);
        setFilteredFiles(files);
      } catch (err) {
        setError("Failed to load knowledge base files");
      } finally {
        setLoading(false);
      }
    };
    fetchFiles();
  }, []);

  useEffect(() => {
    const filtered = files.filter((file) =>
      file.name.toLowerCase().includes(searchTerm.toLowerCase()),
    );
    setFilteredFiles(filtered);
  }, [searchTerm, files]);

  const getFileIcon = (type: string) => {
    switch (type) {
      case "pdf":
        return <FileText className="h-5 w-5 text-red-500" />;
      case "txt":
        return <FileText className="h-5 w-5 text-gray-500" />;
      default:
        return <File className="h-5 w-5 text-gray-500" />;
    }
  };

  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const filesList = event.target.files;
    if (!filesList || filesList.length === 0) return;

    setUploading(true);
    setError("");
    const file = filesList[0];
    const ext = file.name.split(".").pop()?.toLowerCase();
    let endpoint = "";
    if (ext === "pdf") {
      endpoint = `${process.env.NEXT_PUBLIC_API_URL}/kb/upload-pdf`;
    } else if (ext === "txt") {
      endpoint = `${process.env.NEXT_PUBLIC_API_URL}/kb/upload-text`;
    } else {
      setError("Only PDF and TXT files are supported.");
      setUploading(false);
      return;
    }
    const formData = new FormData();
    formData.append("file", file);
    try {
      const res = await fetch(endpoint, {
        method: "POST",
        body: formData,
      });
      if (!res.ok) throw new Error("Failed to upload file");
      const data = await res.json();
      if (data.status !== "success") throw new Error("Failed to upload file");
      const newFile: KnowledgeFile = {
        name: file.name,
        type: ext === "pdf" ? "pdf" : "txt",
      };
      setFiles((prev) => [newFile, ...prev]);
      setFilteredFiles((prev) => [newFile, ...prev]);
      setShowUploadModal(false);
    } catch (err) {
      setError("Failed to upload file");
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteFile = async (fileName: string) => {
    if (!confirm("Are you sure you want to delete this file?")) return;
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/kb/files/${encodeURIComponent(fileName)}`,
        {
          method: "DELETE",
          headers: { accept: "application/json" },
        },
      );
      if (!res.ok) throw new Error("Failed to delete file");
      const data = await res.json();
      if (data.status !== "success") throw new Error("Failed to delete file");
      setFiles((prev) => prev.filter((file) => file.name !== fileName));
      setFilteredFiles((prev) => prev.filter((file) => file.name !== fileName));
      // If the deleted file is currently previewed, close the modal
      if (selectedFile && selectedFile.name === fileName) {
        setSelectedFile(null);
        setFileContent(null);
      }
    } catch (err) {
      setError("Failed to delete file");
    }
  };

  const handleViewFile = async (file: KnowledgeFile) => {
    setSelectedFile(file);
    setFileContent({ content: "", loading: true, error: "" });
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/kb/files/${encodeURIComponent(file.name)}/chunks`,
        {
          headers: { accept: "application/json" },
        },
      );
      if (!res.ok) throw new Error("Failed to fetch file content");
      const data = await res.json();
      if (!data.chunks || !Array.isArray(data.chunks))
        throw new Error("Invalid response");
      // Sort by chunk_index just in case
      const sortedChunks = data.chunks.sort(
        (a: { chunk_index: number }, b: { chunk_index: number }) =>
          a.chunk_index - b.chunk_index,
      );
      const content = sortedChunks.map((c: any) => c.chunk).join("\n");
      setFileContent({ content, loading: false, error: "" });
    } catch (err) {
      setFileContent({
        content: "",
        loading: false,
        error: "Failed to load file content",
      });
    }
  };

  if (loading)
    return <div className="p-8 text-center">Loading knowledge base...</div>;
  if (error) return <div className="p-8 text-center text-red-600">{error}</div>;

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
              <p className="text-slate-600 mt-2">
                Upload, manage, and organize knowledge base files
              </p>
            </div>
            <div className="flex gap-3">
              <Button
                onClick={() => setShowUploadModal(true)}
                className="inline-flex items-center gap-2 px-4 py-2 rounded border border-green-600 text-green-700 bg-white font-semibold shadow-sm transition-colors hover:bg-green-50"
              >
                <Plus className="h-4 w-4" /> Upload File
              </Button>
              <Button
                onClick={() => window.open("/admin", "_blank")}
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
              <Badge className="ml-2 bg-blue-600 text-white">
                {files.length} files
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {filteredFiles.length === 0 ? (
              <div className="text-center py-16 px-6">
                <FolderOpen className="h-16 w-16 text-slate-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-slate-600 mb-2">
                  No files uploaded yet
                </h3>
                <p className="text-slate-500 mb-6 max-w-md mx-auto">
                  Your knowledge base is empty. Upload your first file to get
                  started with building your knowledge base.
                </p>
                <Button
                  onClick={() => setShowUploadModal(true)}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg shadow-sm hover:bg-blue-700 transition-colors"
                >
                  <Plus className="h-4 w-4" />
                  Upload Your First File
                </Button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-slate-50 border-b border-slate-200">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                        File
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                        Type
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-slate-200">
                    {filteredFiles.map((file) => (
                      <tr key={file.name} className="hover:bg-slate-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10">
                              <div className="h-10 w-10 rounded-lg bg-slate-100 flex items-center justify-center">
                                {getFileIcon(file.type)}
                              </div>
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-slate-900">
                                {file.name}
                              </div>
                              <div className="flex gap-1 mt-1"></div>
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
                              onClick={() => handleDeleteFile(file.name)}
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
            )}
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
                  <p className="text-sm text-slate-600 mb-2">
                    Click to select or drag and drop
                  </p>
                  <input
                    ref={fileInputRef}
                    type="file"
                    onChange={handleFileUpload}
                    className="hidden"
                    accept=".pdf,.txt,application/pdf,text/plain"
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
                  onClick={() => {
                    setSelectedFile(null);
                    setFileContent(null);
                  }}
                >
                  ×
                </Button>
              </div>
              <div className="space-y-4">
                <div className="border-t pt-4">
                  <span className="font-medium">Content Preview:</span>
                  <div className="mt-2 p-4 bg-slate-50 rounded-lg text-sm min-h-[100px]">
                    {fileContent?.loading && (
                      <span className="text-slate-400">Loading...</span>
                    )}
                    {fileContent?.error && (
                      <span className="text-red-600">{fileContent.error}</span>
                    )}
                    {!fileContent?.loading &&
                      !fileContent?.error &&
                      fileContent?.content && (
                        <MarkdownRenderer content={fileContent.content} />
                      )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
