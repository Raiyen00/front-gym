import { HttpResponse, http } from 'msw'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { ApiError, onUnauthorized, request } from '@/lib/api/client'
import { server } from '@/test/msw/server'

const BASE = 'http://127.0.0.1:8000'

beforeEach(() => {
  localStorage.clear()
  onUnauthorized(null)
})

describe('request', () => {
  it('devuelve el JSON en una respuesta exitosa', async () => {
    server.use(
      http.get(`${BASE}/ping`, () => HttpResponse.json({ ok: true })),
    )
    await expect(request<{ ok: boolean }>('/ping')).resolves.toEqual({
      ok: true,
    })
  })

  it('devuelve undefined ante un 204', async () => {
    server.use(http.delete(`${BASE}/thing`, () => new HttpResponse(null, { status: 204 })))
    await expect(request<undefined>('/thing', { method: 'DELETE' })).resolves.toBeUndefined()
  })

  it('adjunta el token Bearer cuando existe', async () => {
    localStorage.setItem('gymsass_token', 'jwt-123')
    let received: string | null = null
    server.use(
      http.get(`${BASE}/secure`, ({ request: req }) => {
        received = req.headers.get('authorization')
        return HttpResponse.json({})
      }),
    )
    await request('/secure')
    expect(received).toBe('Bearer jwt-123')
  })

  it('lanza ApiError 409 con el detail del backend', async () => {
    server.use(
      http.post(`${BASE}/auth/register`, () =>
        HttpResponse.json(
          { detail: 'Ya existe un usuario con ese email' },
          { status: 409 },
        ),
      ),
    )
    await expect(request('/auth/register', { method: 'POST' })).rejects.toMatchObject(
      { status: 409, message: 'Ya existe un usuario con ese email' },
    )
  })

  it('parsea los errores de validación 422', async () => {
    server.use(
      http.post(`${BASE}/auth/register`, () =>
        HttpResponse.json(
          {
            detail: [
              { loc: ['body', 'email'], msg: 'value is not a valid email address', type: 'value_error' },
              { loc: ['body', 'password'], msg: 'String should have at least 8 characters', type: 'string_too_short' },
            ],
          },
          { status: 422 },
        ),
      ),
    )
    await expect(request('/auth/register', { method: 'POST' })).rejects.toThrow(
      /email: value is not a valid email address \| password: String should have at least 8 characters/,
    )
  })

  it('invoca el handler global de 401 en peticiones autenticadas', async () => {
    localStorage.setItem('gymsass_token', 'expired')
    const handler = vi.fn()
    onUnauthorized(handler)
    server.use(
      http.get(`${BASE}/users/me`, () =>
        HttpResponse.json({ detail: 'Token expirado' }, { status: 401 }),
      ),
    )
    await expect(request('/users/me')).rejects.toBeInstanceOf(ApiError)
    expect(handler).toHaveBeenCalledOnce()
  })

  it('no invoca el handler de 401 si no había token (login)', async () => {
    const handler = vi.fn()
    onUnauthorized(handler)
    server.use(
      http.post(`${BASE}/auth/login`, () =>
        HttpResponse.json({ detail: 'Credenciales inválidas' }, { status: 401 }),
      ),
    )
    await expect(request('/auth/login', { method: 'POST' })).rejects.toBeInstanceOf(ApiError)
    expect(handler).not.toHaveBeenCalled()
  })

  it('marca isNetworkError ante fallo de conexión', async () => {
    vi.spyOn(globalThis, 'fetch').mockRejectedValueOnce(new TypeError('failed to fetch'))
    await expect(request('/ping')).rejects.toMatchObject({
      isNetworkError: true,
    })
    vi.restoreAllMocks()
  })

  it('marca isNetworkError ante timeout (AbortError)', async () => {
    vi.spyOn(globalThis, 'fetch').mockRejectedValueOnce(
      new DOMException('aborted', 'AbortError'),
    )
    await expect(request('/slow')).rejects.toThrow(/tardó demasiado/)
    vi.restoreAllMocks()
  })
})
