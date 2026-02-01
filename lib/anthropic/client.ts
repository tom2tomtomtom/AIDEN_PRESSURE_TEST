/**
 * Claude API Client
 * Wrapper for Anthropic API with retry logic and JSON parsing
 */

import Anthropic from '@anthropic-ai/sdk'

// Lazy-initialized client (to allow env vars to be loaded first)
let _anthropic: Anthropic | null = null

function getClient(): Anthropic {
  if (!_anthropic) {
    if (!process.env.ANTHROPIC_API_KEY) {
      throw new Error('ANTHROPIC_API_KEY environment variable is not set')
    }
    _anthropic = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    })
  }
  return _anthropic
}

// Export getter for direct access if needed
export const anthropic = { get client() { return getClient() } }

// Temperature presets for different tasks
export const TEMPERATURES = {
  personaResponse: 0.7,    // More creative for natural responses
  groupDynamics: 0.6,      // Balanced for group simulation
  aggregatedAnalysis: 0.3, // More deterministic for scoring
  jsonExtraction: 0.2,     // Very deterministic for parsing
} as const

// Default model for persona responses
export const DEFAULT_MODEL = 'claude-sonnet-4-20250514'

// Retry configuration
const MAX_RETRIES = 3
const BASE_DELAY_MS = 1000
const MAX_DELAY_MS = 10000

export interface CompletionOptions {
  model?: string
  maxTokens?: number
  temperature?: number
  system?: string
  stopSequences?: string[]
}

export interface CompletionResult {
  content: string
  usage: {
    inputTokens: number
    outputTokens: number
    totalTokens: number
  }
  model: string
  stopReason: string | null
}

export interface JSONCompletionResult<T> extends CompletionResult {
  parsed: T
}

/**
 * Sleep helper for retry delays
 */
function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

/**
 * Calculate exponential backoff delay
 */
function getRetryDelay(attempt: number): number {
  const delay = BASE_DELAY_MS * Math.pow(2, attempt)
  const jitter = Math.random() * 1000
  return Math.min(delay + jitter, MAX_DELAY_MS)
}

/**
 * Check if error is retryable
 */
function isRetryableError(error: unknown): boolean {
  if (error instanceof Anthropic.RateLimitError) return true
  if (error instanceof Anthropic.APIConnectionError) return true
  if (error instanceof Anthropic.InternalServerError) return true

  // Check for specific status codes
  if (error instanceof Anthropic.APIError) {
    const status = error.status
    return status === 429 || status === 500 || status === 502 || status === 503 || status === 504
  }

  return false
}

/**
 * Make a completion request with retry logic
 */
export async function complete(
  prompt: string,
  options: CompletionOptions = {}
): Promise<CompletionResult> {
  const {
    model = DEFAULT_MODEL,
    maxTokens = 2048,
    temperature = 0.3,
    system,
    stopSequences
  } = options

  let lastError: Error | null = null

  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    try {
      const response = await getClient().messages.create({
        model,
        max_tokens: maxTokens,
        temperature,
        system: system || undefined,
        messages: [{ role: 'user', content: prompt }],
        stop_sequences: stopSequences
      })

      // Extract text content
      const textBlock = response.content.find(block => block.type === 'text')
      const content = textBlock?.type === 'text' ? textBlock.text : ''

      return {
        content,
        usage: {
          inputTokens: response.usage.input_tokens,
          outputTokens: response.usage.output_tokens,
          totalTokens: response.usage.input_tokens + response.usage.output_tokens
        },
        model: response.model,
        stopReason: response.stop_reason
      }
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error))

      if (!isRetryableError(error) || attempt === MAX_RETRIES) {
        throw lastError
      }

      const delay = getRetryDelay(attempt)
      console.warn(
        `Anthropic API error (attempt ${attempt + 1}/${MAX_RETRIES + 1}), retrying in ${delay}ms:`,
        lastError.message
      )
      await sleep(delay)
    }
  }

  throw lastError || new Error('Unknown error during completion')
}

/**
 * Make a completion request expecting JSON response
 * Parses and validates the response
 */
