'use client'

import { Bookmark, History, Settings, Sparkles, X } from 'lucide-react'
import { useBrowser } from './browser-provider'
import { HistoryPanel } from './panels/history-panel'
import { BookmarksPanel } from './panels/bookmarks-panel'
import { AiPanel } from './panels/ai-panel'
import { SettingsPanel } from './panels/settings-panel'

const META = {
  history: { title: 'History', icon: History },
  bookmarks: { title: 'Bookmarks', icon: Bookmark },
  ai: { title: 'Quantum AI', icon: Sparkles },
  settings: { title: 'Settings', icon: Settings },
} as const

export function SidePanel() {
  const { panel, setPanel } = useBrowser()
  if (!panel) return null

  const meta = META[panel]
  const Icon = meta.icon

  return (
    <aside className="flex h-full w-[340px] shrink-0 flex-col border-l border-border bg-card">
      <header className="flex h-12 shrink-0 items-center justify-between px-3">
        <span className="flex items-center gap-2 text-sm font-semibold">
          <Icon className="size-4 text-primary" />
          {meta.title}
        </span>
        <button
          type="button"
          onClick={() => setPanel(null)}
          aria-label="Close panel"
          className="flex size-7 items-center justify-center rounded-lg text-muted-foreground hover:bg-secondary hover:text-foreground"
        >
          <X className="size-4" />
        </button>
      </header>
      <div className="min-h-0 flex-1">
        {panel === 'history' && <HistoryPanel />}
        {panel === 'bookmarks' && <BookmarksPanel />}
        {panel === 'ai' && <AiPanel />}
        {panel === 'settings' && <SettingsPanel />}
      </div>
    </aside>
  )
}
