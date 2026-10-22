import { Link } from 'react-router-dom'

import { cn } from '@/lib/utils'

interface BrandProps {
  className?: string
  /** Muestra solo la marca, sin el nombre. */
  compact?: boolean
}

export function Brand({ className, compact = false }: BrandProps) {
  return (
    <Link
      to="/"
      aria-label="GymSasS — inicio"
      className={cn(
        'inline-flex items-center gap-2.5 rounded-md text-foreground transition-opacity hover:opacity-85 focus-visible:ring-[3px] focus-visible:ring-ring/25 focus-visible:outline-none',
        className,
      )}
    >
      <svg
        viewBox="0 0 28 28"
        fill="none"
        aria-hidden="true"
        className="size-[22px] shrink-0 text-primary"
      >
        <path
          d="M8.5 14h11"
          stroke="currentColor"
          strokeWidth="2.4"
          strokeLinecap="round"
        />
        <rect x="2.6" y="8" width="3.4" height="12" rx="1.4" fill="currentColor" />
        <rect x="22" y="8" width="3.4" height="12" rx="1.4" fill="currentColor" />
        <rect x="7" y="10.5" width="2.4" height="7" rx="1.1" fill="currentColor" opacity="0.75" />
        <rect x="18.6" y="10.5" width="2.4" height="7" rx="1.1" fill="currentColor" opacity="0.75" />
      </svg>
      {!compact && (
        <span className="text-display text-[1.0625rem] font-semibold text-foreground">
          GymSasS
        </span>
      )}
    </Link>
  )
}
