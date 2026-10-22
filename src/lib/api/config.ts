/**
 * Configuración global del cliente API.
 * Portado de js/config.js.
 */

const STORAGE_API_URL_KEY = 'gymsass_api_url'
const DEFAULT_API_BASE_URL = 'http://127.0.0.1:8000'

/** URL base efectiva: override en localStorage > variable de entorno > default. */
export function getApiBaseUrl(): string {
  return (
    localStorage.getItem(STORAGE_API_URL_KEY) ||
    import.meta.env.VITE_API_BASE_URL ||
    DEFAULT_API_BASE_URL
  )
}

/** Guarda el override de la URL base y fuerza recarga para reconfigurar el cliente. */
export function setApiBaseUrl(url: string): void {
  localStorage.setItem(STORAGE_API_URL_KEY, url.trim())
}

/** Claves de localStorage (se preservan las del proyecto original). */
export const STORAGE_KEYS = {
  TOKEN: 'gymsass_token',
  USER: 'gymsass_user',
} as const

/** Endpoints de la API FastAPI. */
export const ENDPOINTS = {
  LOGIN: '/auth/login',
  REGISTER: '/auth/register',
  ME: '/users/me',
  USERS: '/users',
  SPORT_PROFILES: '/sport-profiles',
  /** Ojo: la API expone `/payment` en singular. */
  PAYMENTS: '/payment',
  HEALTH: '/',
} as const

/** Tiempo límite de las peticiones en milisegundos. */
export const TIMEOUT_MS = 10_000
