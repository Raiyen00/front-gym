import { describe, expect, it } from 'vitest'

import {
  buildRoutineCreate,
  buildRoutineExerciseCreate,
  buildRoutineExerciseUpdate,
} from '@/features/routines/payload'
import type { RoutineExercise } from '@/types/routine'

const ORIGINAL: RoutineExercise = {
  id: 7,
  routine_id: 9,
  exercise_id: 1,
  day: 'lunes',
  sets: 4,
  repetitions: '10',
  position: 1,
  rest: 60,
  exercise: {
    id: 1,
    name: 'Press de banca con barra',
    description: 'Banco plano, agarre medio',
    muscular_group: 'pecho',
  },
}

const VALUES = {
  exercise_id: '1',
  day: 'lunes' as const,
  sets: '4',
  repetitions: '10',
  rest: '60',
  position: '1',
}

describe('routines payload', () => {
  it('arma el alta de rutina siempre activa', () => {
    expect(
      buildRoutineCreate({
        user_id: '7',
        date_generated: '2026-10-25',
      }),
    ).toEqual({
      user_id: 7,
      date_generated: '2026-10-25',
      state: true,
    })
  })

  it('arma el alta de renglón sin routine_id y normaliza los numéricos', () => {
    expect(
      buildRoutineExerciseCreate({
        ...VALUES,
        repetitions: ' 8-12 ',
        position: '2',
      }),
    ).toEqual({
      exercise_id: 1,
      day: 'lunes',
      sets: 4,
      repetitions: '8-12',
      position: 2,
      rest: 60,
    })
  })

  it('el PATCH incluye solo los campos modificados y puede incluir exercise_id', () => {
    const payload = buildRoutineExerciseUpdate(ORIGINAL, {
      ...VALUES,
      sets: '5',
      rest: '90',
      exercise_id: '2', // NUEVO: cambiar el ejercicio a 2
    })

    expect(payload).toEqual({ sets: 5, rest: 90, exercise_id: 2 })
    // exercise_id distinto al original (1), así que debería incluirse
  })

  it('el PATCH no incluye exercise_id si no cambió', () => {
    const payload = buildRoutineExerciseUpdate(ORIGINAL, VALUES)

    expect(payload).toEqual({})
    // exercise_id iguaal al original (1), así que no debería incluirse
  })

  it('devuelve un PATCH vacío cuando no hay cambios', () => {
    expect(buildRoutineExerciseUpdate(ORIGINAL, VALUES)).toEqual({})
  })

  it('incluye exercise_id opcional cuando cambia del original', () => {
    const values = {
      ...VALUES,
      exercise_id: '2',
    }
    const payload = buildRoutineExerciseUpdate(ORIGINAL, values)
    expect(payload).toEqual({ exercise_id: 2 })
  })

  it('no incluye exercise_id si es igual al original', () => {
    const payload = buildRoutineExerciseUpdate(ORIGINAL, {
      ...VALUES,
      exercise_id: '1',
    })
    expect(payload).toEqual({})
  })

  it('puede actualizar solo sets y rest sin dar 409', () => {
    const payload = buildRoutineExerciseUpdate(ORIGINAL, {
      ...VALUES,
      sets: '3',
      rest: '30',
    })
    expect(payload).toEqual({ sets: 3, rest: 30 })
  })
})