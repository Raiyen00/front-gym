/**
 * Configuración global del cliente API.
 * Portado de js/config.js.
 */

const DEFAULT_API_BASE_URL = 'http://127.0.0.1:8000'

/** URL base efectiva: variable de entorno del build o default local. */
export function getApiBaseUrl(): string {
  return import.meta.env.VITE_API_BASE_URL || DEFAULT_API_BASE_URL
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
  /** PATCH autenticado: actualiza la contraseña del usuario logueado. */
  PASSWORD: '/auth/password',
  ME: '/users/me',
  USERS: '/users',
  SPORT_PROFILES: '/sport-profiles',
  EXERCISES: '/exercises',
  ROUTINES: '/routines',
  /** Ojo: la API expone `/payment` en singular. */
  PAYMENTS: '/payment',
  HEALTH: '/',
} as const

/** Tiempo límite de las peticiones en milisegundos. */
export const TIMEOUT_MS = 10_000
