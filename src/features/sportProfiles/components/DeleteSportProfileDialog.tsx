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
import type { SportProfile } from '@/types/sportProfile'

interface DeleteSportProfileDialogProps {
  profile: SportProfile | null
  isPending: boolean
  onConfirm: () => void
  onOpenChange: (open: boolean) => void
}

export function DeleteSportProfileDialog({
  profile,
  isPending,
  onConfirm,
  onOpenChange,
}: DeleteSportProfileDialogProps) {
  return (
    <Dialog open={profile !== null} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="size-5 text-destructive" />
            Eliminar perfil deportivo
          </DialogTitle>
          <DialogDescription>
            {profile
              ? `¿Seguro que querés eliminar el perfil deportivo #${profile.id}? Esta acción no se puede deshacer.`
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
