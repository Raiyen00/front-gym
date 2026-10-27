import { z } from 'zod'

import { DIAS_SEMANA } from '@/types/enums'

const integerString = (message: string, minimum: number) =>
  z
    .string()
    .trim()
    .min(1, message)
    .refine(
      (value) => /^\d+$/.test(value) && Number(value) >= minimum,
      message,
    )

/**
 * Alta de rutina: `date_generated` es obligatorio en el contrato de la API.
 * El estado no se elige acá: la rutina nace activa y después se desactiva
 * desde el listado o el detalle con `PATCH /routines/{id}`.
 */
export const routineFormSchema = z.object({
  user_id: z.string().trim().min(1, 'Elegí un socio'),
  date_generated: z
    .string()
    .trim()
    .min(1, 'Seleccioná la fecha')
    .refine((value) => !Number.isNaN(Date.parse(value)), 'Fecha inválida'),
})

export type RoutineFormValues = z.infer<typeof routineFormSchema>

/**
 * Renglón de rutina. Los numéricos se manejan como string en el formulario y
 * se convierten en `payload.ts`. La posición es obligatoria desde 1.
 * `exercise_id` es opcional en PATCH para permitir cambiar el ejercicio
 * sin borrar el renglón.
 */
export const routineExerciseFormSchema = z
  .object({
    exercise_id: z
      .string()
      .trim()
      .min(1, 'Elegí un ejercicio')
      .optional(),
    day: z.union([
      z.literal(''),
      z.enum(DIAS_SEMANA, { message: 'Elegí un día' }),
    ]),
    sets: integerString('Ingresá una cantidad de series mayor a 0', 1),
    repetitions: z
      .string()
      .trim()
      .min(1, 'Ingresá las repeticiones')
      .max(20, 'Máximo 20 caracteres'),
    rest: integerString('Ingresá un descanso en segundos (0 o más)', 0),
    position: integerString('Ingresá una posición desde 1', 1),
  })
  .refine((values) => values.day !== '', {
    path: ['day'],
    message: 'Elegí un día',
  })

export type RoutineExerciseFormValues = z.infer<
  typeof routineExerciseFormSchema
>