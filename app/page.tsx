import Link from 'next/link'

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="z-10 w-full max-w-5xl items-center justify-between font-mono text-sm">
        <h1 className="text-4xl font-bold mb-8 text-center">
          Phantom Pressure Test
        </h1>
        <p className="text-xl text-center mb-8 text-muted-foreground">
          Synthetic qualitative research with Phantom Consumer Memory™
        </p>
        <div className="flex gap-4 justify-center">
          <Link
            href="/login"
            className="rounded-lg bg-primary px-6 py-3 text-primary-foreground hover:bg-primary/90"
          >
            Login
          </Link>
          <Link
            href="/register"
            className="rounded-lg border border-border px-6 py-3 hover:bg-accent"
          >
            Register
          </Link>
        </div>
      </div>
    </main>
  )
}

