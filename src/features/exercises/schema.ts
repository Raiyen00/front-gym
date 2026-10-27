import { z } from 'zod'

import { GRUPOS_MUSCULARES } from '@/types/enums'

/**
 * Validaciones alineadas a `ExerciseCreate` / `ExerciseUpdate`.
 * El Select arranca vacío (`''`), por eso el grupo se valida con union + refine.
 * Los máximos de nombre/descripción son preventivos: el backend responde 422.
 */
export const exerciseFormSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(1, 'Ingresá un nombre')
      .max(100, 'Máximo 100 caracteres'),
    description: z
      .string()
      .trim()
      .max(500, 'Máximo 500 caracteres')
      .optional(),
    muscular_group: z.union([
      z.literal(''),
      z.enum(GRUPOS_MUSCULARES, { message: 'Elegí un grupo muscular' }),
    ]),
  })
  .refine((values) => values.muscular_group !== '', {
    path: ['muscular_group'],
    message: 'Elegí un grupo muscular',
  })

export type ExerciseFormValues = z.infer<typeof exerciseFormSchema>
