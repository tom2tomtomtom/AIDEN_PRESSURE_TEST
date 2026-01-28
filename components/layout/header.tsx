import Link from 'next/link'
import { UserMenu } from './user-menu'
import { MobileSidebar } from './mobile-sidebar'

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
          <Link href="/dashboard" className="flex items-center gap-2">
            <span className="text-xl font-bold text-red-hot uppercase tracking-tight">AIDEN's</span>
            <span className="hidden sm:inline text-white-muted font-normal uppercase tracking-wide text-sm">Focus Group</span>
          </Link>
        </div>
        <div className="ml-auto flex items-center gap-4">
          <a
            href="https://gateway.aiden.services/dashboard"
            className="text-orange-500 hover:text-orange-400 text-sm font-medium transition-colors"
          >
            AIDEN Hub
          </a>
          <UserMenu user={user} />
        </div>
      </div>
    </header>
  )
}
