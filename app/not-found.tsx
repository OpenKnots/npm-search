import Link from 'next/link'
import { Package, Home, Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Header } from '@/components/layout/header'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="mx-auto flex max-w-md flex-col items-center justify-center px-4 py-24 text-center">
        <Package className="mb-6 h-16 w-16 text-muted-foreground" />
        
        <h1 className="mb-2 text-3xl font-bold">404</h1>
        <h2 className="mb-4 text-xl text-muted-foreground">Page not found</h2>
        
        <p className="mb-8 text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>

        <div className="flex gap-3">
          <Button asChild>
            <Link href="/">
              <Home className="mr-1.5 h-4 w-4" />
              Go home
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/search">
              <Search className="mr-1.5 h-4 w-4" />
              Search packages
            </Link>
          </Button>
        </div>
      </main>
    </div>
  )
}
