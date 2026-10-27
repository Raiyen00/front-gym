import { Loader2, Save } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'

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
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { ApiError } from '@/lib/api/client'
import { getErrorMessage } from '@/features/auth/utils'
import { exerciseFormSchema, type ExerciseFormValues } from '@/features/exercises/schema'
import { buildExercisePayload } from '@/features/exercises/payload'
import { GRUPOS_MUSCULARES, GRUPO_MUSCULAR_LABELS } from '@/types/enums'
import type { Exercise, ExerciseCreate } from '@/types/exercise'

interface ExerciseFormDialogProps {
  open: boolean
  /** `null` => alta. */
  exercise: Exercise | null
  isPending: boolean
  onSubmit: (data: ExerciseCreate) => Promise<void>
  onOpenChange: (open: boolean) => void
}

const EMPTY_VALUES: ExerciseFormValues = {
  name: '',
  description: '',
  muscular_group: '',
}

export function ExerciseFormDialog({
  open,
  exercise,
  isPending,
  onSubmit,
  onOpenChange,
}: ExerciseFormDialogProps) {
  const isEdit = exercise !== null

  const form = useForm<ExerciseFormValues>({
    resolver: zodResolver(exerciseFormSchema),
    defaultValues: exercise
      ? {
          name: exercise.name,
          description: exercise.description ?? '',
          muscular_group: exercise.muscular_group,
        }
      : EMPTY_VALUES,
  })

  async function handleSubmit(values: ExerciseFormValues) {
    try {
      await onSubmit(buildExercisePayload(values))
    } catch (error) {
      // Nombre duplicado: el backend manda el texto exacto y se muestra en el campo.
      if (error instanceof ApiError && error.status === 409) {
        form.setError('name', { type: 'server', message: error.message })
        return
      }
      toast.error(getErrorMessage(error))
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Editar ejercicio' : 'Nuevo ejercicio'}</DialogTitle>
          <DialogDescription>
            El nombre debe ser único dentro del catálogo de ejercicios.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} noValidate className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nombre</FormLabel>
                  <FormControl>
                    <Input placeholder="Press de banca" autoComplete="off" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="muscular_group"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Grupo muscular</FormLabel>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Elegí un grupo muscular" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {GRUPOS_MUSCULARES.map((group) => (
                        <SelectItem key={group} value={group}>
                          {GRUPO_MUSCULAR_LABELS[group]}
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
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descripción (opcional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Técnica, músculos implicados, observaciones…"
                      rows={3}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

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
                    {isEdit ? 'Guardar cambios' : 'Crear ejercicio'}
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
