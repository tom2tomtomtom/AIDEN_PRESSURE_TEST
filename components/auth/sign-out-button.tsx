'use client'

import { Button } from '@/components/ui/button'

const GATEWAY_URL = process.env.NEXT_PUBLIC_GATEWAY_URL || 'https://www.aiden.services'

interface SignOutButtonProps {
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link'
  size?: 'default' | 'sm' | 'lg' | 'icon'
  className?: string
}

export function SignOutButton({ variant = 'ghost', size = 'default', className }: SignOutButtonProps) {
  function handleSignOut() {
    window.location.href = `${GATEWAY_URL}/auth/logout`
  }

  return (
    <Button variant={variant} size={size} className={className} onClick={handleSignOut}>
      Sign Out
    </Button>
  )
}
