import { useState } from 'react'
import { Loader2, Save } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'

import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useExercises } from '@/features/exercises/queries'
import {
  routineExerciseFormSchema,
  type RoutineExerciseFormValues,
} from '@/features/routines/schema'
import {
  buildRoutineExerciseCreate,
  buildRoutineExerciseUpdate,
} from '@/features/routines/payload'
import { getErrorMessage } from '@/features/auth/utils'
import { ApiError } from '@/lib/api/client'
import {
  DIAS_SEMANA,
  DIA_SEMANA_LABELS,
  GRUPOS_MUSCULARES,
  GRUPO_MUSCULAR_LABELS,
  type GrupoMuscular,
} from '@/types/enums'
import type {
  RoutineExercise,
  RoutineExerciseCreate,
  RoutineExerciseUpdate,
} from '@/types/routine'

interface RoutineExerciseFormDialogProps {
  open: boolean
  /** `null` => alta. En edición no se puede cambiar el ejercicio. */
  exerciseRow: RoutineExercise | null
  isPending: boolean
  onSubmit: (
    payload: RoutineExerciseCreate | RoutineExerciseUpdate,
  ) => Promise<void>
  onOpenChange: (open: boolean) => void
}

const CREATE_DEFAULTS: RoutineExerciseFormValues = {
  exercise_id: '',
  day: '',
  sets: '3',
  repetitions: '10',
  rest: '60',
  position: '1',
}

