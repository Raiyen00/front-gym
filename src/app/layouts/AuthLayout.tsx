import type { ReactNode } from 'react'

import { ApiUrlBadge } from '@/components/ApiUrlBadge'
import { Brand } from '@/components/Brand'

interface AuthLayoutProps {
  children: ReactNode
}

const BACKGROUND_IMAGE =
  'radial-gradient(ellipse 65% 50% at 50% -10%, rgba(16, 185, 129, 0.14), transparent), radial-gradient(ellipse 40% 40% at 50% 115%, rgba(59, 130, 246, 0.06), transparent)'

export function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div
      className="flex min-h-screen flex-col items-center justify-center gap-0 bg-background px-5 py-10"
      style={{ backgroundImage: BACKGROUND_IMAGE }}
    >
      <div className="w-full max-w-[440px]">
        <div className="mb-7 text-center">
          <Brand />
          <p className="mt-1.5 text-[0.85rem] text-muted-foreground">
            Sistema de Gestión deportiva y control de socios
          </p>
        </div>

        <div className="rounded-lg border border-border bg-card p-8 shadow-lg">
          {children}
        </div>

        <div className="mt-6 text-center text-[0.775rem] text-text-muted">
          <div>ISFT 194 • Proyecto Final Integrador — GymSasS</div>
          <div className="mt-1.5 text-[0.72rem] text-muted-foreground">
            Backend API: <ApiUrlBadge />
          </div>
        </div>
      </div>
    </div>
  )
}
