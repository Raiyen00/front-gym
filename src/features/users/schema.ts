import { z } from 'zod'

export const userUpdateSchema = z.object({
  name: z
    .string()
    .min(3, 'Mínimo 3 caracteres')
    .max(100, 'Máximo 100 caracteres')
    .optional(),
  lastname: z
    .string()
    .min(3, 'Mínimo 3 caracteres')
    .max(100, 'Máximo 100 caracteres')
    .optional(),
  dni: z
    .string()
    .regex(/^\d{7,8}$/, 'Ingresá 7 u 8 dígitos sin puntos')
    .optional(),
  phone: z
    .string()
    .min(9, 'Mínimo 9 dígitos')
    .max(15, 'Máximo 15 dígitos')
    .optional(),
  email: z.email('Ingresá un correo electrónico válido').optional(),
})

export type UserUpdateFormValues = z.infer<typeof userUpdateSchema>