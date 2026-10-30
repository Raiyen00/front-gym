import { z } from 'zod'

import {
  currentPasswordSchema,
  newPasswordSchema,
} from '@/lib/passwordPolicy'

export const loginSchema = z.object({
  email: z.email('Ingresá un correo electrónico válido'),
  password: z.string().min(1, 'Ingresá tu contraseña'),
})

export type LoginFormValues = z.infer<typeof loginSchema>

export const registerSchema = z
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
    password: newPasswordSchema,
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    path: ['confirmPassword'],
    message: 'Las contraseñas no coinciden',
  })

export type RegisterFormValues = z.infer<typeof registerSchema>

export const changePasswordSchema = z
  .object({
    oldPassword: currentPasswordSchema,
    newPassword: newPasswordSchema,
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    path: ['confirmPassword'],
    message: 'Las contraseñas no coinciden',
  })
  .refine((data) => data.newPassword !== data.oldPassword, {
    path: ['newPassword'],
    message: 'La nueva contraseña debe ser distinta de la actual',
  })

export type ChangePasswordFormValues = z.infer<typeof changePasswordSchema>

/**
 * Cambio de contraseña desde la pantalla de login. Pide el correo porque
 * todavía no hay sesión: se valida con `POST /auth/login` antes del PATCH.
 */
export const loginChangePasswordSchema = z
  .object({
    email: z.email('Ingresá un correo electrónico válido'),
    oldPassword: currentPasswordSchema,
    newPassword: newPasswordSchema,
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    path: ['confirmPassword'],
    message: 'Las contraseñas no coinciden',
  })
  .refine((data) => data.newPassword !== data.oldPassword, {
    path: ['newPassword'],
    message: 'La nueva contraseña debe ser distinta de la actual',
  })

export type LoginChangePasswordFormValues = z.infer<
  typeof loginChangePasswordSchema
>
