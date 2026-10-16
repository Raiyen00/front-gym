/** Espejo de `SportProfileResponse`. */
export interface SportProfile {
  id: number
  user_id: number
  goal: string
  level: string
  days_per_week: number
  /** minutos */
  session_duration: number
  age: number
  injuries: string | null
  trainer_tracking: boolean
}

/** Espejo de `SportProfileCreate`. */
export interface SportProfileCreate {
  user_id: number
  goal: string
  level: string
  days_per_week: number
  session_duration: number
  age: number
  injuries?: string | null
  trainer_tracking?: boolean
}

/** `SportProfileUpdate` (Etapa 3 del plan de la API). */
export type SportProfileUpdate = Partial<Omit<SportProfileCreate, 'user_id'>>
