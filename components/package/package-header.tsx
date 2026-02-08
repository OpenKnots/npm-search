import Link from 'next/link'
import {
  ExternalLink,
  Github,
  Home,
  Bug,
  Download,
  Calendar,
  Scale,
  FileCode,
  AlertTriangle,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { InstallCommands } from '@/components/package/install-commands'
import {
  formatDownloads,
  formatRelativeTime,
  formatFileSize,
  getGitHubUrl,
} from '@/lib/npm-api'
import type { PackageDetails } from '@/types/npm'

interface PackageHeaderProps {
  pkg: PackageDetails
  downloads?: number
}

export function PackageHeader({ pkg, downloads }: PackageHeaderProps) {
  const githubUrl = getGitHubUrl(pkg.repository)
  const authorName =
    typeof pkg.author === 'string'
      ? pkg.author
      : pkg.author?.name || pkg.maintainers[0]?.name

  return (
    <div className="flex flex-col gap-6 lg:flex-row lg:gap-8">
      {/* Main Info */}
      <div className="flex-1 space-y-4">
        <div className="flex flex-wrap items-start gap-3">
          <h1 className="font-mono text-2xl font-bold sm:text-3xl">{pkg.name}</h1>
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="secondary" className="font-mono">
              v{pkg.version}
            </Badge>
            {pkg.types && (
              <Badge variant="outline" className="text-blue-600 border-blue-200">
                <FileCode className="mr-1 h-3 w-3" />
                TypeScript
              </Badge>
            )}
            {pkg.deprecated && (
              <Badge variant="destructive">
                <AlertTriangle className="mr-1 h-3 w-3" />
                Deprecated
              </Badge>
            )}
          </div>
        </div>

        {pkg.deprecated && (
          <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive">
            <strong>Deprecated:</strong> {pkg.deprecated}
          </div>
        )}

        {pkg.description && (
          <p className="text-lg text-muted-foreground">{pkg.description}</p>
        )}

        {pkg.keywords && pkg.keywords.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {pkg.keywords.slice(0, 10).map((keyword) => (
              <Link
                key={keyword}
                href={`/search?q=${encodeURIComponent(keyword)}`}
              >
                <Badge
                  variant="outline"
                  className="text-xs font-normal hover:bg-accent"
                >
                  {keyword}
                </Badge>
              </Link>
            ))}
          </div>
        )}

        {/* Quick Stats */}
        <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
          {downloads !== undefined && (
            <span className="flex items-center gap-1.5">
              <Download className="h-4 w-4" />
              <span className="font-medium text-foreground">
                {formatDownloads(downloads)}
              </span>
              /week
            </span>
          )}
          {pkg.updatedAt && (
            <span className="flex items-center gap-1.5">
              <Calendar className="h-4 w-4" />
              Updated {formatRelativeTime(pkg.updatedAt)}
            </span>
          )}
          {pkg.license && (
            <span className="flex items-center gap-1.5">
              <Scale className="h-4 w-4" />
              {pkg.license}
            </span>
          )}
          {pkg.unpackedSize && (
            <span className="flex items-center gap-1.5">
              Unpacked: {formatFileSize(pkg.unpackedSize)}
            </span>
          )}
        </div>

        {/* Author/Maintainers */}
        {authorName && (
          <div className="text-sm">
            <span className="text-muted-foreground">Published by </span>
            <Link
              href={`/~${encodeURIComponent(authorName)}`}
              className="font-medium hover:underline"
            >
              {authorName}
            </Link>
          </div>
        )}
      </div>

      {/* Sidebar */}
      <div className="w-full space-y-4 lg:w-80">
        <InstallCommands packageName={pkg.name} />

        {/* Links */}
        <div className="flex flex-wrap gap-2">
          {githubUrl && (
            <Button variant="outline" size="sm" asChild>
              <a href={githubUrl} target="_blank" rel="noopener noreferrer">
                <Github className="mr-1.5 h-4 w-4" />
                Repository
              </a>
            </Button>
          )}
          {pkg.homepage && (
            <Button variant="outline" size="sm" asChild>
              <a href={pkg.homepage} target="_blank" rel="noopener noreferrer">
                <Home className="mr-1.5 h-4 w-4" />
                Homepage
              </a>
            </Button>
          )}
          {pkg.bugs?.url && (
            <Button variant="outline" size="sm" asChild>
              <a href={pkg.bugs.url} target="_blank" rel="noopener noreferrer">
                <Bug className="mr-1.5 h-4 w-4" />
                Issues
              </a>
            </Button>
          )}
          <Button variant="outline" size="sm" asChild>
            <a
              href={`https://npmjs.com/package/${pkg.name}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              <ExternalLink className="mr-1.5 h-4 w-4" />
              npm
            </a>
          </Button>
        </div>

        {/* Dist Tags */}
        {Object.keys(pkg.distTags).length > 1 && (
          <div className="rounded-lg border p-3">
            <h4 className="mb-2 text-sm font-medium">Dist Tags</h4>
            <div className="space-y-1">
              {Object.entries(pkg.distTags).map(([tag, version]) => (
                <div key={tag} className="flex justify-between text-sm">
                  <span className="text-muted-foreground">{tag}</span>
                  <Link
                    href={`/package/${pkg.name}/v/${version}`}
                    className="font-mono text-xs hover:underline"
                  >
                    {version}
                  </Link>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
