import { ApiError } from '@/lib/api/client'

/** Mensaje legible a partir de un error lanzado por el cliente API. */
export function getErrorMessage(error: unknown): string {
  if (error instanceof ApiError) return error.message
  return 'Ocurrió un problema de comunicación con el servidor.'
}
