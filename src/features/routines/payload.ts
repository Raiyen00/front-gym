import type { DiaSemana } from '@/types/enums'
import type {
  RoutineCreate,
  RoutineExercise,
  RoutineExerciseCreate,
  RoutineExerciseUpdate,
} from '@/types/routine'
import type {
  RoutineExerciseFormValues,
  RoutineFormValues,
} from '@/features/routines/schema'

/**
 * Body de POST /routines. `date_generated` viaja como YYYY-MM-DD.
 * Toda rutina nueva nace activa; desactivarla es una acción aparte.
 */
export function buildRoutineCreate(values: RoutineFormValues): RoutineCreate {
  return {
    user_id: Number(values.user_id),
    date_generated: values.date_generated,
    state: true,
  }
}

/** Body de POST /routines/{id}/exercises (sin `routine_id`). */
export function buildRoutineExerciseCreate(
  values: RoutineExerciseFormValues,
): RoutineExerciseCreate {
  return {
    exercise_id: Number(values.exercise_id),
    day: values.day as DiaSemana,
    sets: Number(values.sets),
    repetitions: values.repetitions.trim(),
    position: Number(values.position),
    rest: Number(values.rest),
  }
}

/**
 * Body de PATCH parcial: solo los campos que cambiaron respecto del renglón
 * original. Incluye opcionalmente `exercise_id` si se quiere cambiar el
 * ejercicio de un renglón sin borrarlo.
 */
export function buildRoutineExerciseUpdate(
  original: RoutineExercise,
  values: RoutineExerciseFormValues,
): RoutineExerciseUpdate {
  const payload: RoutineExerciseUpdate = {}

  if (values.day !== original.day) payload.day = values.day as DiaSemana
  if (Number(values.sets) !== original.sets) payload.sets = Number(values.sets)
  if (values.repetitions.trim() !== original.repetitions) {
    payload.repetitions = values.repetitions.trim()
  }
  if (Number(values.rest) !== original.rest) payload.rest = Number(values.rest)
  if (Number(values.position) !== original.position) {
    payload.position = Number(values.position)
  }
  // NUEVO: permite cambiar el ejercicio sin borrarlo.
  // Comparamos contra el ejercicio anidado original (original.exercise.id)
  if (
    values.exercise_id !== undefined &&
    Number(values.exercise_id) !== Number(original.exercise.id)
  )
    payload.exercise_id = Number(values.exercise_id)

  return payload
}