import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Footer } from '@/components/layout/footer'
import { AidenLogo } from '@/components/ui/aiden-logo'

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col bg-black-ink">
      <main className="flex flex-1 flex-col items-center justify-center p-8 md:p-24">
        <div className="z-10 w-full max-w-5xl items-center justify-between">
          <h1 className="text-5xl md:text-7xl font-bold mb-4 text-center uppercase tracking-tight flex items-center justify-center gap-2">
            <AidenLogo size="xl" /><span className="text-white-full">'s Focus Group</span>
          </h1>
          <p className="text-lg md:text-xl text-center mb-12 text-white-muted max-w-2xl mx-auto">
            AI-powered synthetic qualitative research with <span className="text-orange-accent font-bold">Phantom Consumer Memory™</span>
          </p>
          <div className="flex gap-6 justify-center">
            <Button asChild size="lg">
              <Link href="/login">Login</Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="/register">Register</Link>
            </Button>
          </div>
        </div>

        {/* Decorative elements */}
        <div className="absolute bottom-8 left-8 hidden md:block">
          <div className="w-20 h-20 border-2 border-red-hot opacity-30" />
          <div className="w-12 h-12 border-2 border-orange-accent opacity-20 -mt-6 ml-6" />
        </div>
        <div className="absolute top-8 right-8 hidden md:block">
          <div className="w-16 h-16 bg-red-hot opacity-10" />
          <div className="w-8 h-8 bg-orange-accent opacity-20 -mt-4 -ml-4" />
        </div>
      </main>
      <Footer />
    </div>
  )
}
