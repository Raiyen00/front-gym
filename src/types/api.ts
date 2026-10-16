/**
 * Tipos transversales de la API.
 */

/** Error de validación de Pydantic (HTTP 422). */
export interface ValidationErrorDetail {
  loc: (string | number)[]
  msg: string
  type: string
}

/** Cuerpo de error estándar de FastAPI en respuestas 4xx/5xx. */
export interface ApiErrorPayload {
  detail?: string | ValidationErrorDetail[]
}

/**
 * Respuesta paginada. Forma tentativa (la API aún no expone paginación;
 * ver plan.md de la API, Etapa 6).
 */
export interface Paginated<T> {
  items: T[]
  total: number
  skip: number
  limit: number
}
