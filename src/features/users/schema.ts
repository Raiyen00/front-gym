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

export const userCreateSchema = z
  .object({
    name: z
      .string()
      .min(3, 'Mínimo 3 caracteres')
      .max(100, 'Máximo 100 caracteres'),
    lastname: z
      .string()
      .min(3, 'Mínimo 3 caracteres')
      .max(100, 'Máximo 100 caracteres'),
    dni: z
      .string()
      .regex(/^\d{7,8}$/, 'Ingresá 7 u 8 dígitos sin puntos'),
    phone: z
      .string()
      .min(9, 'Mínimo 9 dígitos')
      .max(15, 'Máximo 15 dígitos'),
    email: z.email('Ingresá un correo electrónico válido'),
    password: z
      .string()
      .min(8, 'La contraseña debe tener al menos 8 caracteres')
      .max(128, 'Máximo 128 caracteres'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    path: ['confirmPassword'],
    message: 'Las contraseñas no coinciden',
  })

export type UserCreateFormValues = z.infer<typeof userCreateSchema>