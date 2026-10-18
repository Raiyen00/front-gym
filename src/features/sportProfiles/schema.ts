import { z } from 'zod'

const integerInRange = (min: number, max: number | null, message: string) =>
  z
    .string()
    .trim()
    .regex(/^\d+$/, message)
    .refine(
      (value) => {
        const n = Number(value)
        return n >= min && (max === null || n <= max)
      },
      { message },
    )

/**
 * Validaciones alineadas al contrato de `SportProfileCreate` / `SportProfileUpdate`
 * del back: days_per_week 1-7, age 11-100, session_duration en MINUTOS, goal 3-100,
 * level 3-50, injuries hasta 255 (o vacío → se envía `null`).
 *
 * Los campos numéricos se manejan como string en el formulario y se convierten a
 * number al construir el payload (evita fricción de tipos de `z.coerce` con RHF).
 */
export const sportProfileFormSchema = z.object({
  goal: z
    .string()
    .trim()
    .min(3, 'Mínimo 3 caracteres')
    .max(100, 'Máximo 100 caracteres'),
  level: z
    .string()
    .trim()
    .min(3, 'Mínimo 3 caracteres')
    .max(50, 'Máximo 50 caracteres'),
  days_per_week: integerInRange(1, 7, 'Entre 1 y 7 días'),
  session_duration: integerInRange(1, null, 'Debe ser mayor a 0 minutos'),
  age: integerInRange(11, 100, 'La edad debe estar entre 11 y 100'),
  injuries: z
    .string()
    .trim()
    .max(255, 'Máximo 255 caracteres')
    .optional(),
  trainer_tracking: z.boolean(),
})

export type SportProfileFormValues = z.infer<typeof sportProfileFormSchema>
