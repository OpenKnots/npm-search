import { Suspense } from 'react'
import type { Metadata } from 'next'
import Link from 'next/link'
import { User, Package, ArrowLeft, ExternalLink } from 'lucide-react'
import { Header } from '@/components/layout/header'
import { PackageCard, PackageCardSkeleton } from '@/components/package/package-card'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { searchPackages, getDownloadCount } from '@/lib/npm-api'

// Opt out of static prerendering — username is always dynamic
export const dynamic = 'force-dynamic'

interface UserPageProps {
  params: Promise<{ username: string }>
}

export async function generateMetadata({
  params,
}: UserPageProps): Promise<Metadata> {
  const { username } = await params
  
  return {
    title: `${username} - npm explorer`,
    description: `View packages by ${username} on npm explorer`,
  }
}

async function UserPackages({ username }: { username: string }) {
  // Search for packages by this maintainer
  const { packages, total } = await searchPackages(`maintainer:${username}`, {
    size: 50,
  })

  // Fetch downloads for each package
  const packagesWithDownloads = await Promise.all(
    packages.map(async (pkg) => {
      const downloads = await getDownloadCount(pkg.name, 'last-week')
      return { ...pkg, downloads }
    })
  )

  if (packages.length === 0) {
    return (
      <div className="rounded-lg border p-12 text-center">
        <Package className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
        <h2 className="mb-2 text-lg font-medium">No packages found</h2>
        <p className="text-muted-foreground">
          This user hasn't published any packages yet
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        {total} package{total !== 1 ? 's' : ''} published
      </p>
      <div className="grid gap-4">
        {packagesWithDownloads.map((pkg) => (
          <PackageCard key={pkg.name} pkg={pkg} />
        ))}
      </div>
    </div>
  )
}

function UserPackagesSkeleton() {
  return (
    <div className="space-y-4">
      <div className="h-5 w-32 animate-pulse rounded bg-muted" />
      <div className="grid gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <PackageCardSkeleton key={i} />
        ))}
      </div>
    </div>
  )
}

export default async function UserPage({ params }: UserPageProps) {
  const { username } = await params

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="mx-auto max-w-4xl px-4 py-8">
        {/* Back button */}
        <div className="mb-6">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/">
              <ArrowLeft className="mr-1.5 h-4 w-4" />
              Back
            </Link>
          </Button>
        </div>

        {/* User Header */}
        <div className="mb-8 flex items-start gap-4">
          <Avatar className="h-16 w-16">
            <AvatarFallback className="text-lg">
              {username.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold">{username}</h1>
              <Button variant="outline" size="sm" asChild>
                <a
                  href={`https://www.npmjs.com/~${username}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <ExternalLink className="mr-1.5 h-4 w-4" />
                  npm profile
                </a>
              </Button>
            </div>
            <p className="mt-1 text-muted-foreground">npm maintainer</p>
          </div>
        </div>

        {/* User's Packages */}
        <section>
          <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold">
            <Package className="h-5 w-5" />
            Packages
          </h2>
          <Suspense fallback={<UserPackagesSkeleton />}>
            <UserPackages username={username} />
          </Suspense>
        </section>
      </main>
    </div>
  )
}
