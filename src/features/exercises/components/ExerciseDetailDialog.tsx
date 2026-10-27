import { Dumbbell, Loader2, Pencil, Trash2 } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { useExercise } from '@/features/exercises/queries'
import { getErrorMessage } from '@/features/auth/utils'
import { GRUPO_MUSCULAR_LABELS } from '@/types/enums'

interface ExerciseDetailDialogProps {
  exerciseId: number | null
  onEdit: (exerciseId: number) => void
  onDelete: (exerciseId: number) => void
  onOpenChange: (open: boolean) => void
}

export function ExerciseDetailDialog({
  exerciseId,
  onEdit,
  onDelete,
  onOpenChange,
}: ExerciseDetailDialogProps) {
  const { data: exercise, isLoading, error } = useExercise(exerciseId ?? 0)

  return (
    <Dialog open={exerciseId !== null} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Dumbbell className="size-4 text-text-muted" strokeWidth={1.75} />
            Detalle del ejercicio
          </DialogTitle>
          <DialogDescription>
            {exercise ? `ID ${exercise.id}` : 'Información registrada'}
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="size-6 animate-spin text-primary" />
          </div>
        ) : error ? (
          <div className="py-4 text-sm text-destructive">{getErrorMessage(error)}</div>
        ) : exercise ? (
          <div className="space-y-4">
            <div>
              <p className="text-[0.8125rem] text-text-muted">Nombre</p>
              <p className="text-[0.9375rem] font-medium text-foreground">
                {exercise.name}
              </p>
            </div>
            <div>
              <p className="text-[0.8125rem] text-text-muted">Grupo muscular</p>
              <Badge variant="outline" className="mt-1">
                {GRUPO_MUSCULAR_LABELS[exercise.muscular_group] || exercise.muscular_group}
              </Badge>
            </div>
            <div>
              <p className="text-[0.8125rem] text-text-muted">Descripción</p>
              <p className="mt-1 text-[0.875rem] whitespace-pre-line text-foreground/90">
                {exercise.description || 'Sin descripción'}
              </p>
            </div>
          </div>
        ) : null}

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Cerrar
          </Button>
          {exercise && (
            <Button type="button" onClick={() => onEdit(exercise.id)}>
              <Pencil className="size-3.5" />
              Editar
            </Button>
          )}
          {exercise && (
            <Button
              type="button"
              variant="destructive"
              onClick={() => onDelete(exercise.id)}
            >
              <Trash2 className="size-3.5" />
              Eliminar
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
