import type { SportProfileFormValues } from '@/features/sportProfiles/schema'
import type {
  SportProfile,
  SportProfileCreate,
  SportProfileUpdate,
} from '@/types/sportProfile'

function normalizeInjuries(raw: string | undefined): string | null {
  const trimmed = raw?.trim()
  return trimmed ? trimmed : null
}

/** Payload de alta (POST). Incluye `user_id` y nunca `created_at`. */
export function buildSportProfileCreate(
  userId: number,
  values: SportProfileFormValues,
): SportProfileCreate {
  return {
    user_id: userId,
    goal: values.goal,
    level: values.level,
    days_per_week: Number(values.days_per_week),
    session_duration: Number(values.session_duration),
    age: Number(values.age),
    injuries: normalizeInjuries(values.injuries),
    trainer_tracking: values.trainer_tracking,
  }
}

/**
 * Payload de edición (PATCH): SOLO los campos que cambiaron respecto al
 * perfil original. Nunca incluye `user_id`. Devuelve `{}` si no hay cambios.
 */
export function buildSportProfileUpdate(
  original: SportProfile,
  values: SportProfileFormValues,
): SportProfileUpdate {
  const payload: SportProfileUpdate = {}

  const daysPerWeek = Number(values.days_per_week)
  const sessionDuration = Number(values.session_duration)
  const age = Number(values.age)
  const injuries = normalizeInjuries(values.injuries)

  if (values.goal !== original.goal) payload.goal = values.goal
  if (values.level !== original.level) payload.level = values.level
  if (daysPerWeek !== original.days_per_week) payload.days_per_week = daysPerWeek
  if (sessionDuration !== original.session_duration) {
    payload.session_duration = sessionDuration
  }
  if (age !== original.age) payload.age = age
  if (injuries !== (original.injuries ?? null)) payload.injuries = injuries
  if (values.trainer_tracking !== original.trainer_tracking) {
    payload.trainer_tracking = values.trainer_tracking
  }

  return payload
}
