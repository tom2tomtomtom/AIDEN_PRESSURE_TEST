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
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome back, {user?.email?.split('@')[0]}
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Projects</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{projectCount ?? 0}</div>
            <p className="text-xs text-muted-foreground">Active research projects</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pressure Tests</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{testCount ?? 0}</div>
            <p className="text-xs text-muted-foreground">Tests run to date</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Quick Actions</CardTitle>
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
          <CardTitle>Getting Started</CardTitle>
          <CardDescription>
            Phantom Pressure Test helps you validate marketing concepts against AI-powered consumer personas.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-start gap-4">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary font-semibold">1</div>
            <div>
              <p className="font-medium">Create a Project</p>
              <p className="text-sm text-muted-foreground">Set up your brand context and category</p>
            </div>
          </div>
          <div className="flex items-start gap-4">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary font-semibold">2</div>
            <div>
              <p className="font-medium">Configure Your Test</p>
              <p className="text-sm text-muted-foreground">Add your concept and select persona archetypes</p>
            </div>
          </div>
          <div className="flex items-start gap-4">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary font-semibold">3</div>
            <div>
              <p className="font-medium">Run the Pressure Test</p>
              <p className="text-sm text-muted-foreground">Get authentic reactions powered by Phantom Consumer Memory™</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

