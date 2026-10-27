import { useEffect, useState } from 'react'
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom'
import {
  ArrowLeft,
  CalendarDays,
  Info,
  Loader2,
  MessageCircle,
  Plus,
  Power,
  Printer,
} from 'lucide-react'
import { toast } from 'sonner'

import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { DeleteRoutineExerciseDialog } from '@/features/routines/components/DeleteRoutineExerciseDialog'
import { RoutineExerciseFormDialog } from '@/features/routines/components/RoutineExerciseFormDialog'
import { RoutineExercisesByDay } from '@/features/routines/components/RoutineExercisesByDay'
import { RoutinePrintSheet } from '@/features/routines/components/RoutinePrintSheet'
import { formatDateOnly } from '@/features/routines/dates'
import { buildRoutineShareText, whatsappShareUrl } from '@/features/routines/share'
import {
  useCreateRoutineExercise,
  useDeleteRoutineExercise,
  useRoutine,
  useUpdateRoutine,
  useUpdateRoutineExercise,
} from '@/features/routines/queries'
import { useUsers } from '@/features/users/queries'
import { useAuth } from '@/features/auth/useAuth'
import { getErrorMessage } from '@/features/auth/utils'
import { ApiError } from '@/lib/api/client'
import type {
  RoutineExercise,
  RoutineExerciseCreate,
  RoutineExerciseUpdate,
} from '@/types/routine'

interface RoutineDetailLocationState {
  openExerciseForm?: boolean
}

function shouldOpenExerciseForm(state: unknown): boolean {
  return Boolean(
    (state as RoutineDetailLocationState | null)?.openExerciseForm,
  )
}

