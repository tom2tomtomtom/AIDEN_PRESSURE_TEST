'use client'

import { useRouter } from 'next/navigation'
import { createAuthClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'

interface SignOutButtonProps {
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link'
  size?: 'default' | 'sm' | 'lg' | 'icon'
  className?: string
}

export function SignOutButton({ variant = 'ghost', size = 'default', className }: SignOutButtonProps) {
  const router = useRouter()

  async function handleSignOut() {
    const supabase = createAuthClient()
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  return (
    <Button variant={variant} size={size} className={className} onClick={handleSignOut}>
      Sign Out
    </Button>
  )
}
