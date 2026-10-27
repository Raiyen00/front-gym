import { Loader2, Plus, Search } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { ExercisesTable } from '@/features/exercises/components/ExercisesTable'
import { ExerciseFormDialog } from '@/features/exercises/components/ExerciseFormDialog'
import { ExerciseDetailDialog } from '@/features/exercises/components/ExerciseDetailDialog'
import { DeleteExerciseDialog } from '@/features/exercises/components/DeleteExerciseDialog'
import {
  useExercises,
  useCreateExercise,
  useUpdateExercise,
  useDeleteExercise,
} from '@/features/exercises/queries'
import { getErrorMessage } from '@/features/auth/utils'
import { GRUPOS_MUSCULARES, GRUPO_MUSCULAR_LABELS } from '@/types/enums'
import type { GrupoMuscular } from '@/types/enums'
import type { Exercise, ExerciseCreate } from '@/types/exercise'

const ALL_GROUPS = 'all'
type GroupFilter = typeof ALL_GROUPS | GrupoMuscular

export function ExercisesPage() {
  const [search, setSearch] = useState('')
  const [group, setGroup] = useState<GroupFilter>(ALL_GROUPS)
  const [formOpen, setFormOpen] = useState(false)
  const [editingExercise, setEditingExercise] = useState<Exercise | null>(null)
  const [deletingExercise, setDeletingExercise] = useState<Exercise | null>(null)
  const [viewingId, setViewingId] = useState<number | null>(null)

  const { data: exercises, isLoading, error, refetch } = useExercises(
    group === ALL_GROUPS ? undefined : group,
  )
  const createExercise = useCreateExercise()
  const updateExercise = useUpdateExercise(editingExercise?.id ?? 0)
  const deleteExercise = useDeleteExercise()

  const filtered = exercises?.filter((exercise) => {
    const haystack = `${exercise.name} ${exercise.description ?? ''}`.toLowerCase()
    return haystack.includes(search.toLowerCase())
  }) ?? []

  function openCreate() {
    setEditingExercise(null)
    setFormOpen(true)
  }

  function openEdit(exercise: Exercise) {
    setViewingId(null)
    setEditingExercise(exercise)
    setFormOpen(true)
  }

  /**
   * Sin try/catch a propósito: `ExerciseFormDialog` decide cómo mostrar el error
   * (409 de nombre duplicado → mensaje en el campo; resto → toast).
   */
  async function handleSubmit(data: ExerciseCreate) {
    if (editingExercise) {
      await updateExercise.mutateAsync(data)
      toast.success('Ejercicio actualizado')
    } else {
      await createExercise.mutateAsync(data)
      toast.success('Ejercicio creado')
    }
    setFormOpen(false)
    setEditingExercise(null)
  }

  async function handleDelete() {
    if (!deletingExercise) return
    try {
      await deleteExercise.mutateAsync(deletingExercise.id)
      toast.success('Ejercicio eliminado')
      setDeletingExercise(null)
    } catch (err) {
      toast.error(getErrorMessage(err))
    }
  }

  function handleEditFromDetail(exerciseId: number) {
    const exercise = exercises?.find((item) => item.id === exerciseId)
    if (exercise) openEdit(exercise)
  }

  function handleDeleteFromDetail(exerciseId: number) {
    const exercise = exercises?.find((item) => item.id === exerciseId)
    setViewingId(null)
    if (exercise) setDeletingExercise(exercise)
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="size-5 animate-spin text-text-muted" />
        <span className="sr-only">Cargando ejercicios</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-start gap-3 rounded-xl bg-card p-6">
        <p className="text-sm text-foreground">No se pudieron cargar los ejercicios.</p>
        <p className="text-[0.8125rem] text-muted-foreground">{(error as Error).message}</p>
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
            Ejercicios
          </h1>
          <p className="mt-1 text-[0.8125rem] text-muted-foreground">
            Catálogo de ejercicios agrupados por músculo. Se usan al armar rutinas.
          </p>
        </div>
        <Button onClick={openCreate}>
          <Plus className="size-4" strokeWidth={2} />
          Nuevo ejercicio
        </Button>
      </header>

      <section className="overflow-hidden rounded-xl bg-card">
        <div className="flex flex-col gap-3 border-b border-border px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex w-full flex-col gap-3 sm:flex-row sm:items-center">
            <div className="relative w-full sm:w-[19rem]">
              <Search
                className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-text-muted"
                strokeWidth={1.75}
              />
              <Input
                placeholder="Buscar por nombre o descripción"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                className="h-9 pl-9"
                aria-label="Buscar ejercicios"
              />
            </div>
            <Select
              value={group}
              onValueChange={(value) => setGroup(value as GroupFilter)}
            >
              <SelectTrigger className="h-9 w-full sm:w-[13rem]" aria-label="Filtrar por grupo muscular">
                <SelectValue placeholder="Grupo muscular" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ALL_GROUPS}>Todos los grupos</SelectItem>
                {GRUPOS_MUSCULARES.map((option) => (
                  <SelectItem key={option} value={option}>
                    {GRUPO_MUSCULAR_LABELS[option]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <p className="num text-xs text-text-muted">
            {filtered.length} de {exercises?.length ?? 0} ejercicios
          </p>
        </div>

        <ExercisesTable
          exercises={filtered}
          onView={(exercise) => setViewingId(exercise.id)}
          onEdit={openEdit}
          onDelete={setDeletingExercise}
        />
      </section>

      <ExerciseFormDialog
        key={formOpen ? (editingExercise?.id ?? 'nuevo') : 'cerrado'}
        open={formOpen}
        exercise={editingExercise}
        isPending={createExercise.isPending || updateExercise.isPending}
        onSubmit={handleSubmit}
        onOpenChange={(open) => {
          setFormOpen(open)
          if (!open) setEditingExercise(null)
        }}
      />

      <ExerciseDetailDialog
        exerciseId={viewingId}
        onEdit={handleEditFromDetail}
        onDelete={handleDeleteFromDetail}
        onOpenChange={(open) => {
          if (!open) setViewingId(null)
        }}
      />

      <DeleteExerciseDialog
        exercise={deletingExercise}
        isPending={deleteExercise.isPending}
        onConfirm={handleDelete}
        onOpenChange={(open) => {
          if (!open) setDeletingExercise(null)
        }}
      />
    </div>
  )
}
