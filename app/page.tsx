import { Suspense } from 'react'
import { Package, ArrowRight, TrendingUp, Clock, Star } from 'lucide-react'
import { Header } from '@/components/layout/header'
import { SearchBar } from '@/components/search/search-bar'
import { PackageCard, PackageCardSkeleton } from '@/components/package/package-card'
import { searchPackages, getDownloadCount } from '@/lib/npm-api'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import type { PackageListItem } from '@/types/npm'

// Featured packages to show on homepage
const FEATURED_PACKAGES = [
  'react',
  'next',
  'typescript',
  'tailwindcss',
  'vite',
  'eslint',
]

async function getPackageWithDownloads(name: string): Promise<PackageListItem | null> {
  try {
    const { packages } = await searchPackages(name, { size: 1 })
    if (packages.length === 0) return null
    
    const pkg = packages[0]
    const downloads = await getDownloadCount(name, 'last-week')
    
    return { ...pkg, downloads }
  } catch {
    return null
  }
}

async function FeaturedPackages() {
  const packagesData = await Promise.all(
    FEATURED_PACKAGES.map(getPackageWithDownloads)
  )
  const packages = packagesData.filter((p): p is PackageListItem => p !== null)

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {packages.map((pkg) => (
        <PackageCard key={pkg.name} pkg={pkg} />
      ))}
    </div>
  )
}

async function TrendingPackages() {
  // Use popular keywords to find trending packages since npm API requires a search term
  const { packages } = await searchPackages('keywords:javascript', { size: 6 })
  
  // Fetch downloads for each
  const packagesWithDownloads = await Promise.all(
    packages.map(async (pkg) => {
      const downloads = await getDownloadCount(pkg.name, 'last-week')
      return { ...pkg, downloads }
    })
  )

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {packagesWithDownloads.map((pkg) => (
        <PackageCard key={pkg.name} pkg={pkg} showScore />
      ))}
    </div>
  )
}

function PackageGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: count }).map((_, i) => (
        <PackageCardSkeleton key={i} />
      ))}
    </div>
  )
}

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main>
        {/* Hero Section */}
        <section className="border-b bg-gradient-to-b from-muted/50 to-background">
          <div className="mx-auto max-w-4xl px-4 py-16 text-center sm:py-24">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border bg-background px-4 py-1.5 text-sm text-muted-foreground">
              <Package className="h-4 w-4" />
              <span>Explore over 2 million packages</span>
            </div>
            
            <h1 className="mb-4 text-balance text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
              Find the perfect npm package
            </h1>
            
            <p className="mx-auto mb-8 max-w-2xl text-pretty text-lg text-muted-foreground sm:text-xl">
              Search, explore, and discover npm packages with detailed metadata, 
              dependency trees, and version history.
            </p>
            
            <div className="mx-auto max-w-xl">
              <SearchBar size="large" autoFocus placeholder="Search packages... (press / to focus)" />
            </div>
            
            <div className="mt-6 flex flex-wrap items-center justify-center gap-2 text-sm text-muted-foreground">
              <span>Popular:</span>
              {['react', 'vue', 'typescript', 'lodash', 'axios'].map((pkg) => (
                <Link
                  key={pkg}
                  href={`/package/${pkg}`}
                  className="rounded-md border bg-background px-2 py-1 font-mono text-xs transition-colors hover:bg-accent"
                >
                  {pkg}
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* Featured Packages */}
        <section className="border-b py-12">
          <div className="mx-auto max-w-6xl px-4">
            <div className="mb-6 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Star className="h-5 w-5 text-primary" />
                <h2 className="text-xl font-semibold">Featured Packages</h2>
              </div>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/search?q=">
                  View all
                  <ArrowRight className="ml-1 h-4 w-4" />
                </Link>
              </Button>
            </div>
            
            <Suspense fallback={<PackageGridSkeleton count={6} />}>
              <FeaturedPackages />
            </Suspense>
          </div>
        </section>

        {/* Trending Packages */}
        <section className="py-12">
          <div className="mx-auto max-w-6xl px-4">
            <div className="mb-6 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-primary" />
                <h2 className="text-xl font-semibold">Trending Packages</h2>
              </div>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/search?q=">
                  View all
                  <ArrowRight className="ml-1 h-4 w-4" />
                </Link>
              </Button>
            </div>
            
            <Suspense fallback={<PackageGridSkeleton count={6} />}>
              <TrendingPackages />
            </Suspense>
          </div>
        </section>

        {/* Stats Section */}
        <section className="border-t bg-muted/30 py-12">
          <div className="mx-auto max-w-6xl px-4">
            <div className="grid gap-8 sm:grid-cols-3">
              <div className="text-center">
                <div className="text-3xl font-bold">2M+</div>
                <div className="text-sm text-muted-foreground">Packages</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold">50B+</div>
                <div className="text-sm text-muted-foreground">Weekly Downloads</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold">17M+</div>
                <div className="text-sm text-muted-foreground">Developers</div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t py-8">
        <div className="mx-auto max-w-6xl px-4">
          <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Package className="h-4 w-4" />
              <span>npm explorer</span>
            </div>
            <div className="flex gap-4 text-sm text-muted-foreground">
              <a href="https://npmjs.com" target="_blank" rel="noopener noreferrer" className="hover:text-foreground">
                npm
              </a>
              <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="hover:text-foreground">
                GitHub
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
