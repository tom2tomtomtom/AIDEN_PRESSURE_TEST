import type { Metadata } from 'next'
import { GeistSans } from 'geist/font/sans'
import { GeistMono } from 'geist/font/mono'
import { Toaster } from 'sonner'
import { AuthProvider } from '@/components/AuthProvider'
import './globals.css'

export const metadata: Metadata = {
  title: "AIDEN's Focus Group",
  description: 'AI-powered synthetic qualitative research with Phantom Consumer Memory™',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${GeistSans.className} ${GeistMono.variable} bg-black-ink text-white-full`}>
        <AuthProvider>
          {children}
        </AuthProvider>
        <Toaster position="top-right" theme="dark" richColors />
      </body>
    </html>
  )
}
