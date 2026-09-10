'use client'

import { useCallback, useEffect, useState } from 'react'

/**
 * Persist local browser state (history, bookmarks, settings) the way a real
 * browser does: on the client device only. This is intentional local state,
 * not shared application data.
 */
export function useLocalStorage<T>(key: string, initial: T) {
  const [value, setValue] = useState<T>(initial)
  const [hydrated, setHydrated] = useState(false)

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(key)
      if (raw !== null) setValue(JSON.parse(raw) as T)
    } catch {
      // ignore malformed storage
    }
    setHydrated(true)
  }, [key])

  useEffect(() => {
    if (!hydrated) return
    try {
      window.localStorage.setItem(key, JSON.stringify(value))
    } catch {
      // storage full or unavailable
    }
  }, [key, value, hydrated])

  const reset = useCallback(() => setValue(initial), [initial])

  return { value, setValue, hydrated, reset }
}
