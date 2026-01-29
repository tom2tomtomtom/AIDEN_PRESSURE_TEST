import { Header } from '@/components/layout/header'
import { Sidebar } from '@/components/layout/sidebar'

// Auth is handled by middleware - if we reach this layout, user is authenticated
// The aiden_session cookie contains the auth token

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Pass null for user - Header/Sidebar should handle gracefully
  // In future, could decode the aiden_session cookie to get user info if needed
  return (
    <div className="min-h-screen bg-background">
      <Header user={null} />
      <Sidebar />
      <main className="md:pl-64 pt-14">
        <div className="p-4 md:p-6 lg:p-8">
          {children}
        </div>
      </main>
    </div>
  )
}
