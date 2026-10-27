import type { ExerciseFormValues } from '@/features/exercises/schema'
import type { GrupoMuscular } from '@/types/enums'
import type { ExerciseCreate } from '@/types/exercise'

/**
 * Construye el body de POST/PATCH. `name` y `description` llegan ya trimmeados
 * (nunca `undefined`); una descripción vacía se envía como `null`.
 */
export function buildExercisePayload(values: ExerciseFormValues): ExerciseCreate {
  const description = values.description?.trim()

  return {
    name: values.name.trim(),
    description: description ? description : null,
    muscular_group: values.muscular_group as GrupoMuscular,
  }
}
