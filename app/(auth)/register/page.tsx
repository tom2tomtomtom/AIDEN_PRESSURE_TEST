import Link from 'next/link'

export default function RegisterPage() {
  return (
    <div className="border-2 border-border bg-card p-8 shadow-[4px_4px_0px_hsl(0_100%_50%)]">
      <div className="space-y-6">
        <div>
          <h2 className="text-center text-3xl font-bold uppercase tracking-tight">
            <span className="text-primary">Create</span> Account
          </h2>
          <p className="mt-2 text-center text-sm text-muted-foreground">
            Or{' '}
            <Link href="/login" className="font-bold text-primary hover:underline uppercase tracking-wider">
              Sign In
            </Link>
          </p>
        </div>
        <div className="mt-8 space-y-6">
          <p className="text-center text-muted-foreground border-2 border-border p-4">
            Registration uses magic links - enter your email on the login page
          </p>
          <Link
            href="/login"
            className="block w-full text-center bg-primary px-6 py-3 text-primary-foreground font-bold uppercase tracking-wider border-2 border-primary shadow-[4px_4px_0px_hsl(0_100%_50%)] hover:shadow-[6px_6px_0px_hsl(0_100%_50%)] hover:translate-x-[-2px] hover:translate-y-[-2px] transition-all"
          >
            Go to Login
          </Link>
        </div>
      </div>
    </div>
  )
}

