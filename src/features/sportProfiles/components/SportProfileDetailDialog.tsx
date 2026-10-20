import { Activity, Loader2, Pencil, Trash2 } from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { useSportProfile } from '@/features/sportProfiles/queries'
import { SportProfileDetails } from '@/features/sportProfiles/components/SportProfileDetails'
import { getErrorMessage } from '@/features/auth/utils'

interface SportProfileDetailDialogProps {
  profileId: number | null
  getUserLabel: (userId: number) => string
  onEdit: (profileId: number) => void
  onDelete: (profileId: number) => void
  onOpenChange: (open: boolean) => void
}

export function SportProfileDetailDialog({
  profileId,
  getUserLabel,
  onEdit,
  onDelete,
  onOpenChange,
}: SportProfileDetailDialogProps) {
  const { data: profile, isLoading, error } = useSportProfile(profileId ?? 0)

  return (
    <Dialog open={profileId !== null} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Activity className="size-5 text-primary" />
            Detalle del perfil deportivo
          </DialogTitle>
          <DialogDescription>{profile ? `ID ${profile.id}` : 'Información registrada'}</DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="size-6 animate-spin text-primary" />
          </div>
        ) : error ? (
          <div className="py-4 text-sm text-destructive">{getErrorMessage(error)}</div>
        ) : profile ? (
          <SportProfileDetails profile={profile} userLabel={getUserLabel(profile.user_id)} />
        ) : null}

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Cerrar
          </Button>
          {profile && (
            <Button type="button" onClick={() => onEdit(profile.id)}>
              <Pencil className="size-3.5 mr-2" />
              Editar
            </Button>
          )}
          {profile && (
            <Button type="button" variant="destructive" onClick={() => onDelete(profile.id)}>
              <Trash2 className="size-3.5 mr-2" />
              Eliminar
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
