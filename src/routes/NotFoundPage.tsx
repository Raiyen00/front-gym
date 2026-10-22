import { Link } from 'react-router-dom'

import { Brand } from '@/components/Brand'
import { Button } from '@/components/ui/button'

export function NotFoundPage() {
  return (
    <main className="flex min-h-screen flex-col bg-background">
      <div className="flex h-16 shrink-0 items-center px-5 sm:px-8">
        <Brand />
      </div>

      <div className="flex flex-1 items-center px-5 pt-8 pb-24 sm:px-8">
        <div className="mx-auto w-full max-w-[34rem]">
          <div className="flex items-center gap-3 border-t border-border pt-6">
            <span className="num font-mono text-xs text-text-muted">404</span>
            <span className="h-3 w-px bg-border-muted" aria-hidden="true" />
            <span className="text-xs text-text-muted">Ruta no disponible</span>
          </div>

          <h1 className="mt-5 text-2xl leading-tight font-semibold tracking-[-0.035em] text-foreground sm:text-[2rem]">
            Página no encontrada
          </h1>
          <p className="mt-3 max-w-[42ch] text-sm leading-relaxed text-muted-foreground">
            La ruta que buscás no existe o fue movida. Revisá la dirección o
            volvé al panel para seguir trabajando.
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-2.5">
            <Button asChild>
              <Link to="/">Volver al inicio</Link>
            </Button>
            <Button asChild variant="ghost">
              <Link to="/dashboard">Ir al panel</Link>
            </Button>
          </div>
        </div>
      </div>
    </main>
  )
}
