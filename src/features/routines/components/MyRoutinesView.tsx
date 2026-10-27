import { Link } from 'react-router-dom'
import { ArrowRight, CalendarDays, Loader2 } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { groupExercisesByDay } from '@/features/routines/grouping'
import { formatDateOnly } from '@/features/routines/dates'
import { useMyRoutines } from '@/features/routines/queries'
import { getErrorMessage } from '@/features/auth/utils'

export function MyRoutinesView() {
  const { data: routines, isLoading, error, refetch } = useMyRoutines()

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="size-5 animate-spin text-text-muted" />
        <span className="sr-only">Cargando rutinas</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-start gap-3 rounded-xl bg-card p-6">
        <p className="text-sm text-foreground">No se pudieron cargar tus rutinas.</p>
        <p className="text-[0.8125rem] text-muted-foreground">
          {getErrorMessage(error)}
        </p>
        <Button variant="outline" size="sm" onClick={() => refetch()}>
          Reintentar
        </Button>
      </div>
    )
  }

  const allRoutines = routines ?? []
  const activeRoutines = allRoutines.filter((routine) => routine.state)
  const inactiveRoutines = allRoutines.filter((routine) => !routine.state)

  return (
    <div className="flex flex-col gap-6">
      <header>
        <h1 className="text-[1.5rem] leading-tight font-semibold tracking-[-0.02em] text-foreground">
          Mis rutinas
        </h1>
        <p className="mt-1 text-[0.8125rem] text-muted-foreground">
          Los planes de entrenamiento que te asignó tu profesor.
        </p>
      </header>

      {allRoutines.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center gap-1.5 py-14 text-center">
            <p className="text-[0.875rem] font-medium text-foreground">
              Todavía no tenés rutinas asignadas
            </p>
            <p className="text-[0.8125rem] text-muted-foreground">
              Cuando tu profesor te asigne un plan, va a aparecer acá.
            </p>
          </CardContent>
        </Card>
      ) : activeRoutines.length > 0 ? (
        <div className="grid gap-4 lg:grid-cols-2">
          {activeRoutines.map((routine) => {
            const groups = groupExercisesByDay(routine.exercises)
            return (
              <Card key={routine.id}>
                <CardHeader className="flex-row items-start justify-between gap-4">
                  <div>
                    <CardTitle>Plan #{routine.id}</CardTitle>
                    <p className="num mt-1 flex items-center gap-1.5 text-xs text-text-muted">
                      <CalendarDays className="size-3.5" strokeWidth={1.75} />
                      {formatDateOnly(routine.date_generated)}
                    </p>
                  </div>
                  <Badge variant="default">Activa</Badge>
                </CardHeader>
                <CardContent className="flex flex-col gap-4">
                  {groups.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {groups.map((group) => (
                        <Badge key={group.day} variant="secondary">
                          {group.label} · {group.exercises.length}
                        </Badge>
                      ))}
                    </div>
                  ) : (
                    <p className="text-[0.8125rem] text-muted-foreground">
                      Todavía no tiene ejercicios cargados.
                    </p>
                  )}

                  <Button asChild variant="outline" size="sm" className="w-fit">
                    <Link to={`/rutinas/${routine.id}`}>
                      Ver rutina
                      <ArrowRight className="size-3.5" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            )
          })}
        </div>
      ) : (
        <Card>
          <CardContent className="flex flex-col items-center gap-1.5 py-14 text-center">
            <p className="text-[0.875rem] font-medium text-foreground">
              No tenés rutinas activas
            </p>
            <p className="text-[0.8125rem] text-muted-foreground">
              Cuando tu profesor te asigne un plan nuevo, va a aparecer acá.
            </p>
          </CardContent>
        </Card>
      )}

      {inactiveRoutines.length > 0 && (
        <section className="flex flex-col gap-3">
          <div>
            <h2 className="text-[1.0625rem] leading-tight font-semibold tracking-[-0.01em] text-foreground">
              Historial
            </h2>
            <p className="mt-1 text-[0.8125rem] text-muted-foreground">
              Rutinas que tu profesor desactivó. Quedan acá como referencia.
            </p>
          </div>

          <Card className="py-0">
            <CardContent className="divide-y divide-border p-0">
              {inactiveRoutines.map((routine) => {
                const totalExercises = routine.exercises.length
                return (
                  <div
                    key={routine.id}
                    className="flex flex-wrap items-center justify-between gap-3 px-5 py-4"
                  >
                    <div className="min-w-0">
                      <p className="text-[0.875rem] font-medium text-foreground">
                        Plan #{routine.id}
                      </p>
                      <p className="num mt-0.5 flex flex-wrap items-center gap-1.5 text-xs text-text-muted">
                        <CalendarDays className="size-3.5" strokeWidth={1.75} />
                        {formatDateOnly(routine.date_generated)}
                        <span aria-hidden="true">·</span>
                        <span>
                          {totalExercises}{' '}
                          {totalExercises === 1 ? 'ejercicio' : 'ejercicios'}
                        </span>
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <Badge variant="outline">Inactiva</Badge>
                      <Button asChild variant="ghost" size="sm">
                        <Link to={`/rutinas/${routine.id}`}>
                          Ver rutina
                          <ArrowRight className="size-3.5" />
                        </Link>
                      </Button>
                    </div>
                  </div>
                )
              })}
            </CardContent>
          </Card>
        </section>
      )}
    </div>
  )
}
