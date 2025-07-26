"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import { cn } from "@/lib/utils";

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

export function MarkdownRenderer({
  content,
  className,
}: MarkdownRendererProps) {
  return (
    <div
      className={cn("markdown-content prose prose-sm max-w-none", className)}
    >
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkMath]}
        rehypePlugins={[
          [
            rehypeKatex,
            {
              displayMode: false,
              throwOnError: false,
              errorColor: "#cc0000",
              strict: false,
              trust: false,
              output: "html",
            },
          ],
        ]}
        components={{
          // Headings
          h1: ({ children }) => (
            <h1 className="text-xl font-bold mb-3 mt-4 first:mt-0 text-slate-900 border-b border-slate-200 pb-2">
              {children}
            </h1>
          ),
          h2: ({ children }) => (
            <h2 className="text-lg font-semibold mb-2 mt-3 first:mt-0 text-slate-900 border-b border-slate-200 pb-1">
              {children}
            </h2>
          ),
          h3: ({ children }) => (
            <h3 className="text-base font-semibold mb-2 mt-2 first:mt-0 text-slate-900">
              {children}
            </h3>
          ),
          h4: ({ children }) => (
            <h4 className="text-sm font-semibold mb-1 mt-2 first:mt-0 text-slate-900">
              {children}
            </h4>
          ),
          h5: ({ children }) => (
            <h5 className="text-sm font-semibold mb-1 mt-2 first:mt-0 text-slate-900">
              {children}
            </h5>
          ),
          h6: ({ children }) => (
            <h6 className="text-xs font-semibold mb-1 mt-2 first:mt-0 text-slate-900">
              {children}
            </h6>
          ),

          // Paragraphs
          p: ({ children }) => (
            <p className="mb-3 last:mb-0 text-sm leading-relaxed text-slate-700">
              {children}
            </p>
          ),

          // Strong/Bold text
          strong: ({ children }) => (
            <strong className="font-semibold text-slate-900">{children}</strong>
          ),

          // Emphasis/Italic text
          em: ({ children }) => (
            <em className="italic text-slate-700">{children}</em>
          ),

          // Lists
          ul: ({ children }) => (
            <ul className="mb-3 last:mb-0 ml-4 space-y-0.5 text-sm text-slate-700 list-disc">
              {children}
            </ul>
          ),
          ol: ({ children }) => (
            <ol className="mb-3 last:mb-0 ml-4 space-y-0.5 text-sm text-slate-700 list-decimal">
              {children}
            </ol>
          ),
          li: ({ children }) => (
            <li className="text-slate-700 leading-relaxed">{children}</li>
          ),

          // Tables
          table: ({ children }) => (
            <div className="mb-3 last:mb-0 overflow-x-auto">
              <table className="min-w-full border border-slate-300 rounded-lg overflow-hidden text-xs">
                {children}
              </table>
            </div>
          ),
          thead: ({ children }) => (
            <thead className="bg-slate-100">{children}</thead>
          ),
          tbody: ({ children }) => (
            <tbody className="bg-white">{children}</tbody>
          ),
          tr: ({ children }) => (
            <tr className="border-b border-slate-200">{children}</tr>
          ),
          th: ({ children }) => (
            <th className="px-3 py-1.5 text-left text-xs font-semibold text-slate-900 bg-slate-50">
              {children}
            </th>
          ),
          td: ({ children }) => (
            <td className="px-3 py-1.5 text-xs text-slate-700 border-t border-slate-200">
              {children}
            </td>
          ),

          // Code blocks
          code: ({ children, className }) => {
            const isInline = !className;
            if (isInline) {
              return (
                <code className="bg-slate-100 text-slate-800 px-1 py-0.5 rounded text-xs font-mono break-words">
                  {children}
                </code>
              );
            }
            return (
              <div className="mb-3 last:mb-0 bg-slate-50 border border-slate-200 rounded-lg overflow-hidden">
                <pre className="p-3 overflow-x-auto text-xs font-mono text-slate-800 whitespace-pre-wrap">
                  <code>{children}</code>
                </pre>
              </div>
            );
          },

          // Pre blocks (for code blocks)
          pre: ({ children }) => (
            <div className="mb-3 last:mb-0 bg-slate-50 border border-slate-200 rounded-lg overflow-hidden">
              <pre className="p-3 overflow-x-auto text-xs font-mono text-slate-800 whitespace-pre-wrap">
                {children}
              </pre>
            </div>
          ),

          // Blockquotes
          blockquote: ({ children }) => (
            <blockquote className="mb-3 last:mb-0 pl-3 border-l-4 border-blue-200 bg-blue-50 py-2 pr-3 text-sm text-slate-700 italic">
              {children}
            </blockquote>
          ),

          // Horizontal rules
          hr: () => <hr className="my-4 border-t border-slate-300" />,

          // Links
          a: ({ children, href }) => (
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 underline hover:text-blue-800 transition-colors"
            >
              {children}
            </a>
          ),

          // Strikethrough (from remark-gfm)
          del: ({ children }) => (
            <del className="line-through text-slate-600">{children}</del>
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
