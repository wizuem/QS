export type ProxyEngineId = 'scramjet' | 'ultraviolet' | 'rammerhead'

export interface Tab {
  id: string
  title: string
  url: string // the "address bar" url, empty string means the start page
  favicon?: string
  loading: boolean
  history: string[] // navigation stack of urls for this tab
  historyIndex: number
}

export interface HistoryItem {
  id: string
  url: string
  title: string
  visitedAt: number
}

export interface Bookmark {
  id: string
  url: string
  title: string
  createdAt: number
}

export interface Settings {
  engine: ProxyEngineId
  searchEngineId: string
  // Optional self-hosted proxy server base URLs per engine.
  proxyServers: Record<ProxyEngineId, string>
  // Privacy
  saveHistory: boolean
  blockAds: boolean
  doNotTrack: boolean
  clearOnExit: boolean
  aiModel: string
}
