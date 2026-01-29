'use client'

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'

const GATEWAY_URL = process.env.NEXT_PUBLIC_GATEWAY_URL || 'https://aiden.services'

interface UserMenuProps {
  user: {
    email?: string | null
  } | null
}

export function UserMenu({ user }: UserMenuProps) {
  function handleSignOut() {
    // Clear the session cookie and redirect to gateway logout
    document.cookie = 'aiden_session=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT'
    window.location.href = `${GATEWAY_URL}/logout`
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-10 px-4 border-2 border-red-hot gap-2">
          <span className="text-white-full text-sm font-medium truncate max-w-[150px]">
            {user?.email?.split('@')[0] || 'User'}
          </span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56 border-2 border-red-hot bg-black-card" align="end" forceMount>
        <DropdownMenuLabel className="font-bold uppercase tracking-wider text-red-hot">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-bold leading-none">Account</p>
            <p className="text-xs leading-none text-white-muted font-normal normal-case">
              {user?.email}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator className="bg-border-subtle" />
        <DropdownMenuItem onClick={handleSignOut} className="cursor-pointer font-bold uppercase tracking-wider hover:bg-red-hot hover:text-white">
          Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
