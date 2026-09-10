import Image from 'next/image'
import { cn } from '@/lib/utils'

export function BrandLogo({
  size = 28,
  withWordmark = false,
  className,
}: {
  size?: number
  withWordmark?: boolean
  className?: string
}) {
  return (
    <span className={cn('inline-flex items-center gap-2', className)}>
      <Image
        src="/quantum-logo.png"
        alt="Quantum Services"
        width={size}
        height={size}
        priority
        className="object-contain"
        style={{ width: size, height: size }}
      />
      {withWordmark && (
        <span className="font-display text-sm font-bold tracking-widest quantum-text-gradient">
          QUANTUM
        </span>
      )}
    </span>
  )
}
