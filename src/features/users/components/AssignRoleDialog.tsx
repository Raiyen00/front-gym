import { useState } from 'react'
import { Loader2, ShieldCheck } from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { ROLES, ROL_LABELS, type Rol } from '@/types/enums'
import type { User } from '@/types/user'

interface AssignRoleDialogProps {
  /** `null` => diálogo cerrado. */
  user: User | null
  isPending: boolean
  onSubmit: (rol: Rol) => void | Promise<void>
  onOpenChange: (open: boolean) => void
}

export function AssignRoleDialog({
  user,
  isPending,
  onSubmit,
  onOpenChange,
}: AssignRoleDialogProps) {
  const [rol, setRol] = useState<Rol>(user?.rol ?? 'cliente')

  const unchanged = user !== null && rol === user.rol

  return (
    <Dialog open={user !== null} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ShieldCheck className="size-4 text-text-muted" strokeWidth={1.75} />
            Asignar rol
          </DialogTitle>
          <DialogDescription>
            {user
              ? `${user.name} ${user.lastname} — hoy es ${ROL_LABELS[user.rol]}.`
              : ''}
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-2">
          <Label htmlFor="assign-role">Rol</Label>
          <Select
            value={rol}
            onValueChange={(value) => setRol(value as Rol)}
            disabled={isPending}
          >
            <SelectTrigger id="assign-role" className="w-full">
              <SelectValue placeholder="Elegí un rol" />
            </SelectTrigger>
            <SelectContent>
              {ROLES.map((option) => (
                <SelectItem key={option} value={option}>
                  {ROL_LABELS[option]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="text-[0.8125rem] text-muted-foreground">
            Cambiar el rol no modifica el estado de habilitación: para eso usá
            “Habilitar”. Un socio pasado a profesor accede al panel de gestión.
          </p>
        </div>

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
            onClick={() => onSubmit(rol)}
            disabled={isPending || unchanged}
          >
            {isPending ? (
              <>
                <Loader2 className="size-3.5 animate-spin" />
                Guardando...
              </>
            ) : (
              <>
                <ShieldCheck className="size-3.5" />
                Asignar rol
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
