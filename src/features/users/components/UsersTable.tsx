import { CheckCircle2, Edit, Eye, MoreHorizontal, Trash2 } from 'lucide-react'
import { format } from 'date-fns'

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { USER_STATE_LABELS, ROL_LABELS } from '@/types/enums'
import type { User } from '@/types/user'

interface UsersTableProps {
  users: User[]
  canManage: boolean
  onView: (user: User) => void
  onEdit: (user: User) => void
  onEnable: (user: User) => void
  onDelete: (user: User) => void
}

function stateVariant(state: User['state']) {
  switch (state) {
    case 'activo':
    case 'habilitado_entrenar':
      return 'default' as const
    case 'pendiente_habilitacion':
      return 'warning' as const
    default:
      return 'destructive' as const
  }
}

function initials(user: User) {
  return `${user.name?.[0] ?? ''}${user.lastname?.[0] ?? ''}`.toUpperCase() || 'SO'
}

export function UsersTable({
  users,
  canManage,
  onView,
  onEdit,
  onEnable,
  onDelete,
}: UsersTableProps) {
  if (users.length === 0) {
    return (
      <div className="flex flex-col items-center gap-1.5 px-6 py-14 text-center">
        <p className="text-[0.875rem] font-medium text-foreground">
          No hay socios para mostrar
        </p>
        <p className="text-[0.8125rem] text-muted-foreground">
          Probá con otra búsqueda o dá de alta un socio nuevo.
        </p>
      </div>
    )
  }

  return (
    <Table>
      <TableHeader>
        <TableRow className="hover:bg-transparent">
          <TableHead className="pl-5">Socio</TableHead>
          <TableHead className="num hidden text-right md:table-cell">DNI</TableHead>
          <TableHead className="hidden lg:table-cell">Rol</TableHead>
          <TableHead className="hidden sm:table-cell">Estado</TableHead>
          <TableHead className="num hidden text-right sm:table-cell">Alta</TableHead>
          <TableHead className="w-12 pr-5 text-right">
            <span className="sr-only">Acciones</span>
          </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {users.map((user) => (
          <TableRow key={user.id}>
            <TableCell className="pl-5">
              <div className="flex items-center gap-3">
                <span
                  aria-hidden="true"
                  className="flex size-8 shrink-0 items-center justify-center rounded-full bg-surface-elevated text-[0.6875rem] font-semibold text-muted-foreground"
                >
                  {initials(user)}
                </span>
                <div className="min-w-0">
                  <p className="truncate text-[0.875rem] font-medium text-foreground">
                    {user.name} {user.lastname}
                  </p>
                  <p className="truncate text-[0.8125rem] text-text-muted">{user.email}</p>
                  <div className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-1 md:hidden">
                    <p className="num text-[0.8125rem] text-text-muted">
                      DNI {user.dni} · {ROL_LABELS[user.rol] || user.rol}
                    </p>
                    <Badge variant={stateVariant(user.state)} className="sm:hidden">
                      {USER_STATE_LABELS[user.state] || user.state}
                    </Badge>
                  </div>
                </div>
              </div>
            </TableCell>
            <TableCell className="num hidden text-right font-mono text-xs text-muted-foreground md:table-cell">
              {user.dni}
            </TableCell>
            <TableCell className="hidden text-[0.8125rem] text-muted-foreground lg:table-cell">
              {ROL_LABELS[user.rol] || user.rol}
            </TableCell>
            <TableCell className="hidden sm:table-cell">
              <Badge variant={stateVariant(user.state)}>
                {USER_STATE_LABELS[user.state] || user.state}
              </Badge>
            </TableCell>
            <TableCell className="num hidden text-right text-[0.8125rem] text-muted-foreground sm:table-cell">
              {format(new Date(user.register_date), 'dd/MM/yyyy')}
            </TableCell>
            <TableCell className="pr-5 text-right">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    aria-label={`Acciones de ${user.name} ${user.lastname}`}
                  >
                    <MoreHorizontal className="size-4" strokeWidth={1.75} />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => onView(user)}>
                    <Eye className="size-4" />
                    Ver
                  </DropdownMenuItem>
                  {canManage && (
                    <>
                      <DropdownMenuItem onClick={() => onEdit(user)}>
                        <Edit className="size-4" />
                        Editar
                      </DropdownMenuItem>
                      {user.state !== 'habilitado_entrenar' && (
                        <DropdownMenuItem onClick={() => onEnable(user)}>
                          <CheckCircle2 className="size-4" />
                          Habilitar
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuSeparator />
                      <DropdownMenuItem variant="destructive" onClick={() => onDelete(user)}>
                        <Trash2 className="size-4" />
                        Eliminar
                      </DropdownMenuItem>
                    </>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
