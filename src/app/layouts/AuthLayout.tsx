import type { ReactNode } from 'react'

import { ApiUrlBadge } from '@/components/ApiUrlBadge'
import { Brand } from '@/components/Brand'

interface AuthLayoutProps {
  children: ReactNode
}

const MODULES = [
  { label: 'Socios', detail: 'Alta y seguimiento' },
  { label: 'Cuotas', detail: 'Membresías al día' },
  { label: 'Entrenamiento', detail: 'Perfiles y rutinas' },
]

export function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="flex min-h-screen flex-col bg-background lg:grid lg:grid-cols-[minmax(0,1fr)_minmax(0,0.85fr)]">
      <aside className="hidden border-r border-border p-10 lg:flex lg:flex-col xl:p-14">
        <div className="flex items-center justify-between">
          <p className="text-xs font-medium text-text-muted">
            Panel de gestión
          </p>
          <span className="num font-mono text-[0.6875rem] text-text-muted">
            v0.1
          </span>
        </div>

        <div className="flex flex-1 flex-col justify-center py-12">
          <p className="max-w-[13ch] text-[2rem] leading-[1.08] font-semibold tracking-[-0.035em] text-foreground">
            Tu gimnasio, en orden.
          </p>
          <p className="mt-4 max-w-[36ch] text-sm leading-relaxed text-muted-foreground">
            Socios, cuotas y rutinas en un mismo panel. Menos planillas, más
            tiempo en la sala.
          </p>

          <dl className="mt-12 max-w-[26rem] border-t border-border">
            {MODULES.map((module) => (
              <div
                key={module.label}
                className="flex items-baseline justify-between gap-6 border-b border-border py-3.5"
              >
                <dt className="text-sm text-foreground">{module.label}</dt>
                <dd className="text-right font-mono text-[0.6875rem] text-text-muted">
                  {module.detail}
                </dd>
              </div>
            ))}
          </dl>
        </div>

        <div className="border-t border-border pt-4">
          <p className="text-[0.6875rem] text-text-muted">
            ISFT 194 · Proyecto Final Integrador
          </p>
        </div>
      </aside>

      <main className="flex flex-1 flex-col justify-center px-5 py-10 sm:px-10 lg:px-12 xl:px-16">
        <div className="mx-auto w-full max-w-[26rem]">
          <div className="mb-7">
            <Brand />
            <p className="mt-2.5 text-[0.8125rem] text-muted-foreground">
              Sistema de Gestión deportiva y control de socios
            </p>
          </div>

          <div className="rounded-xl bg-surface p-6 sm:p-7">{children}</div>

          <div className="mt-6 flex flex-wrap items-center justify-between gap-3 text-[0.6875rem] text-text-muted">
            <span className="lg:hidden">
              ISFT 194 · Proyecto Final Integrador
            </span>
            <span className="inline-flex items-center gap-2 lg:ml-auto">
              <span>API</span>
              <ApiUrlBadge />
            </span>
          </div>
        </div>
      </main>
    </div>
  )
}
