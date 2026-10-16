import type { ReactNode } from 'react'
import { CheckCircle2, Loader2, Trash2, User as UserIcon } from 'lucide-react'
import { format } from 'date-fns'

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
import { useUser } from '@/features/users/queries'
import { USER_STATE_LABELS, ROL_LABELS } from '@/types/enums'
import { getErrorMessage } from '@/features/auth/utils'
import type { User } from '@/types/user'

interface UserDetailDialogProps {
  userId: number | null
  canManage: boolean
  onEnable: (user: User) => void
  onDelete: (user: User) => void
  onOpenChange: (open: boolean) => void
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-border/50 pb-2 last:border-0 last:pb-0">
      <span className="text-muted-foreground">{label}</span>
      <span className="text-right font-medium">{children}</span>
    </div>
  )
}

export function UserDetailDialog({
  userId,
  canManage,
  onEnable,
  onDelete,
  onOpenChange,
}: UserDetailDialogProps) {
  const { data: user, isLoading, error } = useUser(userId ?? 0)

  return (
    <Dialog open={userId !== null} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserIcon className="size-5 text-primary" />
            Detalle del socio
          </DialogTitle>
          <DialogDescription>
            {user ? `ID ${user.id}` : 'Información registrada'}
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="size-6 animate-spin text-primary" />
          </div>
        ) : error ? (
          <div className="py-4 text-sm text-destructive">{getErrorMessage(error)}</div>
        ) : user ? (
          <div className="grid gap-3 text-sm">
            <Field label="Nombre">{user.name}</Field>
            <Field label="Apellido">{user.lastname}</Field>
            <Field label="Email">{user.email}</Field>
            <Field label="DNI">
              <span className="font-mono">{user.dni}</span>
            </Field>
            <Field label="Teléfono">{user.phone || '-'}</Field>
            <Field label="Rol">
              <Badge variant="outline">{ROL_LABELS[user.rol] || user.rol}</Badge>
            </Field>
            <Field label="Estado">
              <Badge variant="secondary">{USER_STATE_LABELS[user.state] || user.state}</Badge>
            </Field>
            <Field label="Registrado">
              {format(new Date(user.register_date), 'dd/MM/yyyy')}
            </Field>
          </div>
        ) : null}

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Cerrar
          </Button>
          {canManage && user && user.state !== 'habilitado_entrenar' && (
            <Button type="button" onClick={() => onEnable(user)}>
              <CheckCircle2 className="size-3.5 mr-2" />
              Habilitar
            </Button>
          )}
          {canManage && user && (
            <Button type="button" variant="destructive" onClick={() => onDelete(user)}>
              <Trash2 className="size-3.5 mr-2" />
              Eliminar
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
