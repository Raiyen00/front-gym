import { Edit, MoreHorizontal, Trash2 } from 'lucide-react'

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
import { groupExercisesByDay } from '@/features/routines/grouping'
import { GRUPO_MUSCULAR_LABELS } from '@/types/enums'
import type { RoutineExercise } from '@/types/routine'

interface RoutineExercisesByDayProps {
  exercises: RoutineExercise[]
  canManage: boolean
  onEdit: (exerciseRow: RoutineExercise) => void
  onDelete: (exerciseRow: RoutineExercise) => void
}

export function RoutineExercisesByDay({
  exercises,
  canManage,
  onEdit,
  onDelete,
}: RoutineExercisesByDayProps) {
  const groups = groupExercisesByDay(exercises)

  return (
    <div className="flex flex-col gap-4">
      {groups.map((group) => (
        <section
          key={group.day}
          className="overflow-hidden rounded-xl bg-card"
        >
          <header className="flex items-center justify-between border-b border-border px-5 py-3.5">
            <h2 className="font-display text-[0.9375rem] font-semibold tracking-[-0.015em] text-foreground">
              {group.label}
            </h2>
            <span className="num text-xs text-text-muted">
              {group.exercises.length}{' '}
              {group.exercises.length === 1 ? 'ejercicio' : 'ejercicios'}
            </span>
          </header>

          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="num w-12 pl-5 text-right">#</TableHead>
                <TableHead>Ejercicio</TableHead>
                <TableHead className="num text-right">Series × reps</TableHead>
                <TableHead className="num hidden text-right sm:table-cell">
                  Descanso
                </TableHead>
                {canManage && (
                  <TableHead className="w-12 pr-5 text-right">
                    <span className="sr-only">Acciones</span>
                  </TableHead>
                )}
              </TableRow>
            </TableHeader>
            <TableBody>
              {group.exercises.map((exerciseRow) => (
                <TableRow key={exerciseRow.id}>
                  <TableCell className="num pr-1 pl-5 text-right text-xs text-text-muted">
                    {exerciseRow.position}
                  </TableCell>
                  <TableCell className="min-w-0 whitespace-normal">
                    <p className="text-[0.875rem] font-medium text-foreground">
                      {exerciseRow.exercise.name}
                    </p>
                    <div className="mt-1 flex flex-wrap items-center gap-2">
                      <Badge variant="outline">
                        {GRUPO_MUSCULAR_LABELS[
                          exerciseRow.exercise.muscular_group
                        ] || exerciseRow.exercise.muscular_group}
                      </Badge>
                      <span className="num text-[0.8125rem] text-text-muted sm:hidden">
                        {exerciseRow.rest} s de descanso
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="num text-right text-[0.875rem] text-foreground">
                    {exerciseRow.sets} × {exerciseRow.repetitions}
                  </TableCell>
                  <TableCell className="num hidden text-right text-[0.8125rem] text-muted-foreground sm:table-cell">
                    {exerciseRow.rest} s
                  </TableCell>
                  {canManage && (
                    <TableCell className="pr-5 text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            aria-label={`Acciones de ${exerciseRow.exercise.name}`}
                          >
                            <MoreHorizontal
                              className="size-4"
                              strokeWidth={1.75}
                            />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => onEdit(exerciseRow)}>
                            <Edit className="size-4" />
                            Editar
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            variant="destructive"
                            onClick={() => onDelete(exerciseRow)}
                          >
                            <Trash2 className="size-4" />
                            Quitar
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </section>
      ))}
    </div>
  )
}
