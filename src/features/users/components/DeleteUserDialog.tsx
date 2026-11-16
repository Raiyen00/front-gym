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
            Dar de baja
          </DialogTitle>
          <DialogDescription>
            {user
              ? `¿Seguro que querés dar de baja a ${user.name} ${user.lastname}? El socio no va a poder operar, pero su historial se conserva y podés reactivarlo desde la lista con "Habilitar".`
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
                Dando de baja...
              </>
            ) : (
              <>
                <Trash2 className="size-3.5 mr-2" />
                Dar de baja
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
