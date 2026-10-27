import type { DiaSemana } from './enums'
import type { Exercise } from './exercise'

/** Espejo de `RoutineExerciseDetail`. */
export interface RoutineExercise {
  id: number
  /** Presente en las respuestas del backend; opcional para fixtures. */
  routine_id?: number
  exercise_id?: number
  day: DiaSemana
  sets: number
  repetitions: string
  position: number
  rest: number
  /** La API siempre lo devuelve anidado (selectinload). */
  exercise: Exercise
}

/** Espejo de `RoutineExerciseResponse`. */
export interface RoutineExerciseResponse {
  id: number
  routine_id: number
  exercise_id: number
  day: DiaSemana
  sets: number
  repetitions: string
  position: number
  rest: number
  exercise: Exercise
}

/** Espejo de `RoutineResponse`. */
export interface Routine {
  id: number
  user_id: number
  /** ISO date (YYYY-MM-DD) */
  date_generated: string
  state: boolean
}

/** Espejo de `RoutineDetailResponse`. */
export interface RoutineDetail extends Routine {
  exercises: RoutineExercise[]
}

/** Espejo de `RoutineCreate`. */
export interface RoutineCreate {
  user_id: number
  date_generated: string
  state?: boolean
}

/** `RoutineUpdate` (Etapa 4 del plan de la API). */
export interface RoutineUpdate {
  date_generated?: string
  state?: boolean
}

/** Body de POST /routines/{routine_id}/exercises.
 *  El `routine_id` viene ÚNICAMENTE en la URL, NO en el body. */
export interface RoutineExerciseCreate {
  exercise_id: number
  day: string
  sets: number
  repetitions: string
  position: number
  rest: number
}

/** `RoutineExerciseUpdate` (Etapa 4 del plan de la API).
 *  `exercise_id` es opcional: permite cambiar el ejercicio del renglón sin borrarlo. */
export interface RoutineExerciseUpdate {
  exercise_id?: number
  day?: string
  sets?: number
  repetitions?: string
  position?: number
  rest?: number
}
