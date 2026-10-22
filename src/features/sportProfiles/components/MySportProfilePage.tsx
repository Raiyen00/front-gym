import { Activity, Info, Loader2 } from 'lucide-react'
import { format } from 'date-fns'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { useMySportProfiles } from '@/features/sportProfiles/queries'
import { SportProfileDetails } from '@/features/sportProfiles/components/SportProfileDetails'
import { getErrorMessage } from '@/features/auth/utils'

export function MySportProfilePage() {
  const { data: profiles, isLoading, error, refetch } = useMySportProfiles()

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="size-5 animate-spin text-text-muted" />
        <span className="sr-only">Cargando perfil deportivo</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-start gap-3 rounded-xl bg-card p-6">
        <p className="text-sm text-foreground">
          No se pudo cargar tu perfil deportivo.
        </p>
        <p className="text-[0.8125rem] text-muted-foreground">
          {getErrorMessage(error)}
        </p>
        <Button variant="outline" size="sm" onClick={() => refetch()}>
          Reintentar
        </Button>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6 lg:max-w-3xl">
      <header>
        <h1 className="text-[1.5rem] leading-tight font-semibold tracking-[-0.02em] text-foreground">
          Mi perfil deportivo
        </h1>
        <p className="mt-1 text-[0.8125rem] text-muted-foreground">
          Tus objetivos y datos de entrenamiento.
        </p>
      </header>

      <Alert>
        <Info className="size-4" />
        <AlertDescription>
          Esta información la gestiona un administrador. Es de solo lectura.
        </AlertDescription>
      </Alert>

      {profiles && profiles.length > 0 ? (
        profiles.map((profile) => (
          <Card key={profile.id}>
            <CardHeader className="flex-row items-center justify-between gap-4">
              <CardTitle className="flex items-center gap-2">
                <Activity className="size-4 text-text-muted" strokeWidth={1.75} />
                Perfil
                <span className="num font-normal text-text-muted">#{profile.id}</span>
              </CardTitle>
              <span className="num text-xs text-text-muted">
                {format(new Date(profile.created_at), 'dd/MM/yyyy')}
              </span>
            </CardHeader>
            <CardContent>
              <SportProfileDetails profile={profile} />
            </CardContent>
          </Card>
        ))
      ) : (
        <Card>
          <CardContent className="flex flex-col items-center gap-1.5 py-14 text-center">
            <p className="text-[0.875rem] font-medium text-foreground">
              Todavía no tenés un perfil deportivo
            </p>
            <p className="text-[0.8125rem] text-muted-foreground">
              Pedile a un administrador que cargue tus datos de entrenamiento.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
