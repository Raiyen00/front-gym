import { Activity, Eye, Loader2 } from 'lucide-react'
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
      <div className="flex items-center justify-center py-12">
        <Loader2 className="size-6 animate-spin text-primary" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-12 text-destructive">
        Error al cargar tu perfil deportivo: {getErrorMessage(error)}
        <Button variant="outline" className="ml-4" onClick={() => refetch()}>
          Reintentar
        </Button>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Mi perfil deportivo</h1>
        <p className="text-muted-foreground">Tus objetivos y datos de entrenamiento</p>
      </div>

      <Alert>
        <Eye className="size-4" />
        <AlertDescription>
          Esta información la gestiona un administrador. Es de solo lectura.
        </AlertDescription>
      </Alert>

      {profiles && profiles.length > 0 ? (
        profiles.map((profile) => (
          <Card key={profile.id}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="size-5 text-primary" />
                Perfil #{profile.id}
                <span className="ml-auto text-xs font-normal text-muted-foreground">
                  Creado el {format(new Date(profile.created_at), 'dd/MM/yyyy')}
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <SportProfileDetails profile={profile} />
            </CardContent>
          </Card>
        ))
      ) : (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            Todavía no tenés un perfil deportivo cargado.
          </CardContent>
        </Card>
      )}
    </div>
  )
}
