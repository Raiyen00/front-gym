import { Link } from 'react-router-dom'

import { cn } from '@/lib/utils'

interface BrandProps {
  className?: string
}

export function Brand({ className }: BrandProps) {
  return (
    <Link
      to="/"
      className={cn(
        'inline-flex items-center gap-3 text-[1.45rem] font-bold tracking-tight text-foreground',
        className,
      )}
    >
      <span className="inline-flex size-9 items-center justify-center rounded-md border border-border-muted bg-surface-elevated text-primary">
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={2.5}
          className="size-5"
          aria-hidden="true"
        >
          <path d="M6 16.5l-3 3 1.5 1.5 3-3m10.5-10.5l3-3-1.5-1.5-3 3M7.5 15l9-9m-5 9l-2-2 7-7 2 2-7 7z" />
        </svg>
      </span>
      <span>GymSasS</span>
    </Link>
  )
}
