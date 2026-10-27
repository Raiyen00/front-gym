import type { UserUpdateFormValues } from '@/features/users/schema'
import type { UserUpdate } from '@/types/user'

/** Campos de RHF marcados como modificados respecto de los valores iniciales. */
export type UserUpdateDirtyFields = Partial<
  Record<keyof UserUpdateFormValues, boolean>
>

/**
 * Arma el body parcial de `PATCH /users/{id}` con **solo** los campos modificados.
 * Lo usan la edición de socio (admin) y "Mi perfil" (cliente).
 */
export function buildUserUpdate(
  values: UserUpdateFormValues,
  dirty: UserUpdateDirtyFields,
): UserUpdate {
  const payload: UserUpdate = {}
  if (dirty.name) payload.name = values.name
  if (dirty.lastname) payload.lastname = values.lastname
  if (dirty.dni) payload.dni = values.dni
  if (dirty.phone) payload.phone = values.phone
  if (dirty.email) payload.email = values.email
  return payload
}
