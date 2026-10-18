import { request } from '@/lib/api/client'
import { ENDPOINTS } from '@/lib/api/config'
import type {
  SportProfile,
  SportProfileCreate,
  SportProfileUpdate,
} from '@/types/sportProfile'

const BASE = ENDPOINTS.SPORT_PROFILES

/** GET /sport-profiles — admin, lista de todos los perfiles. */
export function getSportProfiles(): Promise<SportProfile[]> {
  return request<SportProfile[]>(BASE)
}

/** GET /sport-profiles/me — cliente autenticado, SOLO LECTURA. */
export function getMySportProfiles(): Promise<SportProfile[]> {
  return request<SportProfile[]>(`${BASE}/me`)
}

/** GET /sport-profiles/{id} — admin. */
export function getSportProfile(id: number): Promise<SportProfile> {
  return request<SportProfile>(`${BASE}/${id}`)
}

/** POST /sport-profiles — admin, 201. Body incluye `user_id` (nunca `created_at`). */
export function createSportProfile(data: SportProfileCreate): Promise<SportProfile> {
  return request<SportProfile>(BASE, {
    method: 'POST',
    body: data,
  })
}

/** PATCH /sport-profiles/{id} — admin, parcial. Nunca manda `user_id`. */
export function updateSportProfile(
  id: number,
  data: SportProfileUpdate,
): Promise<SportProfile> {
  return request<SportProfile>(`${BASE}/${id}`, {
    method: 'PATCH',
    body: data,
  })
}

/** DELETE /sport-profiles/{id} — admin, 204 sin body. */
export function deleteSportProfile(id: number): Promise<void> {
  return request<void>(`${BASE}/${id}`, {
    method: 'DELETE',
  })
}
