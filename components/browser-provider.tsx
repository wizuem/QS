'use client'

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import { useLocalStorage } from '@/lib/use-local-storage'
import { resolveInput } from '@/lib/search-engines'
import type {
  Bookmark,
  HistoryItem,
  ProxyEngineId,
  Settings,
  Tab,
} from '@/lib/types'

export type PanelId = 'history' | 'bookmarks' | 'ai' | 'settings' | null

const DEFAULT_SETTINGS: Settings = {
  engine: 'scramjet',
  searchEngineId: 'duckduckgo',
  proxyServers: { scramjet: '', ultraviolet: '', rammerhead: '' },
  saveHistory: true,
  blockAds: true,
  doNotTrack: true,
  clearOnExit: false,
  aiModel: 'openai/gpt-4.1-mini',
}

function uid() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36)
}

function newTab(url = ''): Tab {
  return {
    id: uid(),
    title: url ? url : 'New Tab',
    url,
    loading: false,
    history: url ? [url] : [],
    historyIndex: url ? 0 : -1,
  }
}

function hostname(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, '')
  } catch {
    return url
  }
}

interface BrowserContextValue {
  tabs: Tab[]
  activeTab: Tab
  activeTabId: string
  history: HistoryItem[]
  bookmarks: Bookmark[]
  settings: Settings
  panel: PanelId
  hydrated: boolean
  // tab actions
  createTab: (url?: string) => void
  closeTab: (id: string) => void
  selectTab: (id: string) => void
  // navigation
  navigate: (input: string) => void
  goBack: () => void
  goForward: () => void
  reload: () => void
  stop: () => void
  goHome: () => void
  setTabLoading: (id: string, loading: boolean) => void
  setTabTitle: (id: string, title: string) => void
  reportNavigation: (tabId: string, url: string, title: string) => void
  canGoBack: boolean
  canGoForward: boolean
  reloadNonce: number
  // bookmarks
  toggleBookmark: (url?: string, title?: string) => void
  removeBookmark: (id: string) => void
  isBookmarked: (url: string) => boolean
  // history
  removeHistoryItem: (id: string) => void
  clearHistory: () => void
  // settings
  updateSettings: (patch: Partial<Settings>) => void
  setEngine: (engine: ProxyEngineId) => void
  // panels
  setPanel: (panel: PanelId) => void
}

const BrowserContext = createContext<BrowserContextValue | null>(null)

