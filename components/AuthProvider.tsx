'use client'

import { useAuth } from '@/hooks/useAuth'
import { ReactNode } from 'react'

interface AuthProviderProps {
  children: ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const { isAuthenticated, isLoading } = useAuth()

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="w-16 h-16 bg-primary flex items-center justify-center mx-auto rounded">
            <span className="text-white text-2xl font-bold">A</span>
          </div>
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mt-4"></div>
          <p className="text-muted-foreground mt-4">
            Connecting to AIDEN Platform...
          </p>
        </div>
      </div>
    )
  }

  if (isAuthenticated === false) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="w-16 h-16 bg-primary flex items-center justify-center mx-auto rounded">
            <span className="text-white text-2xl font-bold">A</span>
          </div>
          <p className="text-muted-foreground mt-4">
            Redirecting to AIDEN Platform login...
          </p>
        </div>
      </div>
    )
  }

  return <>{children}</>
}
