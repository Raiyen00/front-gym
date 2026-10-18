import { HttpResponse, http } from 'msw'
import { describe, expect, it } from 'vitest'

import {
  createSportProfile,
  deleteSportProfile,
  getMySportProfiles,
  getSportProfile,
  getSportProfiles,
  updateSportProfile,
} from '@/features/sportProfiles/api'
import { server } from '@/test/msw/server'

const BASE = 'http://127.0.0.1:8000'

const PROFILE = {
  id: 5,
  user_id: 7,
  goal: 'hipertrofia',
  level: 'intermedio',
  days_per_week: 4,
  session_duration: 60,
  age: 28,
  injuries: null,
  trainer_tracking: false,
  created_at: '2026-02-01T10:00:00Z',
}

describe('sportProfiles api', () => {
  it('getSportProfiles hace GET /sport-profiles', async () => {
    let path = ''
    server.use(
      http.get(`${BASE}/sport-profiles`, ({ request }) => {
        path = new URL(request.url).pathname
        return HttpResponse.json([PROFILE])
      }),
    )

    const profiles = await getSportProfiles()

    expect(path).toBe('/sport-profiles')
    expect(profiles[0]?.id).toBe(5)
  })

  it('getMySportProfiles hace GET /sport-profiles/me', async () => {
    let path = ''
    server.use(
      http.get(`${BASE}/sport-profiles/me`, ({ request }) => {
        path = new URL(request.url).pathname
        return HttpResponse.json([PROFILE])
      }),
    )

    const profiles = await getMySportProfiles()

    expect(path).toBe('/sport-profiles/me')
    expect(profiles).toHaveLength(1)
  })

  it('getSportProfile hace GET /sport-profiles/{id}', async () => {
    let path = ''
    server.use(
      http.get(`${BASE}/sport-profiles/5`, ({ request }) => {
        path = new URL(request.url).pathname
        return HttpResponse.json(PROFILE)
      }),
    )

    const profile = await getSportProfile(5)

    expect(path).toBe('/sport-profiles/5')
    expect(profile.user_id).toBe(7)
  })

  it('createSportProfile hace POST con user_id y sin created_at', async () => {
    let method = ''
    let payload: Record<string, unknown> = {}
    server.use(
      http.post(`${BASE}/sport-profiles`, async ({ request }) => {
        method = request.method
        payload = (await request.json()) as Record<string, unknown>
        return HttpResponse.json({ ...PROFILE, id: 9 }, { status: 201 })
      }),
    )

    const created = await createSportProfile({
      user_id: 7,
      goal: 'fuerza',
      level: 'avanzado',
      days_per_week: 3,
      session_duration: 45,
      age: 30,
      injuries: null,
      trainer_tracking: true,
    })

    expect(method).toBe('POST')
    expect(payload).toMatchObject({ user_id: 7, goal: 'fuerza' })
    expect(payload).not.toHaveProperty('created_at')
    expect(created.id).toBe(9)
  })

  it('updateSportProfile hace PATCH parcial sin user_id', async () => {
    let method = ''
    let payload: Record<string, unknown> = {}
    server.use(
      http.patch(`${BASE}/sport-profiles/5`, async ({ request }) => {
        method = request.method
        payload = (await request.json()) as Record<string, unknown>
        return HttpResponse.json({ ...PROFILE, goal: 'resistencia' })
      }),
    )

    const updated = await updateSportProfile(5, { goal: 'resistencia' })

    expect(method).toBe('PATCH')
    expect(payload).toEqual({ goal: 'resistencia' })
    expect(payload).not.toHaveProperty('user_id')
    expect(updated.goal).toBe('resistencia')
  })

  it('deleteSportProfile hace DELETE y resuelve sin contenido (204)', async () => {
    let method = ''
    server.use(
      http.delete(`${BASE}/sport-profiles/5`, ({ request }) => {
        method = request.method
        return new HttpResponse(null, { status: 204 })
      }),
    )

    const result = await deleteSportProfile(5)

    expect(method).toBe('DELETE')
    expect(result).toBeUndefined()
  })

  it('propaga el 403 de escritura para no-admin con el detail del backend', async () => {
    server.use(
      http.post(`${BASE}/sport-profiles`, () =>
        HttpResponse.json(
          { detail: 'No tenés permisos para realizar esta operación. Solo Administradores.' },
          { status: 403 },
        ),
      ),
    )

    await expect(
      createSportProfile({
        user_id: 7,
        goal: 'fuerza',
        level: 'avanzado',
        days_per_week: 3,
        session_duration: 45,
        age: 30,
        trainer_tracking: false,
      }),
    ).rejects.toThrow('No tenés permisos para realizar esta operación. Solo Administradores.')
  })
})
