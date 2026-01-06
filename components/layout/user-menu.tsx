'use client'

import { useRouter } from 'next/navigation'
import { createAuthClient } from '@/lib/supabase/client'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'

interface UserMenuProps {
  user: {
    email?: string | null
  } | null
}

export function UserMenu({ user }: UserMenuProps) {
  const router = useRouter()

  async function handleSignOut() {
    const supabase = createAuthClient()
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  const initials = user?.email
    ? user.email.slice(0, 2).toUpperCase()
    : '??'

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-10 w-10 border-2 border-primary">
          <Avatar className="h-8 w-8">
            <AvatarFallback className="bg-primary text-primary-foreground font-bold">{initials}</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56 border-2 border-primary bg-black" align="end" forceMount>
        <DropdownMenuLabel className="font-bold uppercase tracking-wider text-primary">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-bold leading-none">Account</p>
            <p className="text-xs leading-none text-muted-foreground font-normal normal-case">
              {user?.email}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator className="bg-border" />
        <DropdownMenuItem onClick={handleSignOut} className="cursor-pointer font-bold uppercase tracking-wider hover:bg-primary hover:text-primary-foreground">
          Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
