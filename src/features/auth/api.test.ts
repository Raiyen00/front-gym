import { HttpResponse, http } from 'msw'
import { describe, expect, it } from 'vitest'

import { login, me, register } from '@/features/auth/api'
import { server } from '@/test/msw/server'

const BASE = 'http://127.0.0.1:8000'

describe('auth api', () => {
  it('login envía x-www-form-urlencoded con username/password', async () => {
    let contentType: string | null = null
    let body = ''

    server.use(
      http.post(`${BASE}/auth/login`, async ({ request }) => {
        contentType = request.headers.get('content-type')
        body = await request.text()
        return HttpResponse.json({
          access_token: 'jwt-abc',
          token_type: 'bearer',
        })
      }),
    )

    const response = await login('ana@test.com', 'secreta123')

    expect(contentType).toContain('application/x-www-form-urlencoded')
    expect(body).toContain('username=ana%40test.com')
    expect(body).toContain('password=secreta123')
    expect(response.access_token).toBe('jwt-abc')
  })

  it('register envía exactamente los campos del backend', async () => {
    let payload: Record<string, unknown> = {}

    server.use(
      http.post(`${BASE}/auth/register`, async ({ request }) => {
        payload = (await request.json()) as Record<string, unknown>
        return HttpResponse.json(
          {
            id: 1,
            email: 'ana@test.com',
            name: 'Ana',
            lastname: 'Gómez',
            dni: '38999888',
            phone: '1145678901',
            rol: 'cliente',
            active: true,
            register_date: '2026-01-01T00:00:00Z',
          },
          { status: 201 },
        )
      }),
    )

    await register({
      email: 'ana@test.com',
      password: 'secreta123',
      name: 'Ana',
      lastname: 'Gómez',
      dni: '38999888',
      phone: '1145678901',
    })

    expect(payload).toEqual({
      email: 'ana@test.com',
      password: 'secreta123',
      name: 'Ana',
      lastname: 'Gómez',
      dni: '38999888',
      phone: '1145678901',
    })
  })

  it('me devuelve el usuario autenticado', async () => {
    server.use(
      http.get(`${BASE}/users/me`, () =>
        HttpResponse.json({
          id: 7,
          email: 'ana@test.com',
          name: 'Ana',
          lastname: 'Gómez',
          dni: '38999888',
          phone: '1145678901',
          rol: 'cliente',
          active: true,
          register_date: '2026-01-01T00:00:00Z',
        }),
      ),
    )

    const user = await me()
    expect(user.id).toBe(7)
    expect(user.rol).toBe('cliente')
  })
})
