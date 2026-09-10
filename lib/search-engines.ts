export interface SearchEngine {
  id: string
  name: string
  /** Query template, {q} is replaced with the encoded query. */
  template: string
  /** A short privacy note shown in settings. */
  note: string
}

export const SEARCH_ENGINES: SearchEngine[] = [
  {
    id: 'duckduckgo',
    name: 'DuckDuckGo',
    template: 'https://duckduckgo.com/?q={q}',
    note: 'Private, no tracking',
  },
  {
    id: 'brave',
    name: 'Brave Search',
    template: 'https://search.brave.com/search?q={q}',
    note: 'Independent index, privacy focused',
  },
  {
    id: 'startpage',
    name: 'Startpage',
    template: 'https://www.startpage.com/sp/search?query={q}',
    note: 'Google results without tracking',
  },
  {
    id: 'google',
    name: 'Google',
    template: 'https://www.google.com/search?q={q}',
    note: 'Largest index',
  },
  {
    id: 'bing',
    name: 'Bing',
    template: 'https://www.bing.com/search?q={q}',
    note: 'Microsoft search',
  },
  {
    id: 'ecosia',
    name: 'Ecosia',
    template: 'https://www.ecosia.org/search?q={q}',
    note: 'Plants trees with ad revenue',
  },
]

export function getSearchEngine(id: string): SearchEngine {
  return SEARCH_ENGINES.find((e) => e.id === id) ?? SEARCH_ENGINES[0]
}

const DOMAIN_RE = /^([a-z0-9-]+\.)+[a-z]{2}[a-z.]*(\/.*)?$/i

/**
 * Turn arbitrary address-bar input into a real URL.
 * - Full URLs are used as-is.
 * - Bare domains (example.com) get https:// prefixed.
 * - Everything else becomes a search query for the chosen engine.
 */
export function resolveInput(input: string, searchEngineId: string): string {
  const value = input.trim()
  if (!value) return ''

  if (/^https?:\/\//i.test(value)) return value
  if (/^about:/i.test(value)) return value

  const looksLikeDomain = !value.includes(' ') && DOMAIN_RE.test(value)
  if (looksLikeDomain) return `https://${value}`

  const engine = getSearchEngine(searchEngineId)
  return engine.template.replace('{q}', encodeURIComponent(value))
}
