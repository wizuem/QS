'use client'

import { BrowserProvider } from './browser-provider'
import { TabStrip } from './tab-strip'
import { Toolbar } from './toolbar'
import { BrowserFrame } from './browser-frame'
import { SidePanel } from './side-panel'

export function QuantumBrowser() {
  return (
    <BrowserProvider>
      <div className="flex h-dvh flex-col overflow-hidden bg-background text-foreground">
        <div className="shrink-0 border-b border-border bg-background/60">
          <TabStrip />
          <Toolbar />
        </div>
        <div className="flex min-h-0 flex-1">
          <main className="min-w-0 flex-1 overflow-hidden">
            <BrowserFrame />
          </main>
          <SidePanel />
        </div>
      </div>
    </BrowserProvider>
  )
}
