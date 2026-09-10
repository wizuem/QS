import type { ProxyEngineId } from './types'

export interface ProxyEngine {
  id: ProxyEngineId
  name: string
  short: string
  description: string
  /**
   * Build the proxied URL that gets loaded in the browser frame.
   * If a self-hosted server base is configured we route through it using the
   * engine's URL scheme; otherwise we fall back to the built-in server proxy.
   */
  buildUrl: (target: string, serverBase: string) => string
}

/** Built-in server proxy route bundled with this app. */
function builtIn(target: string, engine: ProxyEngineId): string {
  return `/api/proxy?engine=${engine}&url=${encodeURIComponent(target)}`
}

export const PROXY_ENGINES: Record<ProxyEngineId, ProxyEngine> = {
  scramjet: {
    id: 'scramjet',
    name: 'Scramjet',
    short: 'SJ',
    description:
      'Modern service-worker interception proxy. Best compatibility with today\u2019s JavaScript-heavy sites.',
    buildUrl: (target, serverBase) => {
      if (!serverBase) return builtIn(target, 'scramjet')
      const base = serverBase.replace(/\/$/, '')
      return `${base}/scramjet/${encodeURIComponent(target)}`
    },
  },
  ultraviolet: {
    id: 'ultraviolet',
    name: 'Ultraviolet',
    short: 'UV',
    description:
      'Battle-tested proxy with strong encoding. A reliable all-rounder for most websites.',
    buildUrl: (target, serverBase) => {
      if (!serverBase) return builtIn(target, 'ultraviolet')
      const base = serverBase.replace(/\/$/, '')
      // Ultraviolet expects an xor/base-encoded path under /service/.
      return `${base}/service/${encodeURIComponent(target)}`
    },
  },
  rammerhead: {
    id: 'rammerhead',
    name: 'Rammerhead',
    short: 'RH',
    description:
      'Session-based proxy that mirrors a full browser. Great for sites that fight other proxies.',
    buildUrl: (target, serverBase) => {
      if (!serverBase) return builtIn(target, 'rammerhead')
      const base = serverBase.replace(/\/$/, '')
      return `${base}/?url=${encodeURIComponent(target)}`
    },
  },
}

export const PROXY_ENGINE_LIST = Object.values(PROXY_ENGINES)
