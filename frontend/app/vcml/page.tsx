"use client";

import FileFetcher from "@/components/file-fetcher";
import { FileText } from "lucide-react";

export default function VCMLPage() {
  return (
    <FileFetcher
      fileType="vcml"
      icon={<FileText className="h-5 w-5" />}
      title="VCML File Retrieval"
      description="Retrieve and download Virtual Cell Markup Language files for biomodels."
      fileLabel="Biomodel ID"
      fileExt="vcml"
      contentTitle="VCML File Content"
      placeholder="Enter biomodel ID (e.g., 257427200)"
    />
  );
}
