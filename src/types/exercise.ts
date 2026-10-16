import type { GrupoMuscular } from './enums'

/** Espejo de `ExerciseResponse`. */
export interface Exercise {
  id: number
  name: string
  description: string | null
  muscular_group: GrupoMuscular
}

/** Espejo de `ExerciseCreate`. */
export interface ExerciseCreate {
  name: string
  description?: string | null
  muscular_group: GrupoMuscular
}

/** `ExerciseUpdate` (Etapa 2 del plan de la API). */
export type ExerciseUpdate = Partial<ExerciseCreate>
