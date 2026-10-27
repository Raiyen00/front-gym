import { HttpResponse, http } from 'msw'
import { describe, expect, it } from 'vitest'

import {
  createRoutine,
  createRoutineExercise,
  deleteRoutine,
  deleteRoutineExercise,
  getMyRoutines,
  getRoutine,
  getRoutineExercises,
  getRoutines,
  updateRoutine,
  updateRoutineExercise,
} from '@/features/routines/api'
import { server } from '@/test/msw/server'

const BASE = 'http://127.0.0.1:8000'

const ROUTINE = {
  id: 9,
  user_id: 7,
  date_generated: '2026-10-25',
  state: true,
}

const EXERCISE = {
  id: 1,
  name: 'Press de banca con barra',
  description: 'Banco plano, agarre medio',
  muscular_group: 'pecho',
}

const ROUTINE_DETAIL = {
  ...ROUTINE,
  exercises: [
    {
      id: 7,
      day: 'lunes',
      sets: 4,
      repetitions: '10',
      position: 1,
      rest: 60,
      exercise: EXERCISE,
    },
  ],
}

const ROUTINE_EXERCISE = {
  id: 7,
  routine_id: 9,
  exercise_id: 1,
  day: 'lunes',
  sets: 4,
  repetitions: '10',
  position: 1,
  rest: 60,
}