export function RoutineDetailPage() {
  const { id } = useParams()
  const routineId = Number(id)
  const validId = Number.isInteger(routineId) && routineId > 0
  const location = useLocation()
  const navigate = useNavigate()
  const { user } = useAuth()
  const canManage = user?.rol === 'admin' || user?.rol === 'profesor'

  const { data: routine, isLoading, error, refetch } = useRoutine(
    validId ? routineId : 0,
  )
  const { data: users } = useUsers()

  const createExercise = useCreateRoutineExercise(routineId)
  const updateExercise = useUpdateRoutineExercise(routineId)
  const deleteExercise = useDeleteRoutineExercise(routineId)
  const updateRoutine = useUpdateRoutine()

  // Al venir del alta de rutina, arrancamos con el formulario de ejercicios
  // abierto para no cortar el flujo. Se limpia el state al consumirlo.
  const [formOpen, setFormOpen] = useState(
    () => canManage && shouldOpenExerciseForm(location.state),
  )
  const [editing, setEditing] = useState<RoutineExercise | null>(null)
  const [deleting, setDeleting] = useState<RoutineExercise | null>(null)

  useEffect(() => {
    if (!shouldOpenExerciseForm(location.state)) return
    navigate(location.pathname, { replace: true, state: null })
  }, [location.pathname, location.state, navigate])

  const userLabel = (userId: number) => {
    const found = users?.find((item) => item.id === userId)
    return found ? `${found.name} ${found.lastname}` : `Socio #${userId}`
  }

  function openCreate() {
    setEditing(null)
    setFormOpen(true)
  }

  function openEdit(exerciseRow: RoutineExercise) {
    setEditing(exerciseRow)
    setFormOpen(true)
  }

  async function handleSubmit(
    payload: RoutineExerciseCreate | RoutineExerciseUpdate,
  ) {
    if (editing) {
      await updateExercise.mutateAsync({
        exerciseRowId: editing.id,
        data: payload as RoutineExerciseUpdate,
      })
      toast.success('Ejercicio actualizado')
    } else {
      await createExercise.mutateAsync(payload as RoutineExerciseCreate)
      toast.success('Ejercicio agregado')
    }
    setFormOpen(false)
    setEditing(null)
  }

  async function handleDelete() {
    if (!deleting) return
    try {
      await deleteExercise.mutateAsync(deleting.id)
      toast.success('Ejercicio quitado de la rutina')
      setDeleting(null)
    } catch (err) {
      toast.error(getErrorMessage(err))
    }
  }

  if (!validId) {
    return <RoutineNotFound />
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="size-5 animate-spin text-text-muted" />
        <span className="sr-only">Cargando rutina</span>
      </div>
    )
  }

  if (error) {
    if (error instanceof ApiError && error.status === 404) {
      return <RoutineNotFound />
    }
    return (
      <div className="flex flex-col items-start gap-3 rounded-xl bg-card p-6">
        <p className="text-sm text-foreground">No se pudo cargar la rutina.</p>
        <p className="text-[0.8125rem] text-muted-foreground">
          {getErrorMessage(error)}
        </p>
        <Button variant="outline" size="sm" onClick={() => refetch()}>
          Reintentar
        </Button>
      </div>
    )
  }

  if (!routine) {
    return <RoutineNotFound />
  }

  const totalExercises = routine.exercises.length
  const memberLabel = userLabel(routine.user_id)

  // Resumen en texto para WhatsApp y hoja para "Guardar como PDF".
  const shareText = buildRoutineShareText({
    routineId: routine.id,
    memberLabel,
    dateGenerated: routine.date_generated,
    exercises: routine.exercises,
  })

  function handlePrint() {
    window.print()
  }

  const handleToggleState = async () => {
    try {
      await updateRoutine.mutateAsync({
        id: routine.id,
        data: { state: !routine.state },
      })
      toast.success(routine.state ? 'Rutina desactivada' : 'Rutina activada')
    } catch (err) {
      toast.error(getErrorMessage(err))
    }
  }

  return (
    <>
      {/* En pantalla; al imprimir queda solo la hoja de abajo. */}
      <div className="flex flex-col gap-6 print:hidden">
        <div>
          <Link
            to="/rutinas"
            className="inline-flex items-center gap-1.5 text-[0.8125rem] text-text-muted transition-colors hover:text-foreground"
          >
            <ArrowLeft className="size-3.5" strokeWidth={1.75} />
            Volver a rutinas
          </Link>
        </div>

        <header className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <div className="flex flex-wrap items-center gap-2.5">
              <h1 className="text-[1.5rem] leading-tight font-semibold tracking-[-0.02em] text-foreground">
                Rutina #{routine.id}
              </h1>
              <Badge variant={routine.state ? 'default' : 'outline'}>
                {routine.state ? 'Activa' : 'Inactiva'}
              </Badge>
            </div>
            <p className="mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-[0.8125rem] text-muted-foreground">
              <span>{userLabel(routine.user_id)}</span>
              <span aria-hidden="true">·</span>
              <span className="inline-flex items-center gap-1.5">
                <CalendarDays className="size-3.5" strokeWidth={1.75} />
                {formatDateOnly(routine.date_generated)}
              </span>
              <span aria-hidden="true">·</span>
              <span className="num">
                {totalExercises}{' '}
                {totalExercises === 1 ? 'ejercicio' : 'ejercicios'}
              </span>
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            {canManage && (
              <>
                <Button
                  variant="outline"
                  onClick={handleToggleState}
                  disabled={updateRoutine.isPending}
                >
                  <Power className="size-4" strokeWidth={2} />
                  {routine.state ? 'Desactivar' : 'Activar'}
                </Button>
                <Button onClick={openCreate}>
                  <Plus className="size-4" strokeWidth={2} />
                  Agregar ejercicio
                </Button>
              </>
            )}

            <Button variant="outline" onClick={handlePrint}>
              <Printer className="size-4" strokeWidth={2} />
              Imprimir / PDF
            </Button>
            <Button asChild variant="outline">
              <a
                href={whatsappShareUrl(shareText)}
                target="_blank"
                rel="noopener noreferrer"
              >
                <MessageCircle className="size-4" strokeWidth={2} />
                Compartir por WhatsApp
              </a>
            </Button>
          </div>
        </header>

        {!canManage && (
          <Alert>
            <Info className="size-4" />
            <AlertDescription>
              La rutina es de solo lectura. La gestiona un profesor o administrador.
            </AlertDescription>
          </Alert>
        )}

        {totalExercises > 0 ? (
          <RoutineExercisesByDay
            exercises={routine.exercises}
            canManage={canManage}
            onEdit={openEdit}
            onDelete={setDeleting}
          />
        ) : (
          <section className="rounded-xl bg-card px-6 py-14 text-center">
            <p className="text-[0.875rem] font-medium text-foreground">
              La rutina todavía no tiene ejercicios
            </p>
            <p className="mx-auto mt-1 max-w-md text-[0.8125rem] text-muted-foreground">
              {canManage
                ? 'Agregá el primer ejercicio y definí el día, las series, las repeticiones y el orden.'
                : 'Cuando tu profesor cargue el plan, lo vas a ver acá.'}
            </p>
            {canManage && (
              <Button onClick={openCreate} className="mt-5">
                <Plus className="size-4" strokeWidth={2} />
                Agregar primer ejercicio
              </Button>
            )}
          </section>
        )}

        <RoutineExerciseFormDialog
          key={formOpen ? (editing?.id ?? 'nuevo') : 'cerrado'}
          open={formOpen}
          exerciseRow={editing}
          isPending={createExercise.isPending || updateExercise.isPending}
          onSubmit={handleSubmit}
          onOpenChange={(open) => {
            setFormOpen(open)
            if (!open) setEditing(null)
          }}
        />

        <DeleteRoutineExerciseDialog
          exerciseRow={deleting}
          isPending={deleteExercise.isPending}
          onConfirm={handleDelete}
          onOpenChange={(open) => {
            if (!open) setDeleting(null)
          }}
        />
      </div>

      <RoutinePrintSheet routine={routine} memberLabel={memberLabel} />
    </>
  )
}

function RoutineNotFound() {
  return (
    <div className="flex flex-col items-start gap-4 rounded-xl bg-card p-6">
      <div>
        <h1 className="text-[1.25rem] font-semibold text-foreground">
          Rutina no encontrada
        </h1>
        <p className="mt-1 text-[0.8125rem] text-muted-foreground">
          El plan no existe o ya no está disponible.
        </p>
      </div>
      <Button asChild variant="outline" size="sm">
        <Link to="/rutinas">Volver a rutinas</Link>
      </Button>
    </div>
  )
}