export async function completeJSON<T>(
  prompt: string,
  options: CompletionOptions = {}
): Promise<JSONCompletionResult<T>> {
  // Add JSON instruction to system prompt
  const jsonSystem = options.system
    ? `${options.system}\n\nIMPORTANT: Respond with valid JSON only. No markdown, no code fences, just raw JSON.`
    : 'Respond with valid JSON only. No markdown, no code fences, just raw JSON.'

  const result = await complete(prompt, {
    ...options,
    system: jsonSystem
  })

  // Attempt to parse JSON
  const parsed = parseJSONResponse<T>(result.content)

  return {
    ...result,
    parsed
  }
}

/**
 * Parse JSON from LLM response, handling common issues
 */
export function parseJSONResponse<T>(content: string): T {
  let cleanContent = content.trim()

  // Remove markdown code fences if present
  if (cleanContent.startsWith('```json')) {
    cleanContent = cleanContent.slice(7)
  } else if (cleanContent.startsWith('```')) {
    cleanContent = cleanContent.slice(3)
  }
  if (cleanContent.endsWith('```')) {
    cleanContent = cleanContent.slice(0, -3)
  }

  cleanContent = cleanContent.trim()

  // Try to find JSON object or array boundaries
  const jsonStart = cleanContent.indexOf('{')
  const arrayStart = cleanContent.indexOf('[')

  if (jsonStart === -1 && arrayStart === -1) {
    throw new Error('No JSON object or array found in response')
  }

  // Determine which comes first
  let startIndex: number
  let endChar: string

  if (jsonStart === -1) {
    startIndex = arrayStart
    endChar = ']'
  } else if (arrayStart === -1) {
    startIndex = jsonStart
    endChar = '}'
  } else {
    startIndex = Math.min(jsonStart, arrayStart)
    endChar = startIndex === jsonStart ? '}' : ']'
  }

  // Find matching end
  let depth = 0
  let endIndex = -1
  const startChar = endChar === '}' ? '{' : '['

  for (let i = startIndex; i < cleanContent.length; i++) {
    if (cleanContent[i] === startChar) depth++
    if (cleanContent[i] === endChar) depth--
    if (depth === 0) {
      endIndex = i + 1
      break
    }
  }

  if (endIndex === -1) {
    throw new Error('Malformed JSON: missing closing bracket')
  }

  const jsonString = cleanContent.slice(startIndex, endIndex)

  try {
    return JSON.parse(jsonString) as T
  } catch (error) {
    // Try to fix common JSON issues
    const fixed = fixCommonJSONIssues(jsonString)
    try {
      return JSON.parse(fixed) as T
    } catch {
      throw new Error(`Failed to parse JSON: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }
}

/**
 * Attempt to fix common JSON formatting issues
 */
function fixCommonJSONIssues(json: string): string {
  let fixed = json

  // Fix trailing commas
  fixed = fixed.replace(/,(\s*[}\]])/g, '$1')

  // Fix single quotes (convert to double)
  fixed = fixed.replace(/'/g, '"')

  // Fix unquoted keys
  fixed = fixed.replace(/([{,]\s*)(\w+)(\s*:)/g, '$1"$2"$3')

  return fixed
}

/**
 * Estimate token count for a string (rough approximation)
 * Use for pre-checking before API calls
 */
export function estimateTokens(text: string): number {
  // Rough estimate: ~4 characters per token for English
  return Math.ceil(text.length / 4)
}

/**
 * Create a streaming completion (for future use)
 */
export async function* completeStream(
  prompt: string,
  options: CompletionOptions = {}
): AsyncGenerator<string, CompletionResult, unknown> {
  const {
    model = DEFAULT_MODEL,
    maxTokens = 2048,
    temperature = 0.3,
    system
  } = options

  const stream = getClient().messages.stream({
    model,
    max_tokens: maxTokens,
    temperature,
    system: system || undefined,
    messages: [{ role: 'user', content: prompt }]
  })

  let fullContent = ''

  for await (const event of stream) {
    if (event.type === 'content_block_delta' && event.delta.type === 'text_delta') {
      fullContent += event.delta.text
      yield event.delta.text
    }
  }

  const finalMessage = await stream.finalMessage()

  return {
    content: fullContent,
    usage: {
      inputTokens: finalMessage.usage.input_tokens,
      outputTokens: finalMessage.usage.output_tokens,
      totalTokens: finalMessage.usage.input_tokens + finalMessage.usage.output_tokens
    },
    model: finalMessage.model,
    stopReason: finalMessage.stop_reason
  }
}
