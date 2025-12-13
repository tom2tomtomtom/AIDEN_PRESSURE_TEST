import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

export default async function AuthErrorPage({
  searchParams,
}: {
  searchParams: Promise<{ message?: string }>
}) {
  const params = await searchParams
  const message = params.message || 'An error occurred during authentication'

  return (
    <Card>
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-bold text-center text-red-600">
          Authentication Error
        </CardTitle>
        <CardDescription className="text-center">
          {message}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground text-center">
          Please try again. If the problem persists, contact support.
        </p>
        <div className="flex justify-center">
          <Button asChild>
            <Link href="/login">Back to Login</Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
