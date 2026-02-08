'use client'

import { useState } from 'react'
import { Check, Copy } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { cn } from '@/lib/utils'

interface InstallCommandsProps {
  packageName: string
  className?: string
}

const PACKAGE_MANAGERS = [
  { id: 'npm', label: 'npm', command: (name: string) => `npm install ${name}` },
  { id: 'yarn', label: 'yarn', command: (name: string) => `yarn add ${name}` },
  { id: 'pnpm', label: 'pnpm', command: (name: string) => `pnpm add ${name}` },
  { id: 'bun', label: 'bun', command: (name: string) => `bun add ${name}` },
]

export function InstallCommands({ packageName, className }: InstallCommandsProps) {
  const [copiedId, setCopiedId] = useState<string | null>(null)

  const copyToClipboard = async (id: string, command: string) => {
    await navigator.clipboard.writeText(command)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  return (
    <div className={cn('rounded-lg border bg-card', className)}>
      <Tabs defaultValue="npm">
        <TabsList className="w-full justify-start rounded-none border-b bg-transparent p-0">
          {PACKAGE_MANAGERS.map((pm) => (
            <TabsTrigger
              key={pm.id}
              value={pm.id}
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent"
            >
              {pm.label}
            </TabsTrigger>
          ))}
        </TabsList>
        
        {PACKAGE_MANAGERS.map((pm) => {
          const command = pm.command(packageName)
          return (
            <TabsContent key={pm.id} value={pm.id} className="mt-0">
              <div className="flex items-center justify-between gap-2 p-3">
                <code className="flex-1 overflow-x-auto whitespace-nowrap font-mono text-sm">
                  {command}
                </code>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 shrink-0"
                  onClick={() => copyToClipboard(pm.id, command)}
                >
                  {copiedId === pm.id ? (
                    <Check className="h-4 w-4 text-green-500" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </TabsContent>
          )
        })}
      </Tabs>
    </div>
  )
}
