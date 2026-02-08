'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Calendar, AlertTriangle, Check, ChevronDown, Search } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import { formatRelativeTime } from '@/lib/npm-api'
import type { VersionInfo } from '@/types/npm'

interface VersionListProps {
  packageName: string
  versions: VersionInfo[]
  currentVersion: string
  className?: string
}

const INITIAL_SHOW_COUNT = 20

export function VersionList({
  packageName,
  versions,
  currentVersion,
  className,
}: VersionListProps) {
  const [showAll, setShowAll] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  const filteredVersions = versions.filter((v) =>
    v.version.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const displayVersions = showAll
    ? filteredVersions
    : filteredVersions.slice(0, INITIAL_SHOW_COUNT)

  const hasMore = filteredVersions.length > INITIAL_SHOW_COUNT

  return (
    <div className={cn('space-y-4', className)}>
      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Filter versions..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Version Timeline */}
      <div className="rounded-lg border">
        <div className="divide-y">
          {displayVersions.map((version) => (
            <VersionItem
              key={version.version}
              packageName={packageName}
              version={version}
              isCurrent={version.version === currentVersion}
            />
          ))}
        </div>

        {filteredVersions.length === 0 && (
          <div className="p-8 text-center text-muted-foreground">
            No versions matching "{searchQuery}"
          </div>
        )}
      </div>

      {/* Show More Button */}
      {hasMore && !showAll && (
        <div className="flex justify-center">
          <Button variant="outline" onClick={() => setShowAll(true)}>
            <ChevronDown className="mr-1.5 h-4 w-4" />
            Show all {filteredVersions.length} versions
          </Button>
        </div>
      )}
    </div>
  )
}

interface VersionItemProps {
  packageName: string
  version: VersionInfo
  isCurrent: boolean
}

function VersionItem({ packageName, version, isCurrent }: VersionItemProps) {
  const isPrerelease =
    version.version.includes('-') ||
    version.version.includes('alpha') ||
    version.version.includes('beta') ||
    version.version.includes('rc')

  return (
    <Link
      href={`/package/${encodeURIComponent(packageName)}/v/${version.version}`}
      className={cn(
        'flex items-center justify-between gap-4 px-4 py-3 transition-colors hover:bg-accent/50',
        isCurrent && 'bg-accent/30'
      )}
    >
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <span className="font-mono text-sm font-medium">{version.version}</span>
          {isCurrent && (
            <Badge variant="default" className="text-xs">
              <Check className="mr-1 h-3 w-3" />
              Current
            </Badge>
          )}
          {version.deprecated && (
            <Badge variant="destructive" className="text-xs">
              <AlertTriangle className="mr-1 h-3 w-3" />
              Deprecated
            </Badge>
          )}
          {isPrerelease && !version.deprecated && (
            <Badge variant="secondary" className="text-xs">
              Pre-release
            </Badge>
          )}
        </div>
      </div>

      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
        <Calendar className="h-3 w-3" />
        {version.date ? formatRelativeTime(version.date) : 'Unknown'}
      </div>
    </Link>
  )
}

// Compact version selector for header
interface VersionSelectorProps {
  packageName: string
  versions: VersionInfo[]
  currentVersion: string
  className?: string
}

export function VersionSelector({
  packageName,
  versions,
  currentVersion,
  className,
}: VersionSelectorProps) {
  const recentVersions = versions.slice(0, 10)

  return (
    <div className={cn('relative', className)}>
      <select
        value={currentVersion}
        onChange={(e) => {
          window.location.href = `/package/${encodeURIComponent(packageName)}/v/${e.target.value}`
        }}
        className="h-9 w-full appearance-none rounded-md border bg-background px-3 py-1 font-mono text-sm pr-8 focus:outline-none focus:ring-2 focus:ring-ring"
      >
        {recentVersions.map((v) => (
          <option key={v.version} value={v.version}>
            v{v.version}
          </option>
        ))}
        {versions.length > 10 && (
          <option disabled>--- {versions.length - 10} more versions ---</option>
        )}
      </select>
      <ChevronDown className="absolute right-2.5 top-1/2 h-4 w-4 -translate-y-1/2 pointer-events-none text-muted-foreground" />
    </div>
  )
}
