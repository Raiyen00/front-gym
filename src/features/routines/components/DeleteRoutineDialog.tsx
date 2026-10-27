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
import { formatDateOnly } from '@/features/routines/dates'
import type { Routine } from '@/types/routine'

interface DeleteRoutineDialogProps {
  routine: Routine | null
  userLabel: string
  isPending: boolean
  onConfirm: () => void
  onOpenChange: (open: boolean) => void
}

export function DeleteRoutineDialog({
  routine,
  userLabel,
  isPending,
  onConfirm,
  onOpenChange,
}: DeleteRoutineDialogProps) {
  return (
    <Dialog open={routine !== null} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="size-5 text-destructive" />
            Eliminar rutina
          </DialogTitle>
          <DialogDescription>
            {routine
              ? `¿Seguro que querés eliminar la rutina de ${userLabel} del ${formatDateOnly(
                  routine.date_generated,
                )}? También se eliminarán sus ejercicios.`
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