export function BrowserProvider({ children }: { children: ReactNode }) {
  const [tabs, setTabs] = useState<Tab[]>([newTab()])
  const [activeTabId, setActiveTabId] = useState(tabs[0].id)
  const [panel, setPanel] = useState<PanelId>(null)
  const [reloadNonce, setReloadNonce] = useState(0)

  const historyStore = useLocalStorage<HistoryItem[]>('qs.history', [])
  const bookmarkStore = useLocalStorage<Bookmark[]>('qs.bookmarks', [])
  const settingsStore = useLocalStorage<Settings>('qs.settings', DEFAULT_SETTINGS)

  const hydrated =
    historyStore.hydrated && bookmarkStore.hydrated && settingsStore.hydrated

  const settings = useMemo(
    () => ({ ...DEFAULT_SETTINGS, ...settingsStore.value }),
    [settingsStore.value],
  )

  const activeTab = useMemo(
    () => tabs.find((t) => t.id === activeTabId) ?? tabs[0],
    [tabs, activeTabId],
  )

  const patchTab = useCallback(
    (id: string, patch: Partial<Tab> | ((t: Tab) => Partial<Tab>)) => {
      setTabs((prev) =>
        prev.map((t) =>
          t.id === id
            ? { ...t, ...(typeof patch === 'function' ? patch(t) : patch) }
            : t,
        ),
      )
    },
    [],
  )

  const createTab = useCallback((url = '') => {
    const t = newTab(url)
    setTabs((prev) => [...prev, t])
    setActiveTabId(t.id)
    setPanel(null)
  }, [])

  const closeTab = useCallback(
    (id: string) => {
      setTabs((prev) => {
        if (prev.length === 1) {
          const fresh = newTab()
          setActiveTabId(fresh.id)
          return [fresh]
        }
        const idx = prev.findIndex((t) => t.id === id)
        const next = prev.filter((t) => t.id !== id)
        if (id === activeTabId) {
          const neighbor = next[Math.max(0, idx - 1)]
          setActiveTabId(neighbor.id)
        }
        return next
      })
    },
    [activeTabId],
  )

  const selectTab = useCallback((id: string) => {
    setActiveTabId(id)
    setPanel(null)
  }, [])

  const recordHistory = useCallback(
    (url: string, title: string) => {
      if (!settings.saveHistory) return
      historyStore.setValue((prev) => {
        const item: HistoryItem = {
          id: uid(),
          url,
          title: title || hostname(url),
          visitedAt: Date.now(),
        }
        return [item, ...prev].slice(0, 500)
      })
    },
    [settings.saveHistory, historyStore],
  )

  const navigate = useCallback(
    (input: string) => {
      const url = resolveInput(input, settings.searchEngineId)
      if (!url) return
      patchTab(activeTabId, (t) => {
        const trimmed = t.history.slice(0, t.historyIndex + 1)
        const nextHistory = [...trimmed, url]
        return {
          url,
          title: hostname(url),
          loading: true,
          history: nextHistory,
          historyIndex: nextHistory.length - 1,
        }
      })
      recordHistory(url, hostname(url))
      setPanel(null)
    },
    [activeTabId, patchTab, recordHistory, settings.searchEngineId],
  )

  const goBack = useCallback(() => {
    patchTab(activeTabId, (t) => {
      if (t.historyIndex <= 0) return {}
      const idx = t.historyIndex - 1
      return { historyIndex: idx, url: t.history[idx], loading: true }
    })
  }, [activeTabId, patchTab])

  const goForward = useCallback(() => {
    patchTab(activeTabId, (t) => {
      if (t.historyIndex >= t.history.length - 1) return {}
      const idx = t.historyIndex + 1
      return { historyIndex: idx, url: t.history[idx], loading: true }
    })
  }, [activeTabId, patchTab])

  const reload = useCallback(() => {
    if (!activeTab.url) return
    patchTab(activeTabId, { loading: true })
    setReloadNonce((n) => n + 1)
  }, [activeTab.url, activeTabId, patchTab])

  const stop = useCallback(() => {
    patchTab(activeTabId, { loading: false })
  }, [activeTabId, patchTab])

  const goHome = useCallback(() => {
    patchTab(activeTabId, {
      url: '',
      title: 'New Tab',
      loading: false,
      history: [],
      historyIndex: -1,
    })
    setPanel(null)
  }, [activeTabId, patchTab])

  const setTabLoading = useCallback(
    (id: string, loading: boolean) => patchTab(id, { loading }),
    [patchTab],
  )
  const setTabTitle = useCallback(
    (id: string, title: string) => patchTab(id, { title }),
    [patchTab],
  )

  // Called when a page loads (or a link is clicked) inside the frame so the
  // address bar, tab title, per-tab history and global history stay in sync.
  const reportNavigation = useCallback(
    (tabId: string, url: string, title: string) => {
      let pushed = false
      patchTab(tabId, (t) => {
        if (t.url === url) {
          return { title: title || t.title, loading: false }
        }
        pushed = true
        const trimmed = t.history.slice(0, t.historyIndex + 1)
        // Avoid duplicating if this url is already the current stack entry.
        const nextHistory =
          trimmed[trimmed.length - 1] === url ? trimmed : [...trimmed, url]
        return {
          url,
          title: title || hostname(url),
          loading: false,
          history: nextHistory,
          historyIndex: nextHistory.length - 1,
        }
      })
      if (pushed) recordHistory(url, title || hostname(url))
    },
    [patchTab, recordHistory],
  )

  const isBookmarked = useCallback(
    (url: string) => bookmarkStore.value.some((b) => b.url === url),
    [bookmarkStore.value],
  )

  const toggleBookmark = useCallback(
    (url?: string, title?: string) => {
      const target = url ?? activeTab.url
      if (!target) return
      bookmarkStore.setValue((prev) => {
        if (prev.some((b) => b.url === target)) {
          return prev.filter((b) => b.url !== target)
        }
        return [
          {
            id: uid(),
            url: target,
            title: title || activeTab.title || hostname(target),
            createdAt: Date.now(),
          },
          ...prev,
        ]
      })
    },
    [activeTab.url, activeTab.title, bookmarkStore],
  )

  const removeBookmark = useCallback(
    (id: string) =>
      bookmarkStore.setValue((prev) => prev.filter((b) => b.id !== id)),
    [bookmarkStore],
  )

  const removeHistoryItem = useCallback(
    (id: string) =>
      historyStore.setValue((prev) => prev.filter((h) => h.id !== id)),
    [historyStore],
  )
  const clearHistory = useCallback(
    () => historyStore.setValue([]),
    [historyStore],
  )

  const updateSettings = useCallback(
    (patch: Partial<Settings>) =>
      settingsStore.setValue((prev) => ({ ...DEFAULT_SETTINGS, ...prev, ...patch })),
    [settingsStore],
  )
  const setEngine = useCallback(
    (engine: ProxyEngineId) => updateSettings({ engine }),
    [updateSettings],
  )

  // Clear history on exit if requested.
  const clearOnExitRef = useRef(settings.clearOnExit)
  clearOnExitRef.current = settings.clearOnExit
  useEffect(() => {
    const handler = () => {
      if (clearOnExitRef.current) {
        try {
          window.localStorage.removeItem('qs.history')
        } catch {
          /* ignore */
        }
      }
    }
    window.addEventListener('beforeunload', handler)
    return () => window.removeEventListener('beforeunload', handler)
  }, [])

  const value: BrowserContextValue = {
    tabs,
    activeTab,
    activeTabId,
    history: historyStore.value,
    bookmarks: bookmarkStore.value,
    settings,
    panel,
    hydrated,
    createTab,
    closeTab,
    selectTab,
    navigate,
    goBack,
    goForward,
    reload,
    stop,
    goHome,
    setTabLoading,
    setTabTitle,
    reportNavigation,
    canGoBack: activeTab.historyIndex > 0,
    canGoForward: activeTab.historyIndex < activeTab.history.length - 1,
    reloadNonce,
    toggleBookmark,
    removeBookmark,
    isBookmarked,
    removeHistoryItem,
    clearHistory,
    updateSettings,
    setEngine,
    setPanel,
  }

  return <BrowserContext.Provider value={value}>{children}</BrowserContext.Provider>
}

export function useBrowser() {
  const ctx = useContext(BrowserContext)
  if (!ctx) throw new Error('useBrowser must be used within BrowserProvider')
  return ctx
}
