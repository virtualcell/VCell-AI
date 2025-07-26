"use client";

import { useState } from "react";
import { Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";

interface JsonViewerProps {
  data: any;
}

export function JsonViewer({ data }: JsonViewerProps) {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(JSON.stringify(data, null, 2));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  const formatJson = (obj: any, indent = 0): JSX.Element[] => {
    const elements: JSX.Element[] = [];
    const indentStr = "  ".repeat(indent);

    if (Array.isArray(obj)) {
      elements.push(
        <span key={`array-start-${indent}`} className="text-slate-600">
          [
        </span>,
      );
      obj.forEach((item, index) => {
        elements.push(<br key={`br-${indent}-${index}`} />);
        elements.push(
          <span key={`indent-${indent}-${index}`} className="text-slate-400">
            {indentStr}
          </span>,
        );
        elements.push(...formatJson(item, indent + 1));
        if (index < obj.length - 1) {
          elements.push(
            <span key={`comma-${indent}-${index}`} className="text-slate-600">
              ,
            </span>,
          );
        }
      });
      elements.push(<br key={`br-end-${indent}`} />);
      elements.push(
        <span key={`indent-end-${indent}`} className="text-slate-400">
          {indentStr}
        </span>,
      );
      elements.push(
        <span key={`array-end-${indent}`} className="text-slate-600">
          ]
        </span>,
      );
    } else if (typeof obj === "object" && obj !== null) {
      elements.push(
        <span key={`object-start-${indent}`} className="text-slate-600">
          {"{"}
        </span>,
      );
      const entries = Object.entries(obj);
      entries.forEach(([key, value], index) => {
        elements.push(<br key={`br-${indent}-${key}`} />);
        elements.push(
          <span key={`indent-${indent}-${key}`} className="text-slate-400">
            {indentStr}
          </span>,
        );
        elements.push(
          <span
            key={`key-${indent}-${key}`}
            className="text-blue-600 font-medium"
          >
            "{key}"
          </span>,
        );
        elements.push(
          <span key={`colon-${indent}-${key}`} className="text-slate-600">
            :{" "}
          </span>,
        );
        elements.push(...formatJson(value, indent + 1));
        if (index < entries.length - 1) {
          elements.push(
            <span key={`comma-${indent}-${key}`} className="text-slate-600">
              ,
            </span>,
          );
        }
      });
      elements.push(<br key={`br-end-${indent}`} />);
      elements.push(
        <span key={`indent-end-${indent}`} className="text-slate-400">
          {indentStr}
        </span>,
      );
      elements.push(
        <span key={`object-end-${indent}`} className="text-slate-600">
          {"}"}
        </span>,
      );
    } else if (typeof obj === "string") {
      elements.push(
        <span key={`string-${indent}`} className="text-green-600">
          "{obj}"
        </span>,
      );
    } else if (typeof obj === "number") {
      elements.push(
        <span key={`number-${indent}`} className="text-purple-600">
          {obj}
        </span>,
      );
    } else if (typeof obj === "boolean") {
      elements.push(
        <span key={`boolean-${indent}`} className="text-orange-600">
          {obj.toString()}
        </span>,
      );
    } else if (obj === null) {
      elements.push(
        <span key={`null-${indent}`} className="text-red-600">
          null
        </span>,
      );
    }

    return elements;
  };

  return (
    <div className="relative">
      <div className="absolute top-4 right-4 z-10">
        <Button
          size="sm"
          variant="outline"
          onClick={copyToClipboard}
          className="h-8 w-8 p-0 bg-white/80 backdrop-blur-sm"
        >
          {copied ? (
            <Check className="h-3 w-3 text-green-600" />
          ) : (
            <Copy className="h-3 w-3" />
          )}
        </Button>
      </div>
      <pre className="bg-slate-50 p-6 rounded-none text-sm font-mono overflow-x-auto border-0">
        <code className="text-slate-800">{formatJson(data)}</code>
      </pre>
    </div>
  );
}
