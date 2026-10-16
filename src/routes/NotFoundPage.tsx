import { Link } from 'react-router-dom'

import { Button } from '@/components/ui/button'

export function NotFoundPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 bg-background px-5 text-center">
      <p className="text-sm font-medium text-primary">404</p>
      <h1 className="text-2xl font-bold tracking-tight text-foreground">
        Página no encontrada
      </h1>
      <p className="max-w-sm text-sm text-muted-foreground">
        La ruta que buscás no existe o fue movida.
      </p>
      <Button asChild>
        <Link to="/">Volver al inicio</Link>
      </Button>
    </main>
  )
}
