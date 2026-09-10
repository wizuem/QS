'use client'

import { useEffect, useRef, useState } from 'react'
import { Check, ChevronDown, Zap } from 'lucide-react'
import { cn } from '@/lib/utils'
import { PROXY_ENGINE_LIST } from '@/lib/proxy'
import { useBrowser } from './browser-provider'

export function EngineSwitcher({ variant = 'compact' }: { variant?: 'compact' | 'full' }) {
  const { settings, setEngine } = useBrowser()
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  const current = PROXY_ENGINE_LIST.find((e) => e.id === settings.engine)!

  useEffect(() => {
    if (!open) return
    function onDown(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('mousedown', onDown)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onDown)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="listbox"
        aria-expanded={open}
        className={cn(
          'flex items-center gap-1.5 rounded-full border border-border bg-secondary/60 px-2.5 py-1 text-xs font-medium transition-colors hover:bg-secondary',
          variant === 'full' && 'px-3 py-1.5 text-sm',
        )}
        title="Switch proxy engine"
      >
        <span className="flex size-4 items-center justify-center rounded-full quantum-gradient">
          <Zap className="size-2.5 text-white" />
        </span>
        <span>{current.name}</span>
        <ChevronDown className="size-3 opacity-60" />
      </button>

      {open && (
        <div
          role="listbox"
          className="absolute right-0 z-50 mt-2 w-72 overflow-hidden rounded-xl border border-border bg-popover p-1.5 shadow-2xl shadow-black/50"
        >
          <p className="px-2 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            Proxy Engine
          </p>
          {PROXY_ENGINE_LIST.map((engine) => {
            const active = engine.id === settings.engine
            return (
              <button
                key={engine.id}
                type="button"
                role="option"
                aria-selected={active}
                onClick={() => {
                  setEngine(engine.id)
                  setOpen(false)
                }}
                className={cn(
                  'flex w-full items-start gap-2.5 rounded-lg p-2 text-left transition-colors hover:bg-secondary',
                  active && 'bg-secondary',
                )}
              >
                <span className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-lg quantum-gradient text-[11px] font-bold text-white">
                  {engine.short}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="flex items-center gap-1.5">
                    <span className="text-sm font-medium">{engine.name}</span>
                    {active && <Check className="size-3.5 text-primary" />}
                  </span>
                  <span className="mt-0.5 block text-xs leading-snug text-muted-foreground">
                    {engine.description}
                  </span>
                </span>
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
