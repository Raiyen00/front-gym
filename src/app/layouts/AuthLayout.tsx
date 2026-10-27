import type { ReactNode } from 'react'

import { ApiUrlBadge } from '@/components/ApiUrlBadge'
import { Brand } from '@/components/Brand'

interface AuthLayoutProps {
  children: ReactNode
}

export function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <main className="flex flex-1 items-center justify-center px-5 py-10 sm:px-8">
        <div className="w-full max-w-[25rem]">
          <div className="mb-8 flex flex-col items-center text-center">
            <Brand />
            <p className="mt-3 max-w-[32ch] text-[0.8125rem] leading-relaxed text-muted-foreground">
              Socios, cuotas y rutinas en un mismo lugar.
            </p>
          </div>

          <div className="rounded-2xl border border-border bg-card p-6 shadow-lg sm:p-8">
            {children}
          </div>

          <div className="mt-6 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-[0.6875rem] text-text-muted">
            <span>ISFT 194 · Proyecto Final Integrador</span>
            <span className="inline-flex items-center gap-2">
              <span>API</span>
              <ApiUrlBadge />
            </span>
          </div>
        </div>
      </main>
    </div>
  )
}
