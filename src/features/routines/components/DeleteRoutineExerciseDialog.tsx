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
import { DIA_SEMANA_LABELS } from '@/types/enums'
import type { RoutineExercise } from '@/types/routine'

interface DeleteRoutineExerciseDialogProps {
  exerciseRow: RoutineExercise | null
  isPending: boolean
  onConfirm: () => void
  onOpenChange: (open: boolean) => void
}

export function DeleteRoutineExerciseDialog({
  exerciseRow,
  isPending,
  onConfirm,
  onOpenChange,
}: DeleteRoutineExerciseDialogProps) {
  return (
    <Dialog open={exerciseRow !== null} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="size-5 text-destructive" />
            Quitar ejercicio de la rutina
          </DialogTitle>
          <DialogDescription>
            {exerciseRow
              ? `¿Seguro que querés quitar "${exerciseRow.exercise.name}" del ${DIA_SEMANA_LABELS[
                  exerciseRow.day
                ].toLowerCase()}? Esta acción no se puede deshacer.`
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
          <Button
            type="button"
            variant="destructive"
            onClick={onConfirm}
            disabled={isPending}
          >
            {isPending ? (
              <>
                <Loader2 className="size-3.5 animate-spin" />
                Quitando...
              </>
            ) : (
              <>
                <Trash2 className="size-3.5" />
                Quitar
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