describe('routines api', () => {
  it('getRoutines hace GET /routines', async () => {
    let path = ''
    server.use(
      http.get(`${BASE}/routines`, ({ request }) => {
        path = new URL(request.url).pathname
        return HttpResponse.json([ROUTINE])
      }),
    )

    const routines = await getRoutines()

    expect(path).toBe('/routines')
    expect(routines[0]?.id).toBe(9)
  })

  it('getMyRoutines hace GET /routines/me', async () => {
    let path = ''
    server.use(
      http.get(`${BASE}/routines/me`, ({ request }) => {
        path = new URL(request.url).pathname
        return HttpResponse.json([ROUTINE_DETAIL])
      }),
    )

    const routines = await getMyRoutines()

    expect(path).toBe('/routines/me')
    expect(routines[0]?.exercises[0]?.exercise.name).toBe(
      'Press de banca con barra',
    )
  })

  it('getRoutine hace GET /routines/{id}', async () => {
    let path = ''
    server.use(
      http.get(`${BASE}/routines/9`, ({ request }) => {
        path = new URL(request.url).pathname
        return HttpResponse.json(ROUTINE_DETAIL)
      }),
    )

    const routine = await getRoutine(9)

    expect(path).toBe('/routines/9')
    expect(routine.exercises[0]?.exercise.muscular_group).toBe('pecho')
  })

  it('getRoutineExercises hace GET /routines/{id}/exercises', async () => {
    let path = ''
    server.use(
      http.get(`${BASE}/routines/9/exercises`, ({ request }) => {
        path = new URL(request.url).pathname
        return HttpResponse.json([ROUTINE_EXERCISE])
      }),
    )

    const exercises = await getRoutineExercises(9)

    expect(path).toBe('/routines/9/exercises')
    expect(exercises[0]?.exercise_id).toBe(1)
  })

  it('createRoutine hace POST /routines con user_id, fecha y estado', async () => {
    let method = ''
    let payload: Record<string, unknown> = {}
    server.use(
      http.post(`${BASE}/routines`, async ({ request }) => {
        method = request.method
        payload = (await request.json()) as Record<string, unknown>
        return HttpResponse.json(ROUTINE, { status: 201 })
      }),
    )

    const created = await createRoutine({
      user_id: 7,
      date_generated: '2026-10-25',
      state: true,
    })

    expect(method).toBe('POST')
    expect(payload).toEqual({
      user_id: 7,
      date_generated: '2026-10-25',
      state: true,
    })
    expect(created.id).toBe(9)
  })

  it('updateRoutine hace PATCH parcial', async () => {
    let method = ''
    let payload: Record<string, unknown> = {}
    server.use(
      http.patch(`${BASE}/routines/9`, async ({ request }) => {
        method = request.method
        payload = (await request.json()) as Record<string, unknown>
        return HttpResponse.json({ ...ROUTINE, state: false })
      }),
    )

    const updated = await updateRoutine(9, { state: false })

    expect(method).toBe('PATCH')
    expect(payload).toEqual({ state: false })
    expect(updated.state).toBe(false)
  })

  it('deleteRoutine hace DELETE /routines/{id} y acepta 204', async () => {
    let method = ''
    let path = ''
    server.use(
      http.delete(`${BASE}/routines/9`, ({ request }) => {
        method = request.method
        path = new URL(request.url).pathname
        return new HttpResponse(null, { status: 204 })
      }),
    )

    await expect(deleteRoutine(9)).resolves.toBeUndefined()
    expect(method).toBe('DELETE')
    expect(path).toBe('/routines/9')
  })

  it('createRoutineExercise hace POST sin routine_id en el body', async () => {
    let method = ''
    let path = ''
    let payload: Record<string, unknown> = {}
    server.use(
      http.post(`${BASE}/routines/9/exercises`, async ({ request }) => {
        method = request.method
        path = new URL(request.url).pathname
        payload = (await request.json()) as Record<string, unknown>
        return HttpResponse.json(ROUTINE_EXERCISE, { status: 201 })
      }),
    )

    const created = await createRoutineExercise(9, {
      exercise_id: 1,
      day: 'lunes',
      sets: 4,
      repetitions: '10',
      position: 1,
      rest: 60,
    })

    expect(method).toBe('POST')
    expect(path).toBe('/routines/9/exercises')
    expect(payload).toEqual({
      exercise_id: 1,
      day: 'lunes',
      sets: 4,
      repetitions: '10',
      position: 1,
      rest: 60,
    })
    expect(payload).not.toHaveProperty('routine_id')
    expect(created.routine_id).toBe(9)
  })

  it('updateRoutineExercise hace PATCH con solo los campos enviados', async () => {
    let method = ''
    let path = ''
    let payload: Record<string, unknown> = {}
    server.use(
      http.patch(`${BASE}/routines/9/exercises/7`, async ({ request }) => {
        method = request.method
        path = new URL(request.url).pathname
        payload = (await request.json()) as Record<string, unknown>
        return HttpResponse.json({ ...ROUTINE_EXERCISE, sets: 5, rest: 90 })
      }),
    )

    const updated = await updateRoutineExercise(9, 7, { sets: 5, rest: 90 })

    expect(method).toBe('PATCH')
    expect(path).toBe('/routines/9/exercises/7')
    expect(payload).toEqual({ sets: 5, rest: 90 })
    expect(updated.sets).toBe(5)
  })

  it('deleteRoutineExercise hace DELETE anidado', async () => {
    let method = ''
    let path = ''
    server.use(
      http.delete(`${BASE}/routines/9/exercises/7`, ({ request }) => {
        method = request.method
        path = new URL(request.url).pathname
        return new HttpResponse(null, { status: 204 })
      }),
    )

    await expect(deleteRoutineExercise(9, 7)).resolves.toBeUndefined()
    expect(method).toBe('DELETE')
    expect(path).toBe('/routines/9/exercises/7')
  })

  it('propaga el 409 de un renglón duplicado', async () => {
    server.use(
      http.post(`${BASE}/routines/9/exercises`, () =>
        HttpResponse.json(
          { detail: 'El ejercicio ya existe en ese día.' },
          { status: 409 },
        ),
      ),
    )

    await expect(
      createRoutineExercise(9, {
        exercise_id: 1,
        day: 'lunes',
        sets: 4,
        repetitions: '10',
        position: 1,
        rest: 60,
      }),
    ).rejects.toThrow('El ejercicio ya existe en ese día.')
  })

  it('retorna 409 si el ejercicio ya existe en esa rutina para ese día', async () => {
    server.use(
      http.post(`${BASE}/routines/9/exercises`, () =>
        HttpResponse.json(
          { detail: "El ejercicio ya existe en esa rutina para ese día." },
          { status: 409 },
        ),
      ),
    )

    await expect(
      createRoutineExercise(9, {
        exercise_id: 1,
        day: 'lunes',
        sets: 4,
        repetitions: '10',
        position: 1,
        rest: 60,
      }),
    ).rejects.toThrow("El ejercicio ya existe en esa rutina para ese día.")
  })

  it('retorna 409 si la posición ya está ocupada para ese día', async () => {
    server.use(
      http.post(`${BASE}/routines/9/exercises`, () =>
        HttpResponse.json(
          { detail: 'La posición ya está ocupada para ese día.' },
          { status: 409 },
        ),
      ),
    )

    await expect(
      createRoutineExercise(9, {
        exercise_id: 1,
        day: 'lunes',
        sets: 4,
        repetitions: '10',
        position: 1,
        rest: 60,
      }),
    ).rejects.toThrow('La posición ya está ocupada para ese día.')
  })

  it('propaga el 409 al cambiar exercise_id/día generando duplicado en PATCH', async () => {
    server.use(
      http.patch(`${BASE}/routines/9/exercises/7`, () =>
        HttpResponse.json(
          { detail: 'El ejercicio ya existe en esa rutina para ese día.' },
          { status: 409 },
        ),
      ),
    )

    await expect(
      updateRoutineExercise(9, 7, { exercise_id: 1, day: 'lunes' }),
    ).rejects.toThrow('El ejercicio ya existe en esa rutina para ese día.')
  })

  it('propaga el 409 al cambiar position/día ocupando posición en PATCH', async () => {
    server.use(
      http.patch(`${BASE}/routines/9/exercises/7`, () =>
        HttpResponse.json(
          { detail: 'La posición ya está ocupada para ese día.' },
          { status: 409 },
        ),
      ),
    )

    await expect(
      updateRoutineExercise(9, 7, { position: 1, day: 'lunes' }),
    ).rejects.toThrow('La posición ya está ocupada para ese día.')
  })

  it('elimina renglón y retorna 204', async () => {
    let method = ''
    let path = ''
    server.use(
      http.delete(`${BASE}/routines/9/exercises/7`, ({ request }) => {
        method = request.method
        path = new URL(request.url).pathname
        return new HttpResponse(null, { status: 204 })
      }),
    )

    await expect(deleteRoutineExercise(9, 7)).resolves.toBeUndefined()
    expect(method).toBe('DELETE')
    expect(path).toBe('/routines/9/exercises/7')
  })

  it('propaga 404 si el renglón no pertenece a esa rutina', async () => {
    server.use(
      http.delete(`${BASE}/routines/9/exercises/999`, () => {
        return HttpResponse.json(
          { detail: 'Routine exercise not found' },
          { status: 404 },
        )
      }),
    )

    await expect(deleteRoutineExercise(9, 999)).rejects.toThrow(
      'Routine exercise not found',
    )
  })

  it('propaga 404 si la rutina no existe', async () => {
    server.use(
      http.delete(`${BASE}/routines/999/exercises/7`, () => {
        return HttpResponse.json(
          { detail: 'Routine not found' },
          { status: 404 },
        )
      }),
    )

    await expect(deleteRoutineExercise(999, 7)).rejects.toThrow('Routine not found')
  })
})
