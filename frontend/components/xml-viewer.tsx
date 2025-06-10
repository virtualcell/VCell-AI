"use client"

import { useState } from "react"
import { Copy, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { JSX } from "react"

interface XmlViewerProps {
  data: string
  title?: string
}

export function XmlViewer({ data, title }: XmlViewerProps) {
  const [copied, setCopied] = useState(false)

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(data)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error("Failed to copy:", err)
    }
  }

  const formatXml = (xmlString: string): JSX.Element[] => {
    const elements: JSX.Element[] = []
    let index = 0

    // Split by < to process tags and content separately
    const parts = xmlString.split("<")

    parts.forEach((part, partIndex) => {
      if (partIndex === 0 && part.trim()) {
        // Handle content before first tag
        elements.push(
          <span key={`text-${index++}`} className="text-slate-800">
            {part}
          </span>,
        )
        return
      }

      if (!part) return

      const tagEndIndex = part.indexOf(">")
      if (tagEndIndex === -1) return

      const tagContent = part.substring(0, tagEndIndex)
      const afterTag = part.substring(tagEndIndex + 1)

      // Determine tag type
      const isClosingTag = tagContent.startsWith("/")
      const isSelfClosing = tagContent.endsWith("/") || tagContent.startsWith("?") || tagContent.startsWith("!")
      const isComment = tagContent.startsWith("!--")
      const isProcessingInstruction = tagContent.startsWith("?")

      // Add opening bracket
      elements.push(
        <span key={`bracket-open-${index++}`} className="text-slate-600">
          {"<"}
        </span>,
      )

      if (isComment) {
        // Handle comments
        const commentEnd = part.indexOf("-->")
        if (commentEnd !== -1) {
          elements.push(
            <span key={`comment-${index++}`} className="text-green-600 italic">
              {part.substring(0, commentEnd + 3)}
            </span>,
          )
          elements.push(
            <span key={`bracket-close-${index++}`} className="text-slate-600">
              {">"}
            </span>,
          )
        }
      } else if (isProcessingInstruction) {
        // Handle processing instructions like <?xml ?>
        elements.push(
          <span key={`pi-${index++}`} className="text-purple-600">
            {tagContent}
          </span>,
        )
        elements.push(
          <span key={`bracket-close-${index++}`} className="text-slate-600">
            {">"}
          </span>,
        )
      } else {
        // Handle regular tags
        const tagParts = tagContent.split(/(\s+)/)
        let isFirstPart = true

        tagParts.forEach((tagPart, tagPartIndex) => {
          if (!tagPart.trim()) {
            elements.push(
              <span key={`space-${index++}`} className="text-slate-400">
                {tagPart}
              </span>,
            )
            return
          }

          if (isFirstPart) {
            // Tag name
            elements.push(
              <span
                key={`tag-${index++}`}
                className={isClosingTag ? "text-red-600 font-medium" : "text-blue-600 font-medium"}
              >
                {tagPart}
              </span>,
            )
            isFirstPart = false
          } else {
            // Attributes
            const attrMatch = tagPart.match(/^([^=]+)(=?)(.*)$/)
            if (attrMatch) {
              const [, attrName, equals, attrValue] = attrMatch

              // Attribute name
              elements.push(
                <span key={`attr-name-${index++}`} className="text-orange-600">
                  {attrName}
                </span>,
              )

              if (equals) {
                elements.push(
                  <span key={`equals-${index++}`} className="text-slate-600">
                    {equals}
                  </span>,
                )

                // Attribute value
                if (attrValue) {
                  elements.push(
                    <span key={`attr-value-${index++}`} className="text-green-600">
                      {attrValue}
                    </span>,
                  )
                }
              }
            } else {
              elements.push(
                <span key={`attr-${index++}`} className="text-orange-600">
                  {tagPart}
                </span>,
              )
            }
          }
        })

        // Add closing bracket
        elements.push(
          <span key={`bracket-close-${index++}`} className="text-slate-600">
            {">"}
          </span>,
        )
      }

      // Handle content after tag
      if (afterTag) {
        // Check if it contains nested tags
        if (afterTag.includes("<")) {
          const textBeforeNextTag = afterTag.split("<")[0]
          if (textBeforeNextTag.trim()) {
            elements.push(
              <span key={`text-content-${index++}`} className="text-slate-800">
                {textBeforeNextTag}
              </span>,
            )
          }
          // The rest will be handled in the next iteration
        } else {
          // Pure text content
          if (afterTag.trim()) {
            elements.push(
              <span key={`text-final-${index++}`} className="text-slate-800">
                {afterTag}
              </span>,
            )
          }
        }
      }
    })

    return elements
  }

  // Format the XML with proper indentation for display
  const formatXmlWithIndentation = (xmlString: string): string => {
    const formatted = xmlString
      .replace(/></g, ">\n<")
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => line.length > 0)

    let indentLevel = 0
    const indentedLines: string[] = []

    formatted.forEach((line) => {
      if (line.startsWith("</")) {
        indentLevel = Math.max(0, indentLevel - 1)
      }

      indentedLines.push("  ".repeat(indentLevel) + line)

      if (
        line.startsWith("<") &&
        !line.startsWith("</") &&
        !line.endsWith("/>") &&
        !line.startsWith("<?") &&
        !line.startsWith("<!--")
      ) {
        indentLevel++
      }
    })

    return indentedLines.join("\n")
  }

  const formattedXml = formatXmlWithIndentation(data)

  return (
    <div className="relative">
      <div className="absolute top-4 right-4 z-10">
        <Button
          size="sm"
          variant="outline"
          onClick={copyToClipboard}
          className="h-8 w-8 p-0 bg-white/80 backdrop-blur-sm"
        >
          {copied ? <Check className="h-3 w-3 text-green-600" /> : <Copy className="h-3 w-3" />}
        </Button>
      </div>
      <pre className="bg-slate-50 p-6 rounded-none text-sm font-mono overflow-x-auto border-0 leading-relaxed">
        <code className="text-slate-800">{formatXml(formattedXml)}</code>
      </pre>
    </div>
  )
}
