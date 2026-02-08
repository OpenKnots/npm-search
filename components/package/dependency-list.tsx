import React from "react"
import Link from 'next/link'
import { Package, Wrench, Users, ChevronRight } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'

interface DependencyListProps {
  dependencies: Record<string, string>
  devDependencies: Record<string, string>
  peerDependencies: Record<string, string>
  className?: string
}

export function DependencyList({
  dependencies,
  devDependencies,
  peerDependencies,
  className,
}: DependencyListProps) {
  const hasDeps = Object.keys(dependencies).length > 0
  const hasDevDeps = Object.keys(devDependencies).length > 0
  const hasPeerDeps = Object.keys(peerDependencies).length > 0

  if (!hasDeps && !hasDevDeps && !hasPeerDeps) {
    return (
      <div className={cn('rounded-lg border p-8 text-center', className)}>
        <Package className="mx-auto mb-2 h-8 w-8 text-muted-foreground" />
        <p className="text-muted-foreground">No dependencies</p>
      </div>
    )
  }

  return (
    <div className={cn('grid gap-6 lg:grid-cols-2', className)}>
      {hasDeps && (
        <DependencySection
          title="Dependencies"
          icon={<Package className="h-4 w-4" />}
          dependencies={dependencies}
          variant="default"
        />
      )}

      {hasPeerDeps && (
        <DependencySection
          title="Peer Dependencies"
          icon={<Users className="h-4 w-4" />}
          dependencies={peerDependencies}
          variant="peer"
        />
      )}

      {hasDevDeps && (
        <DependencySection
          title="Dev Dependencies"
          icon={<Wrench className="h-4 w-4" />}
          dependencies={devDependencies}
          variant="dev"
          className="lg:col-span-2"
        />
      )}
    </div>
  )
}

interface DependencySectionProps {
  title: string
  icon: React.ReactNode
  dependencies: Record<string, string>
  variant: 'default' | 'dev' | 'peer'
  className?: string
}

function DependencySection({
  title,
  icon,
  dependencies,
  variant,
  className,
}: DependencySectionProps) {
  const entries = Object.entries(dependencies).sort(([a], [b]) =>
    a.localeCompare(b)
  )

  return (
    <Card className={cn('py-4', className)}>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-base">
          {icon}
          {title}
          <Badge variant="secondary" className="ml-auto text-xs">
            {entries.length}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div
          className={cn(
            'grid gap-1',
            variant === 'dev' ? 'sm:grid-cols-2 lg:grid-cols-3' : ''
          )}
        >
          {entries.map(([name, version]) => (
            <DependencyItem key={name} name={name} version={version} />
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

interface DependencyItemProps {
  name: string
  version: string
}

function DependencyItem({ name, version }: DependencyItemProps) {
  return (
    <Link
      href={`/package/${encodeURIComponent(name)}`}
      className="group flex items-center justify-between rounded-md px-2 py-1.5 text-sm transition-colors hover:bg-accent"
    >
      <span className="flex items-center gap-1.5 truncate font-mono text-foreground">
        <ChevronRight className="h-3 w-3 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
        {name}
      </span>
      <span className="ml-2 shrink-0 font-mono text-xs text-muted-foreground">
        {version}
      </span>
    </Link>
  )
}

// Dependency Tree Visualization (expandable)
interface DependencyTreeProps {
  dependencies: Record<string, string>
  className?: string
}

export function DependencyTree({ dependencies, className }: DependencyTreeProps) {
  const entries = Object.entries(dependencies)

  if (entries.length === 0) {
    return null
  }

  return (
    <div className={cn('rounded-lg border p-4', className)}>
      <h3 className="mb-3 font-medium">Dependency Tree</h3>
      <div className="space-y-1 font-mono text-sm">
        {entries.map(([name, version], index) => (
          <div key={name} className="flex items-center gap-2">
            <span className="text-muted-foreground">
              {index === entries.length - 1 ? '└──' : '├──'}
            </span>
            <Link
              href={`/package/${encodeURIComponent(name)}`}
              className="hover:text-primary hover:underline"
            >
              {name}
            </Link>
            <span className="text-muted-foreground">@{version}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
