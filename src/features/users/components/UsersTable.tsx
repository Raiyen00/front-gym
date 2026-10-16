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

export function UsersTable({
  users,
  canManage,
  onView,
  onEdit,
  onEnable,
  onDelete,
}: UsersTableProps) {
  const getStateBadge = (state: User['state']) => {
    const labels: Record<User['state'], 'default' | 'secondary' | 'destructive' | 'outline'> = {
      activo: 'default',
      habilitado_entrenar: 'default',
      inactivo: 'destructive',
      pendiente_habilitacion: 'secondary',
    }
    return (
      <Badge variant={labels[state] || 'outline'}>
        {USER_STATE_LABELS[state] || state}
      </Badge>
    )
  }

  const getRoleBadge = (role: User['rol']) => {
    const labels: Record<User['rol'], 'default' | 'secondary' | 'outline'> = {
      admin: 'default',
      profesor: 'secondary',
      cliente: 'outline',
    }
    return (
      <Badge variant={labels[role] || 'outline'}>
        {ROL_LABELS[role] || role}
      </Badge>
    )
  }

  if (users.length === 0) {
    return (
      <div className="flex items-center justify-center py-12 text-muted-foreground">
        No hay socios registrados
      </div>
    )
  }

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Usuario</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>DNI</TableHead>
            <TableHead>Rol</TableHead>
            <TableHead>Estado</TableHead>
            <TableHead>Registrado</TableHead>
            <TableHead className="text-right">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.map((user) => (
            <TableRow key={user.id}>
              <TableCell className="font-medium">
                {user.name} {user.lastname}
              </TableCell>
              <TableCell>{user.email}</TableCell>
              <TableCell className="font-mono">{user.dni}</TableCell>
              <TableCell>{getRoleBadge(user.rol)}</TableCell>
              <TableCell>{getStateBadge(user.state)}</TableCell>
              <TableCell>
                {format(new Date(user.register_date), 'dd/MM/yyyy')}
              </TableCell>
              <TableCell className="text-right">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <MoreHorizontal className="size-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => onView(user)}>
                      <Eye className="size-4 mr-2" />
                      Ver
                    </DropdownMenuItem>
                    {canManage && (
                      <>
                        <DropdownMenuItem onClick={() => onEdit(user)}>
                          <Edit className="size-4 mr-2" />
                          Editar
                        </DropdownMenuItem>
                        {user.state !== 'habilitado_entrenar' && (
                          <DropdownMenuItem onClick={() => onEnable(user)}>
                            <CheckCircle2 className="size-4 mr-2" />
                            Habilitar
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuSeparator />
                        <DropdownMenuItem variant="destructive" onClick={() => onDelete(user)}>
                          <Trash2 className="size-4 mr-2" />
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
    </div>
  )
}