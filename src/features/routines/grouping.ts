import { DIAS_SEMANA, DIA_SEMANA_LABELS, type DiaSemana } from '@/types/enums'
import type { RoutineExercise } from '@/types/routine'

export interface RoutineDayGroup {
  day: DiaSemana
  label: string
  exercises: RoutineExercise[]
}

/**
 * Agrupa por día en orden lunes -> domingo y ordena cada grupo por `position`.
 * No se confía en el orden del backend: SQL ordena `day` alfabéticamente.
 */
export function groupExercisesByDay(
  exercises: RoutineExercise[],
): RoutineDayGroup[] {
  return DIAS_SEMANA.map((day) => ({
    day,
    label: DIA_SEMANA_LABELS[day],
    exercises: exercises
      .filter((exercise) => exercise.day === day)
      .slice()
      .sort((a, b) => a.position - b.position),
  })).filter((group) => group.exercises.length > 0)
}
