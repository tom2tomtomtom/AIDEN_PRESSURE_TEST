import Link from 'next/link'

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8 md:p-24 bg-black">
      <div className="z-10 w-full max-w-5xl items-center justify-between">
        <h1 className="text-5xl md:text-7xl font-bold mb-4 text-center uppercase tracking-tight">
          <span className="text-primary">AIDEN's</span> Focus Group
        </h1>
        <p className="text-lg md:text-xl text-center mb-12 text-muted-foreground max-w-2xl mx-auto">
          AI-powered synthetic qualitative research with <span className="text-primary font-bold">Phantom Consumer Memory™</span>
        </p>
        <div className="flex gap-6 justify-center">
          <Link
            href="/login"
            className="bg-primary px-8 py-4 text-primary-foreground font-bold uppercase tracking-wider border-2 border-primary shadow-[4px_4px_0px_hsl(0_100%_50%)] hover:shadow-[6px_6px_0px_hsl(0_100%_50%)] hover:translate-x-[-2px] hover:translate-y-[-2px] transition-all"
          >
            Login
          </Link>
          <Link
            href="/register"
            className="bg-transparent px-8 py-4 text-primary font-bold uppercase tracking-wider border-2 border-primary shadow-[4px_4px_0px_hsl(0_100%_50%)] hover:bg-primary hover:text-primary-foreground transition-all"
          >
            Register
          </Link>
        </div>
      </div>

      {/* Decorative elements */}
      <div className="absolute bottom-8 left-8 hidden md:block">
        <div className="w-20 h-20 border-2 border-primary opacity-30" />
        <div className="w-12 h-12 border-2 border-primary opacity-20 -mt-6 ml-6" />
      </div>
      <div className="absolute top-8 right-8 hidden md:block">
        <div className="w-16 h-16 bg-primary opacity-10" />
        <div className="w-8 h-8 bg-primary opacity-20 -mt-4 -ml-4" />
      </div>
    </main>
  )
}

