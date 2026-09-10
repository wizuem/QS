'use client'

import { useEffect, useRef, useState } from 'react'
import { Loader2, Send, Sparkles } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useBrowser } from '../browser-provider'

interface Message {
  role: 'user' | 'assistant'
  content: string
}

const SUGGESTIONS = [
  'Summarize the page I\u2019m on',
  'Explain quantum entanglement simply',
  'Find privacy-friendly alternatives to Google',
]

export function AiPanel() {
  const { activeTab, settings } = useBrowser()
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [streaming, setStreaming] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)
  const abortRef = useRef<AbortController | null>(null)

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight })
  }, [messages, streaming])

  async function send(text: string) {
    const content = text.trim()
    if (!content || streaming) return
    const next = [...messages, { role: 'user' as const, content }]
    setMessages([...next, { role: 'assistant', content: '' }])
    setInput('')
    setStreaming(true)

    const controller = new AbortController()
    abortRef.current = controller

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        signal: controller.signal,
        body: JSON.stringify({
          messages: next,
          model: settings.aiModel,
          pageUrl: activeTab.url || undefined,
        }),
      })

      if (!res.ok || !res.body) {
        throw new Error(`Request failed (${res.status})`)
      }

      const reader = res.body.getReader()
      const decoder = new TextDecoder()
      let acc = ''
      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        acc += decoder.decode(value, { stream: true })
        setMessages((prev) => {
          const copy = [...prev]
          copy[copy.length - 1] = { role: 'assistant', content: acc }
          return copy
        })
      }
      if (!acc.trim()) {
        setMessages((prev) => {
          const copy = [...prev]
          copy[copy.length - 1] = {
            role: 'assistant',
            content:
              'The AI service returned no response. Add an OPENAI_API_KEY environment variable to use your own OpenAI account, or enable billing on the Vercel AI Gateway. Once either is set up, the assistant will work here and in your deployment.',
          }
          return copy
        })
      }
    } catch (err) {
      if ((err as Error).name !== 'AbortError') {
        setMessages((prev) => {
          const copy = [...prev]
          copy[copy.length - 1] = {
            role: 'assistant',
            content:
              'Sorry, I couldn\u2019t reach the AI service. Make sure the AI Gateway is available and try again.',
          }
          return copy
        })
      }
    } finally {
      setStreaming(false)
      abortRef.current = null
    }
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.nativeEvent.isComposing || e.keyCode === 229) return
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      send(input)
    }
  }

  return (
    <div className="flex h-full flex-col">
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-3 pb-3">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center gap-4 px-2 py-10 text-center">
            <span className="flex size-12 items-center justify-center rounded-2xl quantum-gradient">
              <Sparkles className="size-6 text-white" />
            </span>
            <div>
              <p className="text-sm font-medium">Quantum AI</p>
              <p className="mt-1 text-xs text-muted-foreground text-balance">
                Ask anything, summarize pages, or get help browsing. Runs on{' '}
                {settings.aiModel}.
              </p>
            </div>
            <div className="flex w-full flex-col gap-2">
              {SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => send(s)}
                  className="rounded-lg border border-border bg-secondary/40 px-3 py-2 text-left text-xs text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-3 py-2">
            {messages.map((m, i) => (
              <div
                key={i}
                className={cn(
                  'flex',
                  m.role === 'user' ? 'justify-end' : 'justify-start',
                )}
              >
                <div
                  className={cn(
                    'max-w-[85%] whitespace-pre-wrap rounded-2xl px-3 py-2 text-sm leading-relaxed',
                    m.role === 'user'
                      ? 'quantum-gradient text-white'
                      : 'bg-secondary text-foreground',
                  )}
                >
                  {m.content ||
                    (streaming && i === messages.length - 1 ? (
                      <Loader2 className="size-4 animate-spin" />
                    ) : (
                      ''
                    ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="border-t border-border p-3">
        <div className="flex items-end gap-2 rounded-xl border border-border bg-secondary/50 p-2 focus-within:border-ring">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={onKeyDown}
            rows={1}
            placeholder="Ask Quantum AI..."
            className="max-h-32 min-h-[24px] flex-1 resize-none bg-transparent text-sm outline-none placeholder:text-muted-foreground"
          />
          <button
            type="button"
            onClick={() => send(input)}
            disabled={!input.trim() || streaming}
            aria-label="Send"
            className="flex size-8 shrink-0 items-center justify-center rounded-lg quantum-gradient text-white transition-opacity hover:opacity-90 disabled:opacity-40"
          >
            {streaming ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Send className="size-4" />
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
