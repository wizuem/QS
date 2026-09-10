import { streamText, type ModelMessage, type LanguageModel } from 'ai'
import { createOpenAI } from '@ai-sdk/openai'

export const maxDuration = 30

// Gateway IDs (provider/model) used when routing through the Vercel AI Gateway.
const ALLOWED_MODELS = new Set([
  'openai/gpt-4.1-mini',
  'openai/gpt-4.1',
  'openai/gpt-4o-mini',
  'anthropic/claude-haiku-4.5',
  'google/gemini-2.5-flash',
])

// Map a gateway-style id to a bare OpenAI model id for direct-key usage.
// Non-OpenAI selections fall back to a sensible OpenAI default.
function toOpenAIModel(gatewayId: string): string {
  if (gatewayId.startsWith('openai/')) return gatewayId.slice('openai/'.length)
  return 'gpt-4o-mini'
}

export async function POST(req: Request) {
  const body = await req.json().catch(() => null)
  if (!body || !Array.isArray(body.messages)) {
    return new Response('Invalid request', { status: 400 })
  }

  const selected: string = ALLOWED_MODELS.has(body.model)
    ? body.model
    : 'openai/gpt-4.1-mini'

  const messages = body.messages as ModelMessage[]
  const context: string | undefined = body.pageUrl

  // Prefer a user-supplied OpenAI key; otherwise route through the AI Gateway
  // (a plain "provider/model" string lets the SDK resolve the Gateway).
  const openaiKey = process.env.OPENAI_API_KEY
  let model: LanguageModel
  if (openaiKey) {
    const openai = createOpenAI({ apiKey: openaiKey })
    model = openai(toOpenAIModel(selected))
  } else {
    model = selected
  }

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
