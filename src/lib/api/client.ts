import { getApiBaseUrl, TIMEOUT_MS } from '@/lib/api/config'
import { getToken } from '@/lib/storage'
import type { ApiErrorPayload, ValidationErrorDetail } from '@/types/api'

export class ApiError extends Error {
  readonly status?: number
  readonly isNetworkError: boolean
  readonly detail?: ApiErrorPayload['detail']

  constructor(
    message: string,
    options: {
      status?: number
      isNetworkError?: boolean
      detail?: ApiErrorPayload['detail']
    } = {},
  ) {
    super(message)
    this.name = 'ApiError'
    this.status = options.status
    this.isNetworkError = options.isNetworkError ?? false
    this.detail = options.detail
  }
}

export interface RequestOptions extends Omit<RequestInit, 'body'> {
  /** Cuerpo: objeto (se serializa a JSON), string, URLSearchParams o FormData. */
  body?: unknown
  /** Adjuntar token Bearer (por defecto true). */
  auth?: boolean
}

type UnauthorizedHandler = () => void

let unauthorizedHandler: UnauthorizedHandler | null = null

/** Registra el manejador global para respuestas 401 en peticiones autenticadas. */
export function onUnauthorized(handler: UnauthorizedHandler | null): void {
  unauthorizedHandler = handler
}

function isJsonBody(body: unknown): boolean {
  return (
    body !== undefined &&
    !(body instanceof URLSearchParams) &&
    !(body instanceof FormData) &&
    typeof body !== 'string'
  )
}

function buildHeaders(options: RequestOptions): Headers {
  const headers = new Headers(options.headers)
  if (options.body !== undefined && isJsonBody(options.body)) {
    headers.set('Content-Type', 'application/json')
  }
  if (options.auth !== false) {
    const token = getToken()
    if (token && !headers.has('Authorization')) {
      headers.set('Authorization', `Bearer ${token}`)
    }
  }
  return headers
}

function parseValidationErrors(detail: ValidationErrorDetail[]): string {
  return detail
    .map((error) => {
      const field = error.loc?.length ? error.loc[error.loc.length - 1] : 'campo'
      return `${field}: ${error.msg}`
    })
    .join(' | ')
}

async function parseErrorPayload(response: Response): Promise<ApiErrorPayload> {
  try {
    return (await response.json()) as ApiErrorPayload
  } catch {
    return {}
  }
}

function errorMessageFor(status: number, detail?: ApiErrorPayload['detail']): string {
  if (typeof detail === 'string' && detail.trim()) return detail
  if (status === 422 && Array.isArray(detail)) {
    return `Error de validación: ${parseValidationErrors(detail)}`
  }
  switch (status) {
    case 401:
      return 'Tu sesión expiró o las credenciales son incorrectas.'
    case 403:
      return 'No tenés permisos para realizar esta operación.'
    case 404:
      return 'El recurso solicitado no existe.'
    case 409:
      return 'El recurso ya existe o está duplicado.'
    case 422:
      return 'Datos inválidos enviados al servidor.'
    default:
      return `Error en el servidor (HTTP ${status}).`
  }
}

/**
 * Petición HTTP base con fetch() hacia la API FastAPI.
 * Lanza `ApiError` ante cualquier respuesta no exitosa o error de red.
 */
export async function request<T>(
  endpoint: string,
  options: RequestOptions = {},
): Promise<T> {
  const baseUrl = getApiBaseUrl()
  const url = `${baseUrl}${endpoint}`
  const headers = buildHeaders(options)
  const hadToken = headers.has('Authorization')

  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS)

  let body: BodyInit | undefined
  if (options.body !== undefined) {
    body = isJsonBody(options.body)
      ? JSON.stringify(options.body)
      : (options.body as BodyInit)
  }

  let response: Response
  try {
    response = await fetch(url, {
      ...options,
      headers,
      body,
      signal: options.signal ?? controller.signal,
    })
  } catch (error) {
    clearTimeout(timeoutId)
    const aborted = error instanceof DOMException && error.name === 'AbortError'
    throw new ApiError(
      aborted
        ? `La petición a ${baseUrl} tardó demasiado (timeout de ${TIMEOUT_MS / 1000}s).`
        : `No se pudo conectar con la API en ${baseUrl}. Asegurate de que el servidor FastAPI esté levantado y tenga CORS habilitado.`,
      { isNetworkError: true },
    )
  } finally {
    clearTimeout(timeoutId)
  }

  if (response.status === 204) {
    return undefined as T
  }

  if (!response.ok) {
    const payload = await parseErrorPayload(response)
    if (response.status === 401 && hadToken) {
      unauthorizedHandler?.()
    }
    throw new ApiError(errorMessageFor(response.status, payload.detail), {
      status: response.status,
      detail: payload.detail,
    })
  }

  const contentType = response.headers.get('Content-Type') ?? ''
  if (contentType.includes('application/json')) {
    return (await response.json()) as T
  }

  return (await response.text()) as T
}
