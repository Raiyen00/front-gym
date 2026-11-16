import { getErrorMessage } from '@/features/auth/utils'
import { ApiError } from '@/lib/api/client'
import type { User } from '@/types/user'

const DUPLICATE_EMAIL_MESSAGE =
  'Ya existe un socio con ese email. Si lo diste de baja, buscalo en la lista y tocá "Habilitar".'

const DUPLICATE_DNI_MESSAGE =
  'Ya existe un socio con ese DNI. Si lo diste de baja, buscalo en la lista y tocá "Habilitar".'

const DUPLICATE_GENERIC_MESSAGE =
  'Ya existe un socio con esos datos. Buscalo en la lista en lugar de crear una cuenta nueva.'

/**
 * Mensaje del alta de socio. El 409 de la API (`Ya existe un usuario con ese
 * email/DNI`) se traduce a una acción concreta: buscar al socio en la lista y
 * reactivarlo en vez de crear una cuenta nueva. Para el resto de los errores se
 * conserva el detail del backend.
 */
export function getCreateUserErrorMessage(error: unknown): string {
  if (error instanceof ApiError && error.status === 409) {
    const detail = typeof error.detail === 'string' ? error.detail.toLowerCase() : ''
    if (detail.includes('dni')) return DUPLICATE_DNI_MESSAGE
    if (detail.includes('email') || detail.includes('correo')) return DUPLICATE_EMAIL_MESSAGE
    return DUPLICATE_GENERIC_MESSAGE
  }

  return getErrorMessage(error)
}

/**
 * Busca un socio dado de baja (`state` = `inactivo`) por email, sin distinguir
 * mayúsculas ni espacios. Se usa para avisar en el alta que conviene reactivar
 * al socio existente.
 */
export function findInactiveUserByEmail(
  users: User[] | undefined,
  email: string,
): User | undefined {
  const needle = email.trim().toLowerCase()
  if (!needle) return undefined

  return users?.find(
    (candidate) =>
      candidate.state === 'inactivo' &&
      candidate.email.trim().toLowerCase() === needle,
  )
}
