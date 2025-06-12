"use client"

import FileFetcher from "@/components/file-fetcher"
import { Code } from "lucide-react"

export default function SBMLPage() {
  return (
    <FileFetcher
      fileType="sbml"
      icon={<Code className="h-5 w-5" />}
      title="SBML File Retrieval"
      description="Retrieve and download Systems Biology Markup Language files for biomodels."
      fileLabel="Biomodel ID"
      fileExt="sbml"
      contentTitle="SBML File Content"
      placeholder="Enter biomodel ID (e.g., 257427200)"
    />
  )
}
