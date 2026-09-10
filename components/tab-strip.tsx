'use client'

import { Globe, Loader2, Plus, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useBrowser } from './browser-provider'
import { BrandLogo } from './brand-logo'

function hostname(url: string) {
  try {
    return new URL(url).hostname.replace(/^www\./, '')
  } catch {
    return url
  }
}

export function TabStrip() {
  const { tabs, activeTabId, selectTab, closeTab, createTab } = useBrowser()

  return (
    <div className="flex items-end gap-1 px-2 pt-2">
      <div className="mr-1 flex items-center gap-2 self-center pb-1 pl-1 pr-2">
        <BrandLogo size={22} />
        <span className="hidden font-display text-sm font-bold tracking-wide quantum-text-gradient sm:inline">
          QUANTUM
        </span>
      </div>

      <div className="flex min-w-0 flex-1 items-end gap-1 overflow-x-auto">
        {tabs.map((tab) => {
          const active = tab.id === activeTabId
          const label = tab.url ? tab.title || hostname(tab.url) : 'New Tab'
          return (
            <div
              key={tab.id}
              onClick={() => selectTab(tab.id)}
              className={cn(
                'group flex h-9 min-w-[120px] max-w-[220px] cursor-pointer items-center gap-2 rounded-t-lg border-b-0 px-3 text-sm transition-colors',
                active
                  ? 'bg-card text-foreground'
                  : 'bg-secondary/40 text-muted-foreground hover:bg-secondary/70',
              )}
            >
              {tab.loading ? (
                <Loader2 className="size-3.5 shrink-0 animate-spin text-primary" />
              ) : (
                <Globe className="size-3.5 shrink-0 opacity-70" />
              )}
              <span className="min-w-0 flex-1 truncate">{label}</span>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  closeTab(tab.id)
                }}
                aria-label="Close tab"
                className="flex size-5 shrink-0 items-center justify-center rounded-md opacity-0 transition-opacity hover:bg-muted group-hover:opacity-100"
              >
                <X className="size-3.5" />
              </button>
            </div>
          )
        })}

        <button
          type="button"
          onClick={() => createTab()}
          aria-label="New tab"
          className="mb-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
        >
          <Plus className="size-4" />
        </button>
      </div>
    </div>
  )
}
