export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-black relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-20 left-20 w-40 h-40 border-2 border-primary" />
        <div className="absolute bottom-40 right-10 w-60 h-60 border-2 border-primary" />
        <div className="absolute top-1/2 left-1/4 w-20 h-20 bg-primary" />
      </div>
      <div className="w-full max-w-md px-4 relative z-10">
        {children}
      </div>
    </div>
  )
}
