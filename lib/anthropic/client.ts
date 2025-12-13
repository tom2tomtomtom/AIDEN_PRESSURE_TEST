import Anthropic from '@anthropic-ai/sdk'

export const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

export const TEMPERATURES = {
  personaResponse: 0.7,
  groupDynamics: 0.6,
  aggregatedAnalysis: 0.3,
  jsonExtraction: 0.2,
} as const

