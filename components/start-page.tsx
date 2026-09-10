'use client'

import { useState } from 'react'
import Image from 'next/image'
import { Search, Shield, Sparkles, Zap } from 'lucide-react'
import { useBrowser } from './browser-provider'
import { EngineSwitcher } from './engine-switcher'
import { getSearchEngine } from '@/lib/search-engines'

const QUICK_LINKS = [
  { label: 'YouTube', url: 'https://www.youtube.com' },
  { label: 'Wikipedia', url: 'https://www.wikipedia.org' },
  { label: 'Reddit', url: 'https://www.reddit.com' },
  { label: 'GitHub', url: 'https://github.com' },
  { label: 'Discord', url: 'https://discord.com/app' },
  { label: 'Spotify', url: 'https://open.spotify.com' },
  { label: 'Twitch', url: 'https://www.twitch.tv' },
  { label: 'Example', url: 'https://example.com' },
]

export function StartPage() {
  const { navigate, settings, setPanel, bookmarks } = useBrowser()
  const [q, setQ] = useState('')
  const engine = getSearchEngine(settings.searchEngineId)

  function submit(e: React.FormEvent) {
    e.preventDefault()
    if (!q.trim()) return
    navigate(q)
  }

  return (
    <div className="relative h-full w-full overflow-y-auto bg-background">
      {/* ambient glow */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-[420px] opacity-40 blur-3xl"
        style={{
          background:
            'radial-gradient(ellipse 60% 100% at 50% 0%, oklch(0.55 0.25 320 / 0.55), transparent 70%)',
        }}
      />

      <div className="relative mx-auto flex min-h-full max-w-3xl flex-col items-center px-6 py-16">
        <Image
          src="/quantum-logo.png"
          alt="Quantum Services"
          width={420}
          height={280}
          priority
          className="h-auto w-[min(420px,80%)] select-none drop-shadow-[0_0_40px_rgba(168,85,247,0.35)]"
        />

        <p className="-mt-2 text-center text-sm text-muted-foreground text-balance">
          Private proxy browser powered by Scramjet, Ultraviolet &amp; Rammerhead
        </p>

        <form onSubmit={submit} className="mt-8 w-full max-w-xl">
          <div className="flex h-14 items-center gap-3 rounded-full border border-border bg-card/70 px-5 shadow-xl shadow-black/30 backdrop-blur transition-colors focus-within:border-ring focus-within:ring-2 focus-within:ring-ring/30">
            <Search className="size-5 shrink-0 text-muted-foreground" />
            <input
              autoFocus
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder={`Search with ${engine.name} or enter a URL`}
              spellCheck={false}
              className="min-w-0 flex-1 bg-transparent text-base text-foreground outline-none placeholder:text-muted-foreground"
            />
            <button
              type="submit"
              className="flex h-9 items-center gap-1.5 rounded-full quantum-gradient px-4 text-sm font-semibold text-white transition-opacity hover:opacity-90"
            >
              <Zap className="size-4" />
              Go
            </button>
          </div>
        </form>

        <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
          <EngineSwitcher variant="full" />
          <button
            type="button"
            onClick={() => setPanel('ai')}
            className="flex items-center gap-1.5 rounded-full border border-border bg-secondary/60 px-3 py-1.5 text-sm font-medium transition-colors hover:bg-secondary"
          >
            <Sparkles className="size-4 text-quantum-pink" />
            Ask AI
          </button>
          <button
            type="button"
            onClick={() => setPanel('settings')}
            className="flex items-center gap-1.5 rounded-full border border-border bg-secondary/60 px-3 py-1.5 text-sm font-medium transition-colors hover:bg-secondary"
          >
            <Shield className="size-4 text-quantum-blue" />
            Privacy
          </button>
        </div>

        {/* Quick links */}
        <div className="mt-12 w-full">
          <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Quick access
          </h2>
          <div className="grid grid-cols-4 gap-3 sm:grid-cols-4">
            {QUICK_LINKS.map((link) => (
              <button
                key={link.url}
                type="button"
                onClick={() => navigate(link.url)}
                className="group flex flex-col items-center gap-2 rounded-xl border border-border bg-card/50 p-4 transition-all hover:-translate-y-0.5 hover:border-primary/50 hover:bg-card"
              >
                <span className="flex size-10 items-center justify-center rounded-full quantum-gradient text-sm font-bold text-white">
                  {link.label.slice(0, 2)}
                </span>
                <span className="truncate text-xs text-muted-foreground group-hover:text-foreground">
                  {link.label}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Bookmarks preview */}
        {bookmarks.length > 0 && (
          <div className="mt-10 w-full">
            <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Bookmarks
            </h2>
            <div className="flex flex-wrap gap-2">
              {bookmarks.slice(0, 12).map((b) => (
                <button
                  key={b.id}
                  type="button"
                  onClick={() => navigate(b.url)}
                  className="max-w-[220px] truncate rounded-full border border-border bg-secondary/50 px-3 py-1.5 text-xs text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
                  title={b.url}
                >
                  {b.title}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
