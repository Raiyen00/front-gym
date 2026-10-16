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
import type { User } from '@/types/user'

interface DeleteUserDialogProps {
  user: User | null
  isPending: boolean
  onConfirm: () => void
  onOpenChange: (open: boolean) => void
}

export function DeleteUserDialog({
  user,
  isPending,
  onConfirm,
  onOpenChange,
}: DeleteUserDialogProps) {
  return (
    <Dialog open={user !== null} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="size-5 text-destructive" />
            Eliminar socio
          </DialogTitle>
          <DialogDescription>
            {user
              ? `¿Seguro que querés eliminar a ${user.name} ${user.lastname}? Esta acción no se puede deshacer.`
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
                <Loader2 className="size-3.5 animate-spin mr-2" />
                Eliminando...
              </>
            ) : (
              <>
                <Trash2 className="size-3.5 mr-2" />
                Eliminar
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
