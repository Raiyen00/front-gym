import { Edit, Eye, MoreHorizontal, Trash2 } from 'lucide-react'

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
import { GRUPO_MUSCULAR_LABELS } from '@/types/enums'
import type { Exercise } from '@/types/exercise'

interface ExercisesTableProps {
  exercises: Exercise[]
  onView: (exercise: Exercise) => void
  onEdit: (exercise: Exercise) => void
  onDelete: (exercise: Exercise) => void
}

export function ExercisesTable({
  exercises,
  onView,
  onEdit,
  onDelete,
}: ExercisesTableProps) {
  if (exercises.length === 0) {
    return (
      <div className="flex flex-col items-center gap-1.5 px-6 py-14 text-center">
        <p className="text-[0.875rem] font-medium text-foreground">
          No hay ejercicios para mostrar
        </p>
        <p className="text-[0.8125rem] text-muted-foreground">
          Probá con otro grupo muscular o creá un ejercicio nuevo.
        </p>
      </div>
    )
  }

  return (
    <Table>
      <TableHeader>
        <TableRow className="hover:bg-transparent">
          <TableHead className="pl-5">Ejercicio</TableHead>
          <TableHead>Grupo muscular</TableHead>
          <TableHead className="hidden lg:table-cell">Descripción</TableHead>
          <TableHead className="w-12 pr-5 text-right">
            <span className="sr-only">Acciones</span>
          </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {exercises.map((exercise) => (
          <TableRow key={exercise.id}>
            <TableCell className="pl-5">
              <p className="text-[0.875rem] font-medium text-foreground">
                {exercise.name}
              </p>
              <p className="mt-0.5 line-clamp-1 text-[0.8125rem] text-text-muted lg:hidden">
                {exercise.description || 'Sin descripción'}
              </p>
            </TableCell>
            <TableCell>
              <Badge variant="outline">
                {GRUPO_MUSCULAR_LABELS[exercise.muscular_group] || exercise.muscular_group}
              </Badge>
            </TableCell>
            <TableCell className="hidden max-w-[28rem] text-[0.8125rem] text-muted-foreground lg:table-cell">
              <span className="line-clamp-2">{exercise.description || '—'}</span>
            </TableCell>
            <TableCell className="pr-5 text-right">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    aria-label={`Acciones de ${exercise.name}`}
                  >
                    <MoreHorizontal className="size-4" strokeWidth={1.75} />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => onView(exercise)}>
                    <Eye className="size-4" />
                    Ver
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onEdit(exercise)}>
                    <Edit className="size-4" />
                    Editar
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    variant="destructive"
                    onClick={() => onDelete(exercise)}
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
