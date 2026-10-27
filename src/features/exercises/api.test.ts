import { HttpResponse, http } from 'msw'
import { describe, expect, it } from 'vitest'

import {
  createExercise,
  deleteExercise,
  getExercises,
  updateExercise,
} from '@/features/exercises/api'
import { server } from '@/test/msw/server'

const BASE = 'http://127.0.0.1:8000'

const EXERCISE = {
  id: 3,
  name: 'Press de banca',
  description: 'Pecho plano con barra',
  muscular_group: 'pecho',
}

describe('exercises api', () => {
  it('getExercises envía ?muscular_group= cuando se filtra', async () => {
    let requestUrl = ''
    server.use(
      http.get(`${BASE}/exercises`, ({ request }) => {
        requestUrl = request.url
        return HttpResponse.json([EXERCISE])
      }),
    )

    const list = await getExercises('pecho')
    const url = new URL(requestUrl)

    expect(url.pathname).toBe('/exercises')
    expect(url.searchParams.get('muscular_group')).toBe('pecho')
    expect(list).toHaveLength(1)
  })

  it('getExercises sin filtro no agrega query params', async () => {
    let search = 'x'
    server.use(
      http.get(`${BASE}/exercises`, ({ request }) => {
        search = new URL(request.url).search
        return HttpResponse.json([EXERCISE])
      }),
    )

    await getExercises()

    expect(search).toBe('')
  })

  it('createExercise hace POST /exercises con el body completo', async () => {
    let method = ''
    let payload: Record<string, unknown> = {}
    server.use(
      http.post(`${BASE}/exercises`, async ({ request }) => {
        method = request.method
        payload = (await request.json()) as Record<string, unknown>
        return HttpResponse.json(EXERCISE, { status: 201 })
      }),
    )

    const created = await createExercise({
      name: 'Press de banca',
      description: 'Pecho plano con barra',
      muscular_group: 'pecho',
    })

    expect(method).toBe('POST')
    expect(payload).toEqual({
      name: 'Press de banca',
      description: 'Pecho plano con barra',
      muscular_group: 'pecho',
    })
    expect(created.id).toBe(3)
  })

  it('propaga el 409 de nombre duplicado con el detail del backend', async () => {
    server.use(
      http.post(`${BASE}/exercises`, () =>
        HttpResponse.json(
          { detail: "El ejercicio con el nombre 'Press de banca' ya existe." },
          { status: 409 },
        ),
      ),
    )

    await expect(
      createExercise({
        name: 'Press de banca',
        description: null,
        muscular_group: 'pecho',
      }),
    ).rejects.toThrow("El ejercicio con el nombre 'Press de banca' ya existe.")
  })

  it('updateExercise hace PATCH /exercises/{id}', async () => {
    let path = ''
    let payload: Record<string, unknown> = {}
    server.use(
      http.patch(`${BASE}/exercises/3`, async ({ request }) => {
        path = new URL(request.url).pathname
        payload = (await request.json()) as Record<string, unknown>
        return HttpResponse.json({ ...EXERCISE, name: 'Press inclinado' })
      }),
    )

    const updated = await updateExercise(3, { name: 'Press inclinado' })

    expect(path).toBe('/exercises/3')
    expect(payload).toEqual({ name: 'Press inclinado' })
    expect(updated.name).toBe('Press inclinado')
  })

  it('deleteExercise hace DELETE y resuelve sin contenido (204)', async () => {
    let method = ''
    server.use(
      http.delete(`${BASE}/exercises/3`, ({ request }) => {
        method = request.method
        return new HttpResponse(null, { status: 204 })
      }),
    )

    const result = await deleteExercise(3)

    expect(method).toBe('DELETE')
    expect(result).toBeUndefined()
  })
})
