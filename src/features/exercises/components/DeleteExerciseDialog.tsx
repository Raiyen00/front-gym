import { AlertTriangle, Loader2, Trash2 } from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import type { Exercise } from '@/types/exercise'

interface DeleteExerciseDialogProps {
  exercise: Exercise | null
  isPending: boolean
  onConfirm: () => void
  onOpenChange: (open: boolean) => void
}

export function DeleteExerciseDialog({
  exercise,
  isPending,
  onConfirm,
  onOpenChange,
}: DeleteExerciseDialogProps) {
  return (
    <Dialog open={exercise !== null} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="size-5 text-destructive" />
            Eliminar ejercicio
          </DialogTitle>
          <DialogDescription>
            {exercise
              ? `¿Seguro que querés eliminar "${exercise.name}"? Esta acción no se puede deshacer.`
              : ''}
          </DialogDescription>
        </DialogHeader>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isPending}
          >
            Cancelar
          </Button>
          <Button type="button" variant="destructive" onClick={onConfirm} disabled={isPending}>
            {isPending ? (
              <>
                <Loader2 className="size-3.5 animate-spin" />
                Eliminando...
              </>
            ) : (
              <>
                <Trash2 className="size-3.5" />
                Eliminar
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
