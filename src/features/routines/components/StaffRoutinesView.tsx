import { Loader2, Plus, Search } from 'lucide-react'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { DeleteRoutineDialog } from '@/features/routines/components/DeleteRoutineDialog'
import { RoutineFormDialog } from '@/features/routines/components/RoutineFormDialog'
import { RoutinesTable } from '@/features/routines/components/RoutinesTable'
import {
  useCreateRoutine,
  useDeleteRoutine,
  useRoutines,
  useUpdateRoutine,
} from '@/features/routines/queries'
import { useUsers } from '@/features/users/queries'
import { getErrorMessage } from '@/features/auth/utils'
import type { Routine, RoutineCreate } from '@/types/routine'

export function StaffRoutinesView() {
  const navigate = useNavigate()
  const { data: routines, isLoading, error, refetch } = useRoutines()
  const { data: users } = useUsers()
  const createRoutine = useCreateRoutine()
  const deleteRoutine = useDeleteRoutine()
  const updateRoutine = useUpdateRoutine()

  const [search, setSearch] = useState('')
  const [formOpen, setFormOpen] = useState(false)
  const [deleting, setDeleting] = useState<Routine | null>(null)

  const userLabel = (userId: number) => {
    const user = users?.find((item) => item.id === userId)
    return user ? `${user.name} ${user.lastname}` : `Socio #${userId}`
  }

  const filtered =
    routines?.filter((routine) => {
      const haystack = `${userLabel(routine.user_id)} ${routine.id}`.toLowerCase()
      return haystack.includes(search.toLowerCase())
    }) ?? []

  async function handleCreate(payload: RoutineCreate) {
    try {
      const created = await createRoutine.mutateAsync(payload)
      toast.success('Rutina creada')
      setFormOpen(false)
      // La rutina nace vacía: seguimos en el detalle con el formulario
      // de ejercicios abierto para completar el flujo de carga.
      navigate(`/rutinas/${created.id}`, {
        state: { openExerciseForm: true },
      })
    } catch (err) {
      toast.error(getErrorMessage(err))
    }
  }

  async function handleToggleState(routine: Routine) {
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

  async function handleDelete() {
    if (!deleting) return
    try {
      await deleteRoutine.mutateAsync(deleting.id)
      toast.success('Rutina eliminada')
      setDeleting(null)
    } catch (err) {
      toast.error(getErrorMessage(err))
    }
  }

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
        <p className="text-sm text-foreground">No se pudieron cargar las rutinas.</p>
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
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-[1.5rem] leading-tight font-semibold tracking-[-0.02em] text-foreground">
            Rutinas
          </h1>
          <p className="mt-1 text-[0.8125rem] text-muted-foreground">
            Planes de entrenamiento por socio, con ejercicios agrupados por día.
          </p>
        </div>
        <Button onClick={() => setFormOpen(true)}>
          <Plus className="size-4" strokeWidth={2} />
          Nueva rutina
        </Button>
      </header>

      <section className="overflow-hidden rounded-xl bg-card">
        <div className="flex flex-col gap-3 border-b border-border px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative w-full sm:w-[19rem]">
            <Search
              className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-text-muted"
              strokeWidth={1.75}
            />
            <Input
              placeholder="Buscar por socio o número de rutina"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              className="h-9 pl-9"
              aria-label="Buscar rutinas"
            />
          </div>
          <p className="num text-xs text-text-muted">
            {filtered.length} de {routines?.length ?? 0} rutinas
          </p>
        </div>

        <RoutinesTable
          routines={filtered}
          getUserLabel={userLabel}
          onToggleState={handleToggleState}
          onDelete={setDeleting}
        />
      </section>

      <RoutineFormDialog
        key={formOpen ? 'nueva' : 'cerrada'}
        open={formOpen}
        isPending={createRoutine.isPending}
        onSubmit={handleCreate}
        onOpenChange={setFormOpen}
      />

      <DeleteRoutineDialog
        routine={deleting}
        userLabel={deleting ? userLabel(deleting.user_id) : ''}
        isPending={deleteRoutine.isPending}
        onConfirm={handleDelete}
        onOpenChange={(open) => {
          if (!open) setDeleting(null)
        }}
      />
    </div>
  )
}
