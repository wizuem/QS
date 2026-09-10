'use client'

import { cn } from '@/lib/utils'
import { SEARCH_ENGINES } from '@/lib/search-engines'
import { PROXY_ENGINE_LIST } from '@/lib/proxy'
import { useBrowser } from '../browser-provider'
import type { ProxyEngineId } from '@/lib/types'

const AI_MODELS = [
  { id: 'openai/gpt-4.1-mini', label: 'GPT-4.1 mini (fast)' },
  { id: 'openai/gpt-4.1', label: 'GPT-4.1' },
  { id: 'anthropic/claude-haiku-4.5', label: 'Claude Haiku 4.5' },
  { id: 'google/gemini-2.5-flash', label: 'Gemini 2.5 Flash' },
]

function Toggle({
  checked,
  onChange,
  label,
  description,
}: {
  checked: boolean
  onChange: (v: boolean) => void
  label: string
  description: string
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className="flex w-full items-center justify-between gap-3 rounded-lg px-1 py-2 text-left"
    >
      <span className="min-w-0">
        <span className="block text-sm font-medium">{label}</span>
        <span className="block text-xs text-muted-foreground">{description}</span>
      </span>
      <span
        className={cn(
          'relative h-6 w-10 shrink-0 rounded-full transition-colors',
          checked ? 'quantum-gradient' : 'bg-secondary',
        )}
      >
        <span
          className={cn(
            'absolute top-0.5 size-5 rounded-full bg-white shadow transition-transform',
            checked ? 'translate-x-[18px]' : 'translate-x-0.5',
          )}
        />
      </span>
    </button>
  )
}

function Section({
  title,
  children,
}: {
  title: string
  children: React.ReactNode
}) {
  return (
    <section className="mb-6">
      <h3 className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
        {title}
      </h3>
      <div className="rounded-xl border border-border bg-card/50 p-2">{children}</div>
    </section>
  )
}

export function SettingsPanel() {
  const { settings, updateSettings, setEngine, clearHistory } = useBrowser()

  return (
    <div className="h-full overflow-y-auto px-3 pb-6">
      <Section title="Proxy Engine">
        <div className="flex flex-col gap-1">
          {PROXY_ENGINE_LIST.map((engine) => {
            const active = engine.id === settings.engine
            return (
              <button
                key={engine.id}
                type="button"
                onClick={() => setEngine(engine.id)}
                className={cn(
                  'flex items-start gap-2.5 rounded-lg p-2 text-left transition-colors',
                  active ? 'bg-secondary' : 'hover:bg-secondary/60',
                )}
              >
                <span className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-lg quantum-gradient text-[11px] font-bold text-white">
                  {engine.short}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="flex items-center gap-2 text-sm font-medium">
                    {engine.name}
                    {active && (
                      <span className="rounded-full bg-primary/20 px-1.5 py-0.5 text-[10px] font-semibold text-primary">
                        ACTIVE
                      </span>
                    )}
                  </span>
                  <span className="mt-0.5 block text-xs leading-snug text-muted-foreground">
                    {engine.description}
                  </span>
                </span>
              </button>
            )
          })}
        </div>
      </Section>

      <Section title="Self-hosted proxy servers (optional)">
        <p className="px-1 pb-2 text-xs leading-snug text-muted-foreground">
          Leave blank to use the built-in proxy. Point an engine at your own
          server for full compatibility with heavy sites.
        </p>
        {PROXY_ENGINE_LIST.map((engine) => (
          <div key={engine.id} className="px-1 py-1.5">
            <label className="mb-1 block text-xs font-medium text-muted-foreground">
              {engine.name} server URL
            </label>
            <input
              value={settings.proxyServers[engine.id as ProxyEngineId]}
              onChange={(e) =>
                updateSettings({
                  proxyServers: {
                    ...settings.proxyServers,
                    [engine.id]: e.target.value,
                  },
                })
              }
              placeholder={`https://your-${engine.id}-server.example`}
              spellCheck={false}
              className="h-9 w-full rounded-lg border border-border bg-secondary/50 px-3 text-sm outline-none focus:border-ring"
            />
          </div>
        ))}
      </Section>

      <Section title="Search Engine">
        <div className="grid grid-cols-2 gap-2">
          {SEARCH_ENGINES.map((s) => {
            const active = s.id === settings.searchEngineId
            return (
              <button
                key={s.id}
                type="button"
                onClick={() => updateSettings({ searchEngineId: s.id })}
                className={cn(
                  'rounded-lg border p-2.5 text-left transition-colors',
                  active
                    ? 'border-primary/60 bg-primary/10'
                    : 'border-border bg-secondary/40 hover:bg-secondary',
                )}
              >
                <span className="block text-sm font-medium">{s.name}</span>
                <span className="block text-[11px] text-muted-foreground">
                  {s.note}
                </span>
              </button>
            )
          })}
        </div>
      </Section>

      <Section title="AI Model">
        <div className="flex flex-col gap-1">
          {AI_MODELS.map((m) => (
            <button
              key={m.id}
              type="button"
              onClick={() => updateSettings({ aiModel: m.id })}
              className={cn(
                'flex items-center justify-between rounded-lg px-2 py-2 text-sm transition-colors',
                m.id === settings.aiModel
                  ? 'bg-secondary font-medium'
                  : 'hover:bg-secondary/60',
              )}
            >
              {m.label}
              {m.id === settings.aiModel && (
                <span className="size-2 rounded-full quantum-gradient" />
              )}
            </button>
          ))}
        </div>
      </Section>

      <Section title="Privacy & Data">
        <Toggle
          checked={settings.saveHistory}
          onChange={(v) => updateSettings({ saveHistory: v })}
          label="Save browsing history"
          description="Store visited pages on this device"
        />
        <Toggle
          checked={settings.clearOnExit}
          onChange={(v) => updateSettings({ clearOnExit: v })}
          label="Clear history on exit"
          description="Wipe history when you close the browser"
        />
        <Toggle
          checked={settings.blockAds}
          onChange={(v) => updateSettings({ blockAds: v })}
          label="Block ads & trackers"
          description="Filter known ad and tracker domains"
        />
        <Toggle
          checked={settings.doNotTrack}
          onChange={(v) => updateSettings({ doNotTrack: v })}
          label="Send Do Not Track"
          description="Ask sites not to track you"
        />
        <button
          type="button"
          onClick={clearHistory}
          className="mt-2 w-full rounded-lg bg-destructive/10 px-3 py-2 text-sm font-medium text-destructive transition-colors hover:bg-destructive/20"
        >
          Clear all browsing history
        </button>
      </Section>

      <p className="px-1 text-center text-[11px] leading-relaxed text-muted-foreground">
        Quantum Services routes traffic through your selected proxy engine.
        History, bookmarks and settings are stored only on this device.
      </p>
    </div>
  )
}
