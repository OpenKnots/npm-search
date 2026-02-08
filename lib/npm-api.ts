import type {
  NpmPackageMetadata,
  NpmSearchResult,
  NpmDownloads,
  NpmDownloadsRange,
  PackageDetails,
  PackageListItem,
  VersionInfo,
  NpmAuthor,
} from '@/types/npm'

const REGISTRY_URL = 'https://registry.npmjs.org'
const DOWNLOADS_URL = 'https://api.npmjs.org/downloads'

// Helper to extract author name
function getAuthorName(author?: NpmAuthor | string): string | undefined {
  if (!author) return undefined
  if (typeof author === 'string') return author
  return author.name
}

// Search packages
export async function searchPackages(
  query: string,
  options: {
    size?: number
    from?: number
    quality?: number
    popularity?: number
    maintenance?: number
  } = {}
): Promise<{ packages: PackageListItem[]; total: number }> {
  const { size = 20, from = 0 } = options

  const params = new URLSearchParams({
    text: query,
    size: String(size),
    from: String(from),
  })

  const response = await fetch(`${REGISTRY_URL}/-/v1/search?${params}`, {
    next: { revalidate: 60 },
  })

  if (!response.ok) {
    throw new Error(`Search failed: ${response.statusText}`)
  }

  const data: NpmSearchResult = await response.json()

  const packages: PackageListItem[] = data.objects.map((obj) => ({
    name: obj.package.name,
    version: obj.package.version,
    description: obj.package.description,
    keywords: obj.package.keywords,
    author: getAuthorName(obj.package.author),
    date: obj.package.date,
    score: {
      quality: obj.score.detail.quality,
      popularity: obj.score.detail.popularity,
      maintenance: obj.score.detail.maintenance,
    },
  }))

  return { packages, total: data.total }
}

// Encode package name for npm registry URL
// Scoped packages need special handling: @scope/name -> @scope%2Fname
function encodePackageName(name: string): string {
  if (name.startsWith('@')) {
    // Scoped package: encode only the slash
    return name.replace('/', '%2F')
  }
  return encodeURIComponent(name)
}

// Get package metadata
export async function getPackageMetadata(
  name: string
): Promise<NpmPackageMetadata> {
  const response = await fetch(`${REGISTRY_URL}/${encodePackageName(name)}`, {
    next: { revalidate: 300 },
  })

  if (!response.ok) {
    if (response.status === 404) {
      throw new Error(`Package "${name}" not found`)
    }
    throw new Error(`Failed to fetch package: ${response.statusText}`)
  }

  return response.json()
}

// Get package details (processed for UI)
export async function getPackageDetails(
  name: string,
  version?: string
): Promise<PackageDetails> {
  const metadata = await getPackageMetadata(name)
  const targetVersion = version || metadata['dist-tags'].latest
  const versionData = metadata.versions[targetVersion]

  if (!versionData) {
    throw new Error(`Version "${targetVersion}" not found for package "${name}"`)
  }

  // Sort versions by date (newest first)
  const versions: VersionInfo[] = Object.keys(metadata.versions)
    .map((v) => ({
      version: v,
      date: metadata.time[v] || '',
      deprecated: metadata.versions[v].deprecated,
    }))
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

  return {
    name: metadata.name,
    version: targetVersion,
    description: metadata.description,
    keywords: metadata.keywords,
    author: metadata.author,
    license: versionData.license,
    homepage: metadata.homepage,
    repository: metadata.repository,
    readme: metadata.readme,
    dependencies: versionData.dependencies || {},
    devDependencies: versionData.devDependencies || {},
    peerDependencies: versionData.peerDependencies || {},
    versions,
    maintainers: metadata.maintainers,
    publishedAt: metadata.time.created,
    updatedAt: metadata.time.modified,
    deprecated: versionData.deprecated,
    distTags: metadata['dist-tags'],
    engines: versionData.engines,
    types: versionData.types || versionData.typings,
    unpackedSize: versionData.dist?.unpackedSize,
    fileCount: versionData.dist?.fileCount,
  }
}

// Get download counts
export async function getDownloadCount(
  name: string,
  period: 'last-day' | 'last-week' | 'last-month' | 'last-year' = 'last-week'
): Promise<number> {
  try {
    const response = await fetch(
      `${DOWNLOADS_URL}/point/${period}/${encodePackageName(name)}`,
      { next: { revalidate: 3600 } }
    )

    if (!response.ok) {
      // Package might not have download stats (new, unpublished, or invalid)
      return 0
    }

    const data: NpmDownloads = await response.json()
    return data.downloads ?? 0
  } catch {
    // Silently fail for download counts - not critical
    return 0
  }
}

// Get download range for charts
export async function getDownloadRange(
  name: string,
  period: 'last-week' | 'last-month' | 'last-year' = 'last-month'
): Promise<Array<{ date: string; downloads: number }>> {
  try {
    const response = await fetch(
      `${DOWNLOADS_URL}/range/${period}/${encodePackageName(name)}`,
      { next: { revalidate: 3600 } }
    )

    if (!response.ok) return []

    const data: NpmDownloadsRange = await response.json()
    return data.downloads.map((d) => ({
      date: d.day,
      downloads: d.downloads,
    }))
  } catch {
    return []
  }
}

// Get popular packages
export async function getPopularPackages(
  count: number = 10
): Promise<PackageListItem[]> {
  // Use a broad keyword search since npm API requires non-empty text
  const { packages } = await searchPackages('keywords:javascript', {
    size: count,
    popularity: 1,
  })
  return packages
}

// Format download count for display
export function formatDownloads(count: number): string {
  if (count >= 1_000_000_000) {
    return `${(count / 1_000_000_000).toFixed(1)}B`
  }
  if (count >= 1_000_000) {
    return `${(count / 1_000_000).toFixed(1)}M`
  }
  if (count >= 1_000) {
    return `${(count / 1_000).toFixed(1)}K`
  }
  return String(count)
}

// Format file size
export function formatFileSize(bytes: number): string {
  if (bytes >= 1_000_000) {
    return `${(bytes / 1_000_000).toFixed(1)} MB`
  }
  if (bytes >= 1_000) {
    return `${(bytes / 1_000).toFixed(1)} KB`
  }
  return `${bytes} B`
}

// Format relative time
export function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

  if (diffDays === 0) return 'today'
  if (diffDays === 1) return 'yesterday'
  if (diffDays < 7) return `${diffDays} days ago`
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`
  if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`
  return `${Math.floor(diffDays / 365)} years ago`
}

// Get GitHub repo URL from repository field
export function getGitHubUrl(
  repository?: { type?: string; url?: string; directory?: string } | string
): string | null {
  if (!repository) return null

  const url = typeof repository === 'string' ? repository : repository.url
  if (!url) return null

  // Handle various GitHub URL formats
  const match = url.match(
    /github\.com[/:]([\w-]+)\/([\w.-]+?)(?:\.git)?(?:#.*)?$/
  )
  if (match) {
    return `https://github.com/${match[1]}/${match[2]}`
  }

  return null
}
