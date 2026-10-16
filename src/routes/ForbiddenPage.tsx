import { ShieldX } from 'lucide-react'
import { Link } from 'react-router-dom'

import { Button } from '@/components/ui/button'

export function ForbiddenPage() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 text-center">
      <ShieldX className="size-10 text-warning" />
      <p className="text-sm font-medium text-warning">403</p>
      <h1 className="text-xl font-bold tracking-tight text-foreground">
        Acceso denegado
      </h1>
      <p className="max-w-sm text-sm text-muted-foreground">
        No tenés permisos para ver esta sección.
      </p>
      <Button asChild variant="secondary">
        <Link to="/dashboard">Volver al panel</Link>
      </Button>
    </div>
  )
}
