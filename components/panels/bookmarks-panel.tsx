'use client'

import { Bookmark, Star, Trash2 } from 'lucide-react'
import { useBrowser } from '../browser-provider'

function hostname(url: string) {
  try {
    return new URL(url).hostname.replace(/^www\./, '')
  } catch {
    return url
  }
}

export function BookmarksPanel() {
  const { bookmarks, navigate, removeBookmark } = useBrowser()

  return (
    <div className="flex h-full flex-col">
      <div className="flex-1 overflow-y-auto px-2 pb-4">
        {bookmarks.length === 0 ? (
          <div className="flex flex-col items-center gap-3 px-4 py-12 text-center">
            <span className="flex size-12 items-center justify-center rounded-full bg-secondary">
              <Bookmark className="size-5 text-muted-foreground" />
            </span>
            <p className="text-sm text-muted-foreground text-balance">
              No bookmarks yet. Tap the{' '}
              <Star className="inline size-3.5 -translate-y-px text-quantum-orange" />{' '}
              star in the address bar to save a page.
            </p>
          </div>
        ) : (
          bookmarks.map((b) => (
            <div
              key={b.id}
              className="group flex items-center gap-2 rounded-lg px-2 py-2 transition-colors hover:bg-secondary"
            >
              <span className="flex size-7 shrink-0 items-center justify-center rounded-md quantum-gradient text-[10px] font-bold text-white">
                {hostname(b.url).slice(0, 2).toUpperCase()}
              </span>
              <button
                type="button"
                onClick={() => navigate(b.url)}
                className="min-w-0 flex-1 text-left"
              >
                <span className="block truncate text-sm">{b.title}</span>
                <span className="block truncate text-xs text-muted-foreground">
                  {hostname(b.url)}
                </span>
              </button>
              <button
                type="button"
                onClick={() => removeBookmark(b.id)}
                aria-label="Remove bookmark"
                className="flex size-6 shrink-0 items-center justify-center rounded-md opacity-0 hover:bg-muted group-hover:opacity-100"
              >
                <Trash2 className="size-3.5 text-muted-foreground" />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
