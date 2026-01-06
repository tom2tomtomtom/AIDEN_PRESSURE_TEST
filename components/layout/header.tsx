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
    <header className="sticky top-0 z-50 w-full border-b-2 border-primary bg-black">
      <div className="flex h-14 items-center px-4 md:px-6">
        <MobileSidebar />
        <div className="flex items-center gap-2">
          <Link href="/dashboard" className="flex items-center gap-2 font-bold uppercase tracking-wider">
            <span className="text-lg text-primary">Phantom</span>
            <span className="hidden sm:inline text-white font-bold">Pressure Test</span>
          </Link>
        </div>
        <div className="ml-auto flex items-center gap-4">
          <UserMenu user={user} />
        </div>
      </div>
    </header>
  )
}
