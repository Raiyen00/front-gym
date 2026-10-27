import { Link } from 'react-router-dom'
import { Eye, MoreHorizontal, Power, Trash2 } from 'lucide-react'

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
import { formatDateOnly } from '@/features/routines/dates'
import type { Routine } from '@/types/routine'

interface RoutinesTableProps {
  routines: Routine[]
  getUserLabel: (userId: number) => string
  onToggleState: (routine: Routine) => void
  onDelete: (routine: Routine) => void
}

export function RoutinesTable({
  routines,
  getUserLabel,
  onToggleState,
  onDelete,
}: RoutinesTableProps) {
  if (routines.length === 0) {
    return (
      <div className="flex flex-col items-center gap-1.5 px-6 py-14 text-center">
        <p className="text-[0.875rem] font-medium text-foreground">
          No hay rutinas para mostrar
        </p>
        <p className="text-[0.8125rem] text-muted-foreground">
          Probá con otra búsqueda o creá una rutina nueva.
        </p>
      </div>
    )
  }

  return (
    <Table>
      <TableHeader>
        <TableRow className="hover:bg-transparent">
          <TableHead className="pl-5">Socio</TableHead>
          <TableHead className="num hidden text-right sm:table-cell">
            Fecha
          </TableHead>
          <TableHead>Estado</TableHead>
          <TableHead className="w-12 pr-5 text-right">
            <span className="sr-only">Acciones</span>
          </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {routines.map((routine) => (
          <TableRow key={routine.id}>
            <TableCell className="min-w-0 pl-5 whitespace-normal">
              <p className="text-[0.875rem] font-medium text-foreground">
                {getUserLabel(routine.user_id)}
              </p>
              <p className="num mt-0.5 text-[0.8125rem] text-text-muted">
                Rutina #{routine.id} · {formatDateOnly(routine.date_generated)}
              </p>
            </TableCell>
            <TableCell className="num hidden text-right text-[0.8125rem] text-muted-foreground sm:table-cell">
              {formatDateOnly(routine.date_generated)}
            </TableCell>
            <TableCell>
              <Badge variant={routine.state ? 'default' : 'outline'}>
                {routine.state ? 'Activa' : 'Inactiva'}
              </Badge>
            </TableCell>
            <TableCell className="pr-5 text-right">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    aria-label={`Acciones de la rutina ${routine.id}`}
                  >
                    <MoreHorizontal className="size-4" strokeWidth={1.75} />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem asChild>
                    <Link to={`/rutinas/${routine.id}`}>
                      <Eye className="size-4" />
                      Ver detalle
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onToggleState(routine)}>
                    <Power className="size-4" />
                    {routine.state ? 'Desactivar' : 'Activar'}
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    variant="destructive"
                    onClick={() => onDelete(routine)}
                  >
                    <Trash2 className="size-4" />
                    Eliminar
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
