/**
 * Espejo de `schemas/sport_profile_schema.py` (API FastAPI).
 * Escritura: SOLO admin. El cliente puede leer sus perfiles vía `/sport-profiles/me`.
 */

/** Espejo de `SportProfileResponse`. */
export interface SportProfile {
  id: number
  user_id: number
  goal: string
  level: string
  /** Entre 1 y 7 */
  days_per_week: number
  /** Duración de la sesión en MINUTOS */
  session_duration: number
  /** Entre 11 y 100 */
  age: number
  injuries: string | null
  trainer_tracking: boolean
  /** ISO 8601 generado por el SERVER (no se envía al crear) */
  created_at: string
}

/** Espejo de `SportProfileCreate` (POST /sport-profiles). */
export interface SportProfileCreate {
  user_id: number
  goal: string
  level: string
  days_per_week: number
  session_duration: number
  age: number
  injuries?: string | null
  trainer_tracking: boolean
}

/**
 * Espejo de `SportProfileUpdate` (PATCH parcial).
 * Todos los campos opcionales y SIN `user_id` (el back no lo acepta).
 */
export type SportProfileUpdate = Partial<Omit<SportProfileCreate, 'user_id'>>
