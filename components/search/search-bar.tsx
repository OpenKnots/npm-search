'use client'

import React from "react"

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Search, ArrowRight, Loader2 } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface SearchBarProps {
  size?: 'default' | 'large'
  autoFocus?: boolean
  defaultValue?: string
  placeholder?: string
  className?: string
}

export function SearchBar({
  size = 'default',
  autoFocus = false,
  defaultValue = '',
  placeholder = 'Search packages...',
  className,
}: SearchBarProps) {
  const router = useRouter()
  const inputRef = useRef<HTMLInputElement>(null)
  const [query, setQuery] = useState(defaultValue)
  const [isLoading, setIsLoading] = useState(false)

  // Keyboard shortcut to focus search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === '/' && !e.ctrlKey && !e.metaKey) {
        const target = e.target as HTMLElement
        if (target.tagName !== 'INPUT' && target.tagName !== 'TEXTAREA') {
          e.preventDefault()
          inputRef.current?.focus()
        }
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (query.trim()) {
      setIsLoading(true)
      router.push(`/search?q=${encodeURIComponent(query.trim())}`)
    }
  }

  const isLarge = size === 'large'

  return (
    <form onSubmit={handleSubmit} className={cn('relative w-full', className)}>
      <div className="relative">
        <Search
          className={cn(
            'absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground',
            isLarge ? 'h-5 w-5' : 'h-4 w-4'
          )}
        />
        <Input
          ref={inputRef}
          type="search"
          placeholder={placeholder}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          autoFocus={autoFocus}
          className={cn(
            'pr-20',
            isLarge
              ? 'h-14 pl-11 text-lg rounded-xl'
              : 'h-10 pl-9 text-sm rounded-lg'
          )}
        />
        <div className="absolute right-1.5 top-1/2 -translate-y-1/2 flex items-center gap-1">
          <kbd
            className={cn(
              'hidden sm:inline-flex items-center rounded border bg-muted px-1.5 font-mono text-muted-foreground',
              isLarge ? 'text-sm h-7' : 'text-xs h-5'
            )}
          >
            /
          </kbd>
          <Button
            type="submit"
            size={isLarge ? 'default' : 'sm'}
            disabled={!query.trim() || isLoading}
            className={cn(isLarge ? 'h-10 px-4' : 'h-7 px-2')}
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <ArrowRight className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>
    </form>
  )
}
