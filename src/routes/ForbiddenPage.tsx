import { ShieldX } from 'lucide-react'
import { Link } from 'react-router-dom'

import { Button } from '@/components/ui/button'

export function ForbiddenPage() {
  return (
    <div className="flex min-h-[56vh] items-center justify-center py-10">
      <div className="w-full max-w-[24rem] border-t border-border pt-6">
        <div className="flex items-center gap-2.5">
          <ShieldX
            className="size-4 shrink-0 text-warning"
            strokeWidth={1.75}
            aria-hidden="true"
          />
          <p className="font-mono text-xs text-warning">Error 403</p>
        </div>

        <h1 className="mt-4 text-2xl leading-tight font-semibold tracking-[-0.03em] text-foreground">
          Acceso denegado
        </h1>
        <p className="mt-2.5 text-sm leading-relaxed text-muted-foreground">
          No tenés permisos para ver esta sección. Si creés que es un error,
          consultá con un administrador.
        </p>

        <Button asChild variant="outline" className="mt-6">
          <Link to="/dashboard">Volver al panel</Link>
        </Button>
      </div>
    </div>
  )
}
