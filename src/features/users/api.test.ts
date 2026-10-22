import { HttpResponse, http } from 'msw'
import { describe, expect, it } from 'vitest'

import { createUser, deleteUser, enableUser, getUser, updateUser } from '@/features/users/api'
import { server } from '@/test/msw/server'

const BASE = 'http://127.0.0.1:8000'

const USER = {
  id: 7,
  email: 'ana@test.com',
  name: 'Ana',
  lastname: 'Gómez',
  dni: '38999888',
  phone: '1145678901',
  rol: 'cliente',
  state: 'activo',
  register_date: '2026-01-01T00:00:00Z',
}

describe('users api (admin)', () => {
  it('createUser hace POST /auth/register con los datos del socio', async () => {
    let method = ''
    let path = ''
    let payload: Record<string, unknown> = {}

    server.use(
      http.post(`${BASE}/auth/register`, async ({ request }) => {
        method = request.method
        path = new URL(request.url).pathname
        payload = (await request.json()) as Record<string, unknown>
        return HttpResponse.json(USER, { status: 201 })
      }),
    )

    const created = await createUser({
      email: 'ana@test.com',
      password: 'secreta123',
      name: 'Ana',
      lastname: 'Gómez',
      dni: '38999888',
      phone: '1145678901',
    })

    expect(method).toBe('POST')
    expect(path).toBe('/auth/register')
    expect(payload).toEqual({
      email: 'ana@test.com',
      password: 'secreta123',
      name: 'Ana',
      lastname: 'Gómez',
      dni: '38999888',
      phone: '1145678901',
    })
    expect(created.id).toBe(7)
  })

  it('getUser hace GET /users/{id}', async () => {
    let path = ''
    server.use(
      http.get(`${BASE}/users/7`, ({ request }) => {
        path = new URL(request.url).pathname
        return HttpResponse.json(USER)
      }),
    )

    const user = await getUser(7)

    expect(path).toBe('/users/7')
    expect(user.id).toBe(7)
  })

  it('updateUser hace PATCH /users/{id} con el body parcial', async () => {
    let method = ''
    let payload: Record<string, unknown> = {}
    server.use(
      http.patch(`${BASE}/users/7`, async ({ request }) => {
        method = request.method
        payload = (await request.json()) as Record<string, unknown>
        return HttpResponse.json({ ...USER, name: 'Ana María' })
      }),
    )

    const updated = await updateUser(7, { name: 'Ana María' })

    expect(method).toBe('PATCH')
    expect(payload).toEqual({ name: 'Ana María' })
    expect(updated.name).toBe('Ana María')
  })

  it('enableUser hace PATCH /users/{id}/habilitar sin body', async () => {
    let body = 'x'
    server.use(
      http.patch(`${BASE}/users/7/habilitar`, async ({ request }) => {
        body = await request.text()
        return HttpResponse.json({ ...USER, state: 'habilitado_entrenar' })
      }),
    )

    const updated = await enableUser(7)

    expect(body).toBe('')
    expect(updated.state).toBe('habilitado_entrenar')
  })

  it('deleteUser hace DELETE y resuelve sin contenido (204)', async () => {
    let method = ''
    server.use(
      http.delete(`${BASE}/users/7`, ({ request }) => {
        method = request.method
        return new HttpResponse(null, { status: 204 })
      }),
    )

    const result = await deleteUser(7)

    expect(method).toBe('DELETE')
    expect(result).toBeUndefined()
  })

  it('propaga el 409 de duplicado con el detail del backend', async () => {
    server.use(
      http.patch(`${BASE}/users/7`, () =>
        HttpResponse.json(
          { detail: 'El DNI ya pertenece a otro usuario' },
          { status: 409 },
        ),
      ),
    )

    await expect(updateUser(7, { dni: '11111111' })).rejects.toThrow(
      'El DNI ya pertenece a otro usuario',
    )
  })
})
