"use client"

import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { cn } from '@/lib/utils'

interface MarkdownRendererProps {
  content: string
  className?: string
}

export function MarkdownRenderer({ content, className }: MarkdownRendererProps) {
  return (
    <div className={cn("markdown-content", className)}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          // Headings
          h1: ({ children }) => (
            <h1 className="text-2xl font-bold mb-4 text-slate-900 border-b border-slate-200 pb-2">
              {children}
            </h1>
          ),
          h2: ({ children }) => (
            <h2 className="text-xl font-semibold mb-3 text-slate-900 border-b border-slate-200 pb-1">
              {children}
            </h2>
          ),
          h3: ({ children }) => (
            <h3 className="text-lg font-semibold mb-2 text-slate-900">
              {children}
            </h3>
          ),
          h4: ({ children }) => (
            <h4 className="text-base font-semibold mb-2 text-slate-900">
              {children}
            </h4>
          ),
          h5: ({ children }) => (
            <h5 className="text-sm font-semibold mb-2 text-slate-900">
              {children}
            </h5>
          ),
          h6: ({ children }) => (
            <h6 className="text-xs font-semibold mb-2 text-slate-900">
              {children}
            </h6>
          ),
          
          // Paragraphs
          p: ({ children }) => (
            <p className="mb-4 text-sm leading-relaxed text-slate-700">
              {children}
            </p>
          ),
          
          // Strong/Bold text
          strong: ({ children }) => (
            <strong className="font-semibold text-slate-900">
              {children}
            </strong>
          ),
          
          // Emphasis/Italic text
          em: ({ children }) => (
            <em className="italic text-slate-700">
              {children}
            </em>
          ),
          
          // Lists
          ul: ({ children }) => (
            <ul className="mb-4 ml-6 space-y-1 text-sm text-slate-700 list-disc">
              {children}
            </ul>
          ),
          ol: ({ children }) => (
            <ol className="mb-4 ml-6 space-y-1 text-sm text-slate-700 list-decimal">
              {children}
            </ol>
          ),
          li: ({ children }) => (
            <li className="text-slate-700">
              {children}
            </li>
          ),
          
          // Tables
          table: ({ children }) => (
            <div className="mb-4 overflow-x-auto">
              <table className="min-w-full border border-slate-300 rounded-lg overflow-hidden">
                {children}
              </table>
            </div>
          ),
          thead: ({ children }) => (
            <thead className="bg-slate-100">
              {children}
            </thead>
          ),
          tbody: ({ children }) => (
            <tbody className="bg-white">
              {children}
            </tbody>
          ),
          tr: ({ children }) => (
            <tr className="border-b border-slate-200">
              {children}
            </tr>
          ),
          th: ({ children }) => (
            <th className="px-4 py-2 text-left text-xs font-semibold text-slate-900 bg-slate-50">
              {children}
            </th>
          ),
          td: ({ children }) => (
            <td className="px-4 py-2 text-sm text-slate-700 border-t border-slate-200">
              {children}
            </td>
          ),
          
          // Code blocks
          code: ({ children, className }) => {
            const isInline = !className
            if (isInline) {
              return (
                <code className="bg-slate-100 text-slate-800 px-1.5 py-0.5 rounded text-xs font-mono">
                  {children}
                </code>
              )
            }
            return (
              <div className="mb-4 bg-slate-50 border border-slate-200 rounded-lg overflow-hidden">
                <pre className="p-4 overflow-x-auto text-xs font-mono text-slate-800">
                  <code>{children}</code>
                </pre>
              </div>
            )
          },
          
          // Pre blocks (for code blocks)
          pre: ({ children }) => (
            <div className="mb-4 bg-slate-50 border border-slate-200 rounded-lg overflow-hidden">
              <pre className="p-4 overflow-x-auto text-xs font-mono text-slate-800">
                {children}
              </pre>
            </div>
          ),
          
          // Blockquotes
          blockquote: ({ children }) => (
            <blockquote className="mb-4 pl-4 border-l-4 border-blue-200 bg-blue-50 py-2 pr-4 text-sm text-slate-700 italic">
              {children}
            </blockquote>
          ),
          
          // Horizontal rules
          hr: () => (
            <hr className="my-6 border-t border-slate-300" />
          ),
          
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
            <del className="line-through text-slate-600">
              {children}
            </del>
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  )
}
