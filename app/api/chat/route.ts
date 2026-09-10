import { streamText, type ModelMessage } from 'ai'

export const maxDuration = 30

const ALLOWED_MODELS = new Set([
  'openai/gpt-4.1-mini',
  'openai/gpt-4.1',
  'openai/gpt-4o-mini',
  'anthropic/claude-haiku-4.5',
  'google/gemini-2.5-flash',
])

export async function POST(req: Request) {
  const body = await req.json().catch(() => null)
  if (!body || !Array.isArray(body.messages)) {
    return new Response('Invalid request', { status: 400 })
  }

  const model: string = ALLOWED_MODELS.has(body.model)
    ? body.model
    : 'openai/gpt-4.1-mini'

  const messages = body.messages as ModelMessage[]
  const context: string | undefined = body.pageUrl

  const result = streamText({
    model,
    system:
      'You are the built-in AI assistant inside the Quantum Services proxy browser. ' +
      'Be concise, helpful and privacy-respecting. You can summarize pages, explain ' +
      'concepts, help with searches, and answer questions. When the user is browsing a ' +
      'page, use its URL for context if provided.' +
      (context ? ` The user is currently viewing: ${context}` : ''),
    messages,
  })

  return result.toTextStreamResponse()
}
