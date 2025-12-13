export default function RegisterPage() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="w-full max-w-md space-y-8 p-8">
        <div>
          <h2 className="text-center text-3xl font-bold">Create your account</h2>
          <p className="mt-2 text-center text-sm text-muted-foreground">
            Or{' '}
            <a href="/login" className="font-medium text-primary hover:underline">
              sign in to existing account
            </a>
          </p>
        </div>
        <div className="mt-8 space-y-6">
          <p className="text-center text-muted-foreground">
            Registration will be implemented with Supabase Auth
          </p>
        </div>
      </div>
    </div>
  )
}