export function RoutineExerciseFormDialog({
  open,
  exerciseRow,
  isPending,
  onSubmit,
  onOpenChange,
}: RoutineExerciseFormDialogProps) {
  const isEdit = exerciseRow !== null
  const { data: exercises, isLoading: exercisesLoading } = useExercises()
  const [conflict, setConflict] = useState<string | null>(null)
  // El grupo muscular es solo navegación: filtra el segundo select y no
  // viaja en el body. En edición queda fijo al grupo del ejercicio actual.
  const [muscularGroup, setMuscularGroup] = useState<GrupoMuscular | ''>(
    () => exerciseRow?.exercise.muscular_group ?? '',
  )

  const availableGroups = GRUPOS_MUSCULARES.filter((group) =>
    exercises?.some((exercise) => exercise.muscular_group === group),
  )
  const groupExercises = (exercises ?? [])
    .filter((exercise) => exercise.muscular_group === muscularGroup)
    .sort((a, b) => a.name.localeCompare(b.name, 'es'))

  const form = useForm<RoutineExerciseFormValues>({
    resolver: zodResolver(routineExerciseFormSchema),
    defaultValues: exerciseRow
      ? {
          exercise_id: String(exerciseRow.exercise.id),
          day: exerciseRow.day,
          sets: String(exerciseRow.sets),
          repetitions: exerciseRow.repetitions,
          rest: String(exerciseRow.rest),
          position: String(exerciseRow.position),
        }
      : CREATE_DEFAULTS,
  })

  function handleGroupChange(value: string) {
    setMuscularGroup(value as GrupoMuscular)
    // Al cambiar de grupo el ejercicio anterior deja de ser válido.
    form.setValue('exercise_id', '')
  }

  async function handleSubmit(values: RoutineExerciseFormValues) {
    setConflict(null)

    try {
      if (exerciseRow) {
        const payload = buildRoutineExerciseUpdate(exerciseRow, values)
        if (Object.keys(payload).length === 0) {
          toast.info('No hay cambios para guardar')
          return
        }
        await onSubmit(payload)
        return
      }

      await onSubmit(buildRoutineExerciseCreate(values))
    } catch (error) {
      const message = getErrorMessage(error)
      // El 409 todavía no está implementado en la API, pero cuando llegue
      // (ejercicio repetido en el día o posición ocupada) se muestra inline.
      if (error instanceof ApiError && error.status === 409) {
        setConflict(message)
        return
      }
      toast.error(message)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {isEdit ? 'Editar ejercicio de la rutina' : 'Agregar ejercicio'}
          </DialogTitle>
          <DialogDescription>
            {isEdit
              ? 'Solo se envían los campos modificados.'
              : 'El ejercicio se agrega a un día del plan, con su orden dentro del día.'}
          </DialogDescription>
        </DialogHeader>

        {conflict && (
          <Alert variant="warning">
            <AlertDescription>{conflict}</AlertDescription>
          </Alert>
        )}

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            noValidate
            className="space-y-4"
          >
            {isEdit && exerciseRow ? (
              <div className="flex items-center justify-between gap-3 rounded-md border border-input p-3">
                <div>
                  <p className="text-[0.875rem] font-medium text-foreground">
                    {exerciseRow.exercise.name}
                  </p>
                  <p className="text-[0.8125rem] text-text-muted">
                    Se puede cambiar el ejercicio en la edición.
                  </p>
                </div>
                <Badge variant="outline">
                  {GRUPO_MUSCULAR_LABELS[exerciseRow.exercise.muscular_group] ||
                    exerciseRow.exercise.muscular_group}
                </Badge>
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="grid gap-2">
                  <Label htmlFor="routine-exercise-group">Grupo muscular</Label>
                  <Select
                    value={muscularGroup}
                    onValueChange={handleGroupChange}
                    disabled={exercisesLoading || availableGroups.length === 0}
                  >
                    <SelectTrigger
                      id="routine-exercise-group"
                      className="w-full"
                    >
                      <SelectValue
                        placeholder={
                          exercisesLoading
                            ? 'Cargando ejercicios...'
                            : availableGroups.length === 0
                              ? 'Sin ejercicios cargados'
                              : 'Elegí un grupo'
                        }
                      />
                    </SelectTrigger>
                    <SelectContent>
                      {availableGroups.map((group) => (
                        <SelectItem key={group} value={group}>
                          {GRUPO_MUSCULAR_LABELS[group]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {!exercisesLoading && availableGroups.length === 0 && (
                    <p className="text-[0.8125rem] text-text-muted">
                      Cargá ejercicios desde la sección Ejercicios.
                    </p>
                  )}
                </div>

                <FormField
                  control={form.control}
                  name="exercise_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Ejercicio</FormLabel>
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                        disabled={!muscularGroup}
                      >
                        <FormControl>
                          <SelectTrigger className="w-full">
                            <SelectValue
                              placeholder={
                                !muscularGroup
                                  ? 'Elegí primero un grupo'
                                  : groupExercises.length === 0
                                    ? 'No hay ejercicios en este grupo'
                                    : 'Elegí un ejercicio'
                              }
                            />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {groupExercises.map((exercise) => (
                            <SelectItem
                              key={exercise.id}
                              value={String(exercise.id)}
                            >
                              {exercise.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            )}

            <div className="grid gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="day"
                render={({ field }) => (
                    <FormItem>
                      <FormLabel>Día</FormLabel>
                      <Select value={field.value} onValueChange={field.onChange}>
                        <FormControl>
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Elegí un día" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {DIAS_SEMANA.map((day) => (
                            <SelectItem key={day} value={day}>
                              {DIA_SEMANA_LABELS[day]}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="position"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Posición</FormLabel>
                      <FormControl>
                        <Input type="number" min={1} {...field} />
                      </FormControl>
                      <FormDescription>
                        Orden dentro del día, desde 1.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-3">
                <FormField
                  control={form.control}
                  name="sets"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Series</FormLabel>
                      <FormControl>
                        <Input type="number" min={1} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="repetitions"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Repeticiones</FormLabel>
                      <FormControl>
                        <Input placeholder='10, 8-12, "al fallo"' {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="rest"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Descanso (seg)</FormLabel>
                      <FormControl>
                        <Input type="number" min={0} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => onOpenChange(false)}
                  disabled={isPending}
                >
                  Cancelar
                </Button>
                <Button type="submit" disabled={isPending}>
                  {isPending ? (
                    <>
                      <Loader2 className="size-3.5 animate-spin" />
                      Guardando...
                    </>
                  ) : (
                    <>
                      <Save className="size-3.5" />
                      {isEdit ? 'Guardar cambios' : 'Agregar ejercicio'}
                    </>
                  )}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
  )
}