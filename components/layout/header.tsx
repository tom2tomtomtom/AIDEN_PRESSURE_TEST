import Link from 'next/link'
import { UserMenu } from './user-menu'
import { MobileSidebar } from './mobile-sidebar'
import { AidenLogo } from '@/components/ui/aiden-logo'

interface HeaderProps {
  user: {
    email?: string | null
  } | null
}

export function Header({ user }: HeaderProps) {
  return (
    <header className="sticky top-0 z-50 w-full border-b-2 border-red-hot bg-black-ink">
      <div className="flex h-14 items-center px-4 md:px-6">
        <MobileSidebar />
        <div className="flex items-center gap-2">
          <Link href="/dashboard" className="flex items-center gap-1">
            <AidenLogo size="md" />
            <span className="aiden-app-name text-xl text-white-dim">.Test</span>
          </Link>
        </div>
        <div className="ml-auto flex items-center gap-4">
          <a
            href="https://www.aiden.services/dashboard"
            className="text-sm text-orange-500 hover:text-orange-400 transition-colors flex items-center gap-1.5"
          >
            <span>←</span>
            <span className="flex items-center gap-1"><AidenLogo size="sm" /><span className="aiden-app-name">.Hub</span></span>
          </a>
          <UserMenu user={user} />
        </div>
      </div>
    </header>
  )
}
