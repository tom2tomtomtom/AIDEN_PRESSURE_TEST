'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export function HubLink() {
  const [loading, setLoading] = useState(false)

  const handleClick = async () => {
    setLoading(true)

    try {
      const supabase = createClient()
      const { data: { session } } = await supabase.auth.getSession()

      if (session?.access_token) {
        // Pass tokens to Gateway's auth callback
        const callbackUrl = new URL('/auth/callback', 'https://aiden.services')
        callbackUrl.searchParams.set('studio_token', session.access_token)
        if (session.refresh_token) {
          callbackUrl.searchParams.set('refresh_token', session.refresh_token)
        }
        window.location.href = callbackUrl.toString()
      } else {
        // No session, go directly (will redirect to login)
        window.location.href = 'https://aiden.services/dashboard'
      }
    } catch (error) {
      console.error('Hub navigation error:', error)
      window.location.href = 'https://aiden.services/dashboard'
    }
  }

  return (
    <button
      onClick={handleClick}
      disabled={loading}
      className="text-orange-500 hover:text-orange-400 text-sm font-medium transition-colors disabled:opacity-50"
    >
      {loading ? '...' : '← AIDEN Hub'}
    </button>
  )
}
