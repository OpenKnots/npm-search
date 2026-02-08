// NPM Registry API Types

export interface NpmPackage {
  name: string
  version: string
  description?: string
  keywords?: string[]
  author?: NpmAuthor | string
  license?: string
  homepage?: string
  repository?: NpmRepository
  bugs?: { url?: string; email?: string }
  main?: string
  module?: string
  types?: string
  dependencies?: Record<string, string>
  devDependencies?: Record<string, string>
  peerDependencies?: Record<string, string>
  engines?: Record<string, string>
  scripts?: Record<string, string>
}

export interface NpmAuthor {
  name: string
  email?: string
  url?: string
}

export interface NpmRepository {
  type?: string
  url?: string
  directory?: string
}

export interface NpmPackageMetadata {
  _id: string
  _rev?: string
  name: string
  description?: string
  'dist-tags': {
    latest: string
    [tag: string]: string
  }
  versions: Record<string, NpmVersionDetails>
  time: Record<string, string>
  maintainers: NpmMaintainer[]
  author?: NpmAuthor | string
  repository?: NpmRepository
  bugs?: { url?: string; email?: string }
  license?: string
  homepage?: string
  keywords?: string[]
  readme?: string
  readmeFilename?: string
}

export interface NpmVersionDetails extends NpmPackage {
  _id: string
  _npmVersion?: string
  _nodeVersion?: string
  dist: {
    shasum: string
    tarball: string
    integrity?: string
    fileCount?: number
    unpackedSize?: number
    signatures?: Array<{ keyid: string; sig: string }>
  }
  _npmUser?: NpmMaintainer
  maintainers?: NpmMaintainer[]
  deprecated?: string
}

export interface NpmMaintainer {
  name: string
  email?: string
}

export interface NpmSearchResult {
  objects: NpmSearchObject[]
  total: number
  time: string
}

export interface NpmSearchObject {
  package: {
    name: string
    scope?: string
    version: string
    description?: string
    keywords?: string[]
    date: string
    links: {
      npm?: string
      homepage?: string
      repository?: string
      bugs?: string
    }
    author?: NpmAuthor
    publisher: NpmMaintainer
    maintainers: NpmMaintainer[]
  }
  score: {
    final: number
    detail: {
      quality: number
      popularity: number
      maintenance: number
    }
  }
  searchScore: number
}

export interface NpmDownloads {
  downloads: number
  start: string
  end: string
  package: string
}

export interface NpmDownloadsRange {
  downloads: Array<{
    downloads: number
    day: string
  }>
  start: string
  end: string
  package: string
}

// Processed types for UI
export interface PackageListItem {
  name: string
  version: string
  description?: string
  keywords?: string[]
  author?: string
  date?: string
  downloads?: number
  score?: {
    quality: number
    popularity: number
    maintenance: number
  }
}

export interface PackageDetails {
  name: string
  version: string
  description?: string
  keywords?: string[]
  author?: NpmAuthor | string
  license?: string
  homepage?: string
  repository?: NpmRepository
  readme?: string
  dependencies: Record<string, string>
  devDependencies: Record<string, string>
  peerDependencies: Record<string, string>
  versions: VersionInfo[]
  maintainers: NpmMaintainer[]
  downloads?: {
    weekly: number
    monthly?: number
  }
  publishedAt?: string
  updatedAt?: string
  deprecated?: string
  distTags: Record<string, string>
  engines?: Record<string, string>
  types?: string
  unpackedSize?: number
  fileCount?: number
}

export interface VersionInfo {
  version: string
  date: string
  deprecated?: string
}
