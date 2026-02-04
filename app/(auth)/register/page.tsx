'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createAuthClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Eye, EyeOff } from 'lucide-react'

export default function RegisterPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setIsLoading(true)
    setMessage(null)

    if (password !== confirmPassword) {
      setMessage({ type: 'error', text: 'Passwords do not match' })
      setIsLoading(false)
      return
    }

    if (password.length < 6) {
      setMessage({ type: 'error', text: 'Password must be at least 6 characters' })
      setIsLoading(false)
      return
    }

    const supabase = createAuthClient()

    const { error } = await supabase.auth.signUp({
      email,
      password,
    })

    if (error) {
      setIsLoading(false)
      setMessage({ type: 'error', text: error.message })
    } else {
      setMessage({
        type: 'success',
        text: 'Registration successful! You can now sign in.'
      })
      setTimeout(() => {
        router.push('/login')
      }, 2000)
    }
  }

  return (
    <Card className="border-2 border-border-subtle shadow-[4px_4px_0px_#ff2e2e]">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-bold text-center uppercase tracking-tight">
          <span className="text-red-hot">Create</span> <span className="text-white-full">Account</span>
        </CardTitle>
        <CardDescription className="text-center text-white-muted">
          Enter your details to create an account
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={isLoading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={isLoading}
                className="pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirm Password</Label>
            <Input
              id="confirmPassword"
              type={showPassword ? 'text' : 'password'}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              disabled={isLoading}
            />
          </div>

          {message && (
            <div
              className={`p-4 text-sm border-2 ${
                message.type === 'success'
                  ? 'border-orange-accent bg-orange-accent/10 text-orange-accent'
                  : 'border-red-hot bg-red-hot/10 text-red-hot'
              }`}
            >
              {message.text}
            </div>
          )}

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? 'Creating account...' : 'Create Account'}
          </Button>
        </form>

        <div className="mt-6 text-center text-sm">
          <p className="text-white-muted">
            Already have an account?{' '}
            <Link href="/login" className="text-orange-accent font-bold hover:underline uppercase tracking-wider">
              Sign In
            </Link>
          </p>
        </div>

        <div className="mt-4 text-center text-xs text-white-dim">
          <p className="mb-2">By creating an account, you agree to our</p>
          <a href="/terms" className="hover:text-white-muted">Terms & Conditions</a>
          <span className="mx-2">·</span>
          <a href="/privacy" className="hover:text-white-muted">Privacy Policy</a>
        </div>
      </CardContent>
    </Card>
  )
}

