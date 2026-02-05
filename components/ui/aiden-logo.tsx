import Image from 'next/image'

interface AidenLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl'
  className?: string
}

const sizeClasses = {
  sm: 'h-6',   // 24px - sidebars, footers
  md: 'h-8',   // 32px - headers
  lg: 'h-10',  // 40px - auth pages
  xl: 'h-16', // 64px - hero sections
}

const sizePixels = {
  sm: 24,
  md: 32,
  lg: 40,
  xl: 64,
}

export function AidenLogo({ size = 'md', className = '' }: AidenLogoProps) {
  return (
    <Image
      src="/images/aiden-logo.png"
      alt="AIDEN"
      height={sizePixels[size]}
      width={sizePixels[size] * 2.5}
      className={`${sizeClasses[size]} w-auto ${className}`}
      priority
    />
  )
}
