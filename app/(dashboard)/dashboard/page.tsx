import Link from 'next/link'
import { createAuthClient } from '@/lib/supabase/server'
import { createClient } from '@/lib/supabase/server'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default async function DashboardPage() {
  const authSupabase = await createAuthClient()
  const { data: { user } } = await authSupabase.auth.getUser()

  // Get projects count
  const supabase = await createClient()
  const { count: projectCount } = await supabase
    .from('projects')
    .select('*', { count: 'exact', head: true })

  const { count: testCount } = await supabase
    .from('pressure_tests')
    .select('*', { count: 'exact', head: true })

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-red-hot uppercase">Dashboard</h1>
        <p className="text-white-muted">
          Welcome back, {user?.email?.split('@')[0]}
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-orange-accent">Total Projects</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-hot">{projectCount ?? 0}</div>
            <p className="text-xs text-white-dim uppercase tracking-wide">Active research projects</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-orange-accent">Pressure Tests</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-hot">{testCount ?? 0}</div>
            <p className="text-xs text-white-dim uppercase tracking-wide">Tests run to date</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-orange-accent">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <Button asChild className="w-full">
              <Link href="/projects/new">New Project</Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-orange-accent">Getting Started</CardTitle>
          <CardDescription className="text-white-muted">
            AIDEN's Focus Group helps you validate marketing concepts against AI-powered consumer personas.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-start gap-4">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center bg-red-hot/10 text-red-hot font-bold border-2 border-red-hot">1</div>
            <div>
              <p className="font-medium text-white-full uppercase">Create a Project</p>
              <p className="text-sm text-white-dim">Set up your brand context and category</p>
            </div>
          </div>
          <div className="flex items-start gap-4">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center bg-red-hot/10 text-red-hot font-bold border-2 border-red-hot">2</div>
            <div>
              <p className="font-medium text-white-full uppercase">Configure Your Test</p>
              <p className="text-sm text-white-dim">Add your concept and select persona archetypes</p>
            </div>
          </div>
          <div className="flex items-start gap-4">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center bg-red-hot/10 text-red-hot font-bold border-2 border-red-hot">3</div>
            <div>
              <p className="font-medium text-white-full uppercase">Run the Pressure Test</p>
              <p className="text-sm text-white-dim">Get authentic reactions powered by <span className="text-orange-accent">Phantom Consumer Memory™</span></p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

