import type { Exercise } from './exercise'

/** Espejo de `RoutineExerciseDetail`. */
export interface RoutineExercise {
  id: number
  day: string
  sets: number
  repetitions: string
  position: number
  rest: number
  exercise_id: number
  /** Anidado cuando la API lo incluya (Etapa 4 del plan de la API). */
  exercise?: Exercise
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

/** Espejo de `RoutineExerciseCreate`. */
export interface RoutineExerciseCreate {
  routine_id: number
  exercise_id: number
  day: string
  sets: number
  repetitions: string
  position: number
  rest: number
}

/** `RoutineExerciseUpdate` (Etapa 4 del plan de la API). */
export type RoutineExerciseUpdate = Partial<Omit<RoutineExerciseCreate, 'routine_id'>>
