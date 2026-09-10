'use client'

import { useEffect, useMemo, useRef } from 'react'
import { Loader2 } from 'lucide-react'
import { PROXY_ENGINES } from '@/lib/proxy'
import { useBrowser } from './browser-provider'
import { StartPage } from './start-page'

export function BrowserFrame() {
  const {
    activeTab,
    activeTabId,
    settings,
    reloadNonce,
    setTabLoading,
    reportNavigation,
  } = useBrowser()
  const iframeRef = useRef<HTMLIFrameElement>(null)

  const src = useMemo(() => {
    if (!activeTab.url) return ''
    const engine = PROXY_ENGINES[settings.engine]
    const serverBase = settings.proxyServers[settings.engine] ?? ''
    return engine.buildUrl(activeTab.url, serverBase)
  }, [activeTab.url, settings.engine, settings.proxyServers])

  // Listen for navigation reports posted by our built-in proxy injection.
  useEffect(() => {
    function onMessage(e: MessageEvent) {
      const data = e.data
      if (!data || data.__qs !== true) return
      if (data.type === 'location' && typeof data.url === 'string') {
        reportNavigation(activeTabId, data.url, data.title ?? '')
      }
    }
    window.addEventListener('message', onMessage)
    return () => window.removeEventListener('message', onMessage)
  }, [activeTabId, reportNavigation])

  if (!activeTab.url) {
    return <StartPage />
  }

  return (
    <div className="relative h-full w-full bg-white">
      {activeTab.loading && (
        <div className="pointer-events-none absolute inset-x-0 top-0 z-10 h-0.5 overflow-hidden">
          <div className="h-full w-1/3 animate-[loading_1.1s_ease-in-out_infinite] quantum-gradient" />
        </div>
      )}
      {activeTab.loading && (
        <div className="absolute left-1/2 top-4 z-10 flex -translate-x-1/2 items-center gap-2 rounded-full bg-card/90 px-3 py-1.5 text-xs text-muted-foreground shadow-lg backdrop-blur">
          <Loader2 className="size-3.5 animate-spin text-primary" />
          Loading via {PROXY_ENGINES[settings.engine].name}
        </div>
      )}
      <iframe
        ref={iframeRef}
        key={`${activeTabId}-${reloadNonce}`}
        src={src}
        title={activeTab.title}
        onLoad={() => setTabLoading(activeTabId, false)}
        className="h-full w-full border-0"
        sandbox="allow-forms allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox allow-downloads"
        referrerPolicy="no-referrer"
      />
      <style>{`@keyframes loading{0%{transform:translateX(-100%)}100%{transform:translateX(400%)}}`}</style>
    </div>
  )
}
