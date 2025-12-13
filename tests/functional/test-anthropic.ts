/**
 * Quick test to verify Anthropic API connectivity
 */

import Anthropic from '@anthropic-ai/sdk'

async function testAnthropicConnection() {
  console.log('Testing Anthropic API connection...')
  console.log('API Key (first 10 chars):', process.env.ANTHROPIC_API_KEY?.slice(0, 10) + '...')

  try {
    const anthropic = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY!,
    })

    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 100,
      messages: [
        { role: 'user', content: 'Say "Hello, API is working!" and nothing else.' }
      ]
    })

    console.log('✅ API Response:', response.content[0])
    console.log('Model:', response.model)
    console.log('Usage:', response.usage)
  } catch (error: any) {
    console.error('❌ API Error:', error.message)
    console.error('Status:', error.status)
    console.error('Error type:', error.constructor.name)
  }
}

testAnthropicConnection()
