'use client'

import { useMemo, useState } from 'react'
import { Globe, Search, Trash2 } from 'lucide-react'
import { useBrowser } from '../browser-provider'

function hostname(url: string) {
  try {
    return new URL(url).hostname.replace(/^www\./, '')
  } catch {
    return url
  }
}

function dayLabel(ts: number) {
  const d = new Date(ts)
  const today = new Date()
  const yesterday = new Date()
  yesterday.setDate(today.getDate() - 1)
  if (d.toDateString() === today.toDateString()) return 'Today'
  if (d.toDateString() === yesterday.toDateString()) return 'Yesterday'
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
}

export function HistoryPanel() {
  const { history, navigate, removeHistoryItem, clearHistory } = useBrowser()
  const [query, setQuery] = useState('')

  const filtered = useMemo(() => {
    const q = query.toLowerCase()
    return history.filter(
      (h) =>
        !q ||
        h.title.toLowerCase().includes(q) ||
        h.url.toLowerCase().includes(q),
    )
  }, [history, query])

  const groups = useMemo(() => {
    const map = new Map<string, typeof filtered>()
    for (const item of filtered) {
      const key = dayLabel(item.visitedAt)
      const arr = map.get(key) ?? []
      arr.push(item)
      map.set(key, arr)
    }
    return Array.from(map.entries())
  }, [filtered])

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-2 px-3 pb-3">
        <div className="flex h-9 flex-1 items-center gap-2 rounded-lg border border-border bg-secondary/50 px-3">
          <Search className="size-4 text-muted-foreground" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search history"
            className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
          />
        </div>
        {history.length > 0 && (
          <button
            type="button"
            onClick={clearHistory}
            className="rounded-lg px-2.5 py-1.5 text-xs font-medium text-destructive transition-colors hover:bg-destructive/10"
          >
            Clear all
          </button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto px-2 pb-4">
        {filtered.length === 0 ? (
          <p className="px-3 py-10 text-center text-sm text-muted-foreground">
            No history yet.
          </p>
        ) : (
          groups.map(([label, items]) => (
            <div key={label} className="mb-3">
              <p className="px-2 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                {label}
              </p>
              {items.map((item) => (
                <div
                  key={item.id}
                  className="group flex items-center gap-2 rounded-lg px-2 py-2 transition-colors hover:bg-secondary"
                >
                  <Globe className="size-4 shrink-0 text-muted-foreground" />
                  <button
                    type="button"
                    onClick={() => navigate(item.url)}
                    className="min-w-0 flex-1 text-left"
                  >
                    <span className="block truncate text-sm">{item.title}</span>
                    <span className="block truncate text-xs text-muted-foreground">
                      {hostname(item.url)}
                    </span>
                  </button>
                  <button
                    type="button"
                    onClick={() => removeHistoryItem(item.id)}
                    aria-label="Remove"
                    className="flex size-6 shrink-0 items-center justify-center rounded-md opacity-0 hover:bg-muted group-hover:opacity-100"
                  >
                    <Trash2 className="size-3.5 text-muted-foreground" />
                  </button>
                </div>
              ))}
            </div>
          ))
        )}
      </div>
    </div>
  )
}
