'use client'

import { useState } from 'react'
import { ChevronDown, ChevronUp, FileText } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface ReadmeViewerProps {
  readme?: string
  className?: string
}

export function ReadmeViewer({ readme, className }: ReadmeViewerProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  if (!readme) {
    return (
      <div className={cn('rounded-lg border p-8 text-center', className)}>
        <FileText className="mx-auto mb-2 h-8 w-8 text-muted-foreground" />
        <p className="text-muted-foreground">No README available</p>
      </div>
    )
  }

  // Very basic markdown-to-HTML conversion for display
  // In production, use react-markdown or similar
  const formattedReadme = readme
    .replace(/^# (.+)$/gm, '<h1 class="text-2xl font-bold mt-6 mb-4">$1</h1>')
    .replace(/^## (.+)$/gm, '<h2 class="text-xl font-semibold mt-5 mb-3">$1</h2>')
    .replace(/^### (.+)$/gm, '<h3 class="text-lg font-medium mt-4 mb-2">$3</h3>')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/`([^`]+)`/g, '<code class="bg-muted px-1 py-0.5 rounded text-sm font-mono">$1</code>')
    .replace(/```(\w+)?\n([\s\S]*?)```/g, '<pre class="bg-muted p-4 rounded-lg overflow-x-auto my-4"><code class="text-sm font-mono">$2</code></pre>')
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" class="text-primary hover:underline" target="_blank" rel="noopener noreferrer">$1</a>')
    .replace(/\n\n/g, '</p><p class="my-3">')
    .replace(/\n/g, '<br />')

  const maxHeight = isExpanded ? 'none' : '500px'

  return (
    <div className={cn('relative', className)}>
      <div
        className="prose prose-sm dark:prose-invert max-w-none overflow-hidden rounded-lg border p-6"
        style={{ maxHeight }}
        // biome-ignore lint/security/noDangerouslySetInnerHtml: Basic markdown rendering
        dangerouslySetInnerHTML={{ __html: `<p>${formattedReadme}</p>` }}
      />
      
      {readme.length > 2000 && (
        <div
          className={cn(
            'flex justify-center pt-4',
            !isExpanded &&
              'absolute inset-x-0 bottom-0 bg-gradient-to-t from-background via-background to-transparent pb-4 pt-16'
          )}
        >
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            {isExpanded ? (
              <>
                <ChevronUp className="mr-1 h-4 w-4" />
                Show less
              </>
            ) : (
              <>
                <ChevronDown className="mr-1 h-4 w-4" />
                Show more
              </>
            )}
          </Button>
        </div>
      )}
    </div>
  )
}
