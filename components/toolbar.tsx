'use client'

import { useEffect, useRef, useState } from 'react'
import {
  ArrowLeft,
  ArrowRight,
  Bookmark,
  History,
  Home,
  Lock,
  RotateCw,
  Search,
  Settings,
  Sparkles,
  Star,
  X,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useBrowser } from './browser-provider'
import { EngineSwitcher } from './engine-switcher'

function NavButton({
  children,
  onClick,
  disabled,
  label,
}: {
  children: React.ReactNode
  onClick: () => void
  disabled?: boolean
  label: string
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      title={label}
      className="flex size-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground disabled:pointer-events-none disabled:opacity-30"
    >
      {children}
    </button>
  )
}

export function Toolbar() {
  const {
    activeTab,
    navigate,
    goBack,
    goForward,
    reload,
    stop,
    goHome,
    canGoBack,
    canGoForward,
    toggleBookmark,
    isBookmarked,
    panel,
    setPanel,
  } = useBrowser()

  const [input, setInput] = useState(activeTab.url)
  const [focused, setFocused] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (!focused) setInput(activeTab.url)
  }, [activeTab.url, activeTab.id, focused])

  const bookmarked = activeTab.url ? isBookmarked(activeTab.url) : false
  const isSecure = /^https:\/\//i.test(activeTab.url)

  function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!input.trim()) return
    navigate(input)
    inputRef.current?.blur()
  }

  const togglePanel = (id: typeof panel) =>
    setPanel(panel === id ? null : id)

  return (
    <div className="flex items-center gap-1.5 px-2 py-2">
      <div className="flex items-center gap-0.5">
        <NavButton onClick={goBack} disabled={!canGoBack} label="Back">
          <ArrowLeft className="size-4" />
        </NavButton>
        <NavButton onClick={goForward} disabled={!canGoForward} label="Forward">
          <ArrowRight className="size-4" />
        </NavButton>
        <NavButton
          onClick={activeTab.loading ? stop : reload}
          disabled={!activeTab.url && !activeTab.loading}
          label={activeTab.loading ? 'Stop' : 'Reload'}
        >
          {activeTab.loading ? (
            <X className="size-4" />
          ) : (
            <RotateCw className="size-4" />
          )}
        </NavButton>
        <NavButton onClick={goHome} label="Home">
          <Home className="size-4" />
        </NavButton>
      </div>

      <form onSubmit={onSubmit} className="flex min-w-0 flex-1 items-center">
        <div
          className={cn(
            'flex h-9 w-full items-center gap-2 rounded-full border bg-secondary/50 px-3 transition-colors',
            focused ? 'border-ring ring-2 ring-ring/30' : 'border-border',
          )}
        >
          {activeTab.url ? (
            isSecure ? (
              <Lock className="size-3.5 shrink-0 text-quantum-blue" />
            ) : (
              <Search className="size-3.5 shrink-0 text-muted-foreground" />
            )
          ) : (
            <Search className="size-3.5 shrink-0 text-muted-foreground" />
          )}
          <input
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onFocus={(e) => {
              setFocused(true)
              e.target.select()
            }}
            onBlur={() => setFocused(false)}
            placeholder="Search the web privately or enter a URL"
            spellCheck={false}
            className="min-w-0 flex-1 bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground"
          />
          {activeTab.url && (
            <button
              type="button"
              onClick={() => toggleBookmark()}
              aria-label={bookmarked ? 'Remove bookmark' : 'Add bookmark'}
              title={bookmarked ? 'Remove bookmark' : 'Add bookmark'}
              className="flex size-6 shrink-0 items-center justify-center rounded-md hover:bg-muted"
            >
              <Star
                className={cn(
                  'size-4',
                  bookmarked
                    ? 'fill-quantum-orange text-quantum-orange'
                    : 'text-muted-foreground',
                )}
              />
            </button>
          )}
        </div>
      </form>

      <EngineSwitcher />

      <div className="flex items-center gap-0.5">
        <button
          type="button"
          onClick={() => togglePanel('ai')}
          aria-label="AI assistant"
          title="AI assistant"
          className={cn(
            'flex size-8 items-center justify-center rounded-lg transition-colors',
            panel === 'ai'
              ? 'quantum-gradient text-white'
              : 'text-muted-foreground hover:bg-secondary hover:text-foreground',
          )}
        >
          <Sparkles className="size-4" />
        </button>
        <PanelButton
          active={panel === 'bookmarks'}
          onClick={() => togglePanel('bookmarks')}
          label="Bookmarks"
        >
          <Bookmark className="size-4" />
        </PanelButton>
        <PanelButton
          active={panel === 'history'}
          onClick={() => togglePanel('history')}
          label="History"
        >
          <History className="size-4" />
        </PanelButton>
        <PanelButton
          active={panel === 'settings'}
          onClick={() => togglePanel('settings')}
          label="Settings"
        >
          <Settings className="size-4" />
        </PanelButton>
      </div>
    </div>
  )
}

function PanelButton({
  children,
  active,
  onClick,
  label,
}: {
  children: React.ReactNode
  active: boolean
  onClick: () => void
  label: string
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      title={label}
      className={cn(
        'flex size-8 items-center justify-center rounded-lg transition-colors',
        active
          ? 'bg-secondary text-foreground'
          : 'text-muted-foreground hover:bg-secondary hover:text-foreground',
      )}
    >
      {children}
    </button>
  )
}
