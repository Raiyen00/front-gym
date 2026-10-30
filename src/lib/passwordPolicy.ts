import { z } from 'zod'

/** Regla que se muestra junto a los campos de contraseña nueva. */
export const PASSWORD_POLICY_HINT =
  'Mínimo 8 caracteres, al menos una mayúscula y solo letras y números.'

/**
 * Contraseñas nuevas: mínimo 8, máximo 128, alfanuméricas (sin símbolos ni
 * espacios), con al menos una mayúscula y un número.
 */
export const newPasswordSchema = z
  .string()
  .min(8, 'La contraseña debe tener al menos 8 caracteres')
  .max(128, 'Máximo 128 caracteres')
  .regex(/^[A-Za-z0-9]+$/, 'La contraseña solo puede tener letras y números')
  .regex(/[A-Z]/, 'La contraseña debe incluir al menos una mayúscula')
  .regex(/[0-9]/, 'La contraseña debe incluir al menos un número')

/** Contraseña actual: la API solo exige longitud y tope. */
export const currentPasswordSchema = z
  .string()
  .min(8, 'La contraseña actual debe tener al menos 8 caracteres')
  .max(128, 'Máximo 128 caracteres')
