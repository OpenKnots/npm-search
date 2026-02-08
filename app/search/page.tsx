import { Suspense } from 'react'
import type { Metadata } from 'next'
import Link from 'next/link'
import { Search as SearchIcon, Package, ArrowLeft, ArrowRight } from 'lucide-react'
import { Header } from '@/components/layout/header'
import { SearchBar } from '@/components/search/search-bar'
import { PackageCard, PackageCardSkeleton } from '@/components/package/package-card'
import { Button } from '@/components/ui/button'
import { searchPackages, getDownloadCount } from '@/lib/npm-api'

interface SearchPageProps {
  searchParams: Promise<{ q?: string; page?: string }>
}

const RESULTS_PER_PAGE = 20

export async function generateMetadata({
  searchParams,
}: SearchPageProps): Promise<Metadata> {
  const { q } = await searchParams
  
  if (!q) {
    return {
      title: 'Search - npm explorer',
    }
  }
  
  return {
    title: `Search results for "${q}" - npm explorer`,
    description: `Browse npm packages matching "${q}"`,
  }
}

async function SearchResults({ query, page }: { query: string; page: number }) {
  const from = (page - 1) * RESULTS_PER_PAGE
  const { packages, total } = await searchPackages(query, {
    size: RESULTS_PER_PAGE,
    from,
  })

  // Fetch downloads for each package (with fallback to 0 on error)
  const packagesWithDownloads = await Promise.all(
    packages.map(async (pkg) => {
      try {
        const downloads = await getDownloadCount(pkg.name, 'last-week')
        return { ...pkg, downloads }
      } catch {
        return { ...pkg, downloads: 0 }
      }
    })
  )

  const totalPages = Math.ceil(total / RESULTS_PER_PAGE)
  const hasNextPage = page < totalPages
  const hasPrevPage = page > 1

  if (packages.length === 0) {
    return (
      <div className="rounded-lg border p-12 text-center">
        <Package className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
        <h2 className="mb-2 text-lg font-medium">No packages found</h2>
        <p className="mb-4 text-muted-foreground">
          We couldn't find any packages matching "{query}"
        </p>
        <Button asChild>
          <Link href="/">Back to home</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Results count */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Showing {from + 1}-{Math.min(from + RESULTS_PER_PAGE, total)} of{' '}
          <span className="font-medium text-foreground">
            {total.toLocaleString()}
          </span>{' '}
          packages
        </p>
      </div>

      {/* Results */}
      <div className="grid gap-4">
        {packagesWithDownloads.map((pkg) => (
          <PackageCard key={pkg.name} pkg={pkg} showScore />
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={!hasPrevPage}
            asChild={hasPrevPage}
          >
            {hasPrevPage ? (
              <Link
                href={`/search?q=${encodeURIComponent(query)}&page=${page - 1}`}
              >
                <ArrowLeft className="mr-1.5 h-4 w-4" />
                Previous
              </Link>
            ) : (
              <>
                <ArrowLeft className="mr-1.5 h-4 w-4" />
                Previous
              </>
            )}
          </Button>

          <div className="flex items-center gap-1 px-2">
            <span className="text-sm text-muted-foreground">
              Page {page} of {totalPages}
            </span>
          </div>

          <Button
            variant="outline"
            size="sm"
            disabled={!hasNextPage}
            asChild={hasNextPage}
          >
            {hasNextPage ? (
              <Link
                href={`/search?q=${encodeURIComponent(query)}&page=${page + 1}`}
              >
                Next
                <ArrowRight className="ml-1.5 h-4 w-4" />
              </Link>
            ) : (
              <>
                Next
                <ArrowRight className="ml-1.5 h-4 w-4" />
              </>
            )}
          </Button>
        </div>
      )}
    </div>
  )
}

function SearchResultsSkeleton() {
  return (
    <div className="space-y-6">
      <div className="h-5 w-48 animate-pulse rounded bg-muted" />
      <div className="grid gap-4">
        {Array.from({ length: 10 }).map((_, i) => (
          <PackageCardSkeleton key={i} />
        ))}
      </div>
    </div>
  )
}

function EmptySearchState() {
  return (
    <div className="rounded-lg border p-12 text-center">
      <SearchIcon className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
      <h2 className="mb-2 text-lg font-medium">Search for packages</h2>
      <p className="mb-4 text-muted-foreground">
        Enter a search term to find npm packages
      </p>
      <div className="mx-auto max-w-md">
        <SearchBar autoFocus />
      </div>
    </div>
  )
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const { q, page: pageStr } = await searchParams
  const query = q?.trim() || ''
  const page = Math.max(1, Number.parseInt(pageStr || '1', 10))

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="mx-auto max-w-4xl px-4 py-8">
        {/* Search Header */}
        <div className="mb-8 space-y-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" asChild>
              <Link href="/">
                <ArrowLeft className="h-4 w-4" />
              </Link>
            </Button>
            <h1 className="text-2xl font-bold">
              {query ? `Results for "${query}"` : 'Search packages'}
            </h1>
          </div>
          <SearchBar defaultValue={query} />
        </div>

        {/* Results */}
        {query ? (
          <Suspense
            key={`${query}-${page}`}
            fallback={<SearchResultsSkeleton />}
          >
            <SearchResults query={query} page={page} />
          </Suspense>
        ) : (
          <EmptySearchState />
        )}
      </main>
    </div>
  )
}
