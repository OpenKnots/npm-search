import { Suspense } from 'react'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { Header } from '@/components/layout/header'
import { PackageHeader } from '@/components/package/package-header'
import { ReadmeViewer } from '@/components/package/readme-viewer'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Skeleton } from '@/components/ui/skeleton'
import { getPackageDetails, getDownloadCount } from '@/lib/npm-api'
import type { PackageDetails } from '@/types/npm'
import { DependencyList } from '@/components/package/dependency-list'
import { VersionList } from '@/components/package/version-list'

interface PackagePageProps {
  params: Promise<{ name: string[] }>
}

function parsePackageName(nameParts: string[]): { name: string; version?: string } {
  // Handle scoped packages: ['@scope', 'name'] or ['@scope', 'name', 'v', '1.0.0']
  // Handle regular packages: ['name'] or ['name', 'v', '1.0.0']
  // Also handle URL-encoded names like ['%40scope%2Fname']
  
  // First, decode each part in case it's URL-encoded
  const decodedParts = nameParts.map((part) => {
    try {
      return decodeURIComponent(part)
    } catch {
      return part
    }
  })
  
  let name: string
  let version: string | undefined
  
  // Check if first part contains a full scoped package name (e.g., '@babel/parser')
  if (decodedParts[0]?.includes('/') && decodedParts[0]?.startsWith('@')) {
    name = decodedParts[0]
    if (decodedParts[1] === 'v' && decodedParts[2]) {
      version = decodedParts[2]
    }
  } else if (decodedParts[0]?.startsWith('@')) {
    // Scoped package split across parts
    name = `${decodedParts[0]}/${decodedParts[1]}`
    if (decodedParts[2] === 'v' && decodedParts[3]) {
      version = decodedParts[3]
    }
  } else {
    // Regular package
    name = decodedParts[0]
    if (decodedParts[1] === 'v' && decodedParts[2]) {
      version = decodedParts[2]
    }
  }
  
  return { name, version }
}

export async function generateMetadata({
  params,
}: PackagePageProps): Promise<Metadata> {
  const { name: nameParts } = await params
  const { name } = parsePackageName(nameParts)
  
  try {
    const pkg = await getPackageDetails(name)
    return {
      title: `${pkg.name} - npm explorer`,
      description: pkg.description || `View ${pkg.name} package details on npm explorer`,
    }
  } catch {
    return {
      title: 'Package not found - npm explorer',
    }
  }
}

async function PackageContent({ name, version }: { name: string; version?: string }) {
  let pkg: PackageDetails
  
  try {
    pkg = await getPackageDetails(name, version)
  } catch (error) {
    if (error instanceof Error && error.message.includes('not found')) {
      notFound()
    }
    throw error
  }
  
  const downloads = await getDownloadCount(name, 'last-week')
  
  return (
    <div className="space-y-8">
      <PackageHeader pkg={pkg} downloads={downloads} />
      
      <Tabs defaultValue="readme" className="w-full">
        <TabsList>
          <TabsTrigger value="readme">Readme</TabsTrigger>
          <TabsTrigger value="dependencies">
            Dependencies
            <span className="ml-1.5 text-xs text-muted-foreground">
              ({Object.keys(pkg.dependencies).length})
            </span>
          </TabsTrigger>
          <TabsTrigger value="versions">
            Versions
            <span className="ml-1.5 text-xs text-muted-foreground">
              ({pkg.versions.length})
            </span>
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="readme" className="mt-6">
          <ReadmeViewer readme={pkg.readme} />
        </TabsContent>
        
        <TabsContent value="dependencies" className="mt-6">
          <DependencyList
            dependencies={pkg.dependencies}
            devDependencies={pkg.devDependencies}
            peerDependencies={pkg.peerDependencies}
          />
        </TabsContent>
        
        <TabsContent value="versions" className="mt-6">
          <VersionList
            packageName={pkg.name}
            versions={pkg.versions}
            currentVersion={pkg.version}
          />
        </TabsContent>
      </Tabs>
    </div>
  )
}

function PackageContentSkeleton() {
  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-6 lg:flex-row lg:gap-8">
        <div className="flex-1 space-y-4">
          <Skeleton className="h-10 w-64" />
          <Skeleton className="h-6 w-full max-w-xl" />
          <div className="flex gap-2">
            <Skeleton className="h-6 w-16" />
            <Skeleton className="h-6 w-20" />
            <Skeleton className="h-6 w-14" />
          </div>
        </div>
        <div className="w-full lg:w-80">
          <Skeleton className="h-32 w-full" />
        </div>
      </div>
      <div className="space-y-4">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-64 w-full" />
      </div>
    </div>
  )
}

export default async function PackagePage({ params }: PackagePageProps) {
  const { name: nameParts } = await params
  const { name, version } = parsePackageName(nameParts)
  
  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="mx-auto max-w-6xl px-4 py-8">
        <Suspense fallback={<PackageContentSkeleton />}>
          <PackageContent name={name} version={version} />
        </Suspense>
      </main>
    </div>
  )
}
