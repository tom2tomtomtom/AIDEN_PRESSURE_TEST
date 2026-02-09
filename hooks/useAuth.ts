'use client'

import { useEffect, useState } from 'react'

const TOKEN_KEY = 'aiden_auth_token'
const GATEWAY_URL = process.env.NEXT_PUBLIC_GATEWAY_URL || 'https://www.aiden.services'

export function useAuth() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Check for SSO tokens in URL (gateway passes these after login)
    const params = new URLSearchParams(window.location.search)
    const token = params.get('studio_token') || params.get('access_token')
    const refreshToken = params.get('refresh_token')

    if (token) {
      // Store tokens and clean URL
      localStorage.setItem(TOKEN_KEY, token)
      if (refreshToken) {
        localStorage.setItem('aiden_refresh_token', refreshToken)
      }
      window.history.replaceState({}, '', window.location.pathname)
      setIsAuthenticated(true)
      setIsLoading(false)
      return
    }

    // Check localStorage for existing token
    const storedToken = localStorage.getItem(TOKEN_KEY)
    if (storedToken) {
      setIsAuthenticated(true)
      setIsLoading(false)
      return
    }

    // No token - redirect to gateway
    setIsAuthenticated(false)
    setIsLoading(false)
    const returnUrl = window.location.href
    window.location.href = `${GATEWAY_URL}/login?next=${encodeURIComponent(returnUrl)}`
  }, [])

  const logout = () => {
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem('aiden_refresh_token')
    setIsAuthenticated(false)
    window.location.href = `${GATEWAY_URL}/login`
  }

  const getToken = () => localStorage.getItem(TOKEN_KEY)

  return { isAuthenticated, isLoading, logout, getToken }
}

export function getAuthToken(): string | null {
  if (typeof window === 'undefined') return null
  return localStorage.getItem(TOKEN_KEY)
}

export function isAuthenticated(): boolean {
  return Boolean(getAuthToken())
}
