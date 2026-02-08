import Link from 'next/link'
import { Download, Calendar, User } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { formatDownloads, formatRelativeTime } from '@/lib/npm-api'
import type { PackageListItem } from '@/types/npm'

interface PackageCardProps {
  pkg: PackageListItem
  showScore?: boolean
}

export function PackageCard({ pkg, showScore = false }: PackageCardProps) {
  const authorName =
    typeof pkg.author === 'string' ? pkg.author : pkg.author?.name

  return (
    <Link href={`/package/${encodeURIComponent(pkg.name)}`}>
      <Card className="py-4 transition-colors hover:bg-accent/50">
        <CardContent className="flex flex-col gap-3">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <h3 className="truncate font-mono text-sm font-semibold text-foreground">
                  {pkg.name}
                </h3>
                <Badge variant="secondary" className="shrink-0 font-mono text-xs">
                  v{pkg.version}
                </Badge>
              </div>
              {pkg.description && (
                <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
                  {pkg.description}
                </p>
              )}
            </div>
          </div>

          {pkg.keywords && pkg.keywords.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {pkg.keywords.slice(0, 5).map((keyword) => (
                <Badge
                  key={keyword}
                  variant="outline"
                  className="text-xs font-normal"
                >
                  {keyword}
                </Badge>
              ))}
              {pkg.keywords.length > 5 && (
                <span className="text-xs text-muted-foreground">
                  +{pkg.keywords.length - 5} more
                </span>
              )}
            </div>
          )}

          <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
            {authorName && (
              <span className="flex items-center gap-1">
                <User className="h-3 w-3" />
                {authorName}
              </span>
            )}
            {pkg.date && (
              <span className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                {formatRelativeTime(pkg.date)}
              </span>
            )}
            {pkg.downloads !== undefined && (
              <span className="flex items-center gap-1">
                <Download className="h-3 w-3" />
                {formatDownloads(pkg.downloads)}/week
              </span>
            )}
          </div>

          {showScore && pkg.score && (
            <div className="flex gap-3 text-xs">
              <ScoreBar label="Quality" value={pkg.score.quality} />
              <ScoreBar label="Popularity" value={pkg.score.popularity} />
              <ScoreBar label="Maintenance" value={pkg.score.maintenance} />
            </div>
          )}
        </CardContent>
      </Card>
    </Link>
  )
}

function ScoreBar({ label, value }: { label: string; value: number }) {
  const percentage = Math.round(value * 100)
  return (
    <div className="flex-1">
      <div className="flex justify-between text-muted-foreground mb-1">
        <span>{label}</span>
        <span>{percentage}%</span>
      </div>
      <div className="h-1 w-full overflow-hidden rounded-full bg-muted">
        <div
          className="h-full bg-primary transition-all"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  )
}

export function PackageCardSkeleton() {
  return (
    <Card className="py-4">
      <CardContent className="flex flex-col gap-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 space-y-2">
            <div className="flex items-center gap-2">
              <div className="h-5 w-32 animate-pulse rounded bg-muted" />
              <div className="h-5 w-16 animate-pulse rounded bg-muted" />
            </div>
            <div className="h-4 w-full animate-pulse rounded bg-muted" />
          </div>
        </div>
        <div className="flex gap-1">
          <div className="h-5 w-16 animate-pulse rounded bg-muted" />
          <div className="h-5 w-20 animate-pulse rounded bg-muted" />
          <div className="h-5 w-14 animate-pulse rounded bg-muted" />
        </div>
        <div className="flex gap-4">
          <div className="h-4 w-20 animate-pulse rounded bg-muted" />
          <div className="h-4 w-24 animate-pulse rounded bg-muted" />
        </div>
      </CardContent>
    </Card>
  )
}
