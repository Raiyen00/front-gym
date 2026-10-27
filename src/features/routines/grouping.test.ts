import { describe, expect, it } from 'vitest'

import { groupExercisesByDay } from '@/features/routines/grouping'
import type { RoutineExercise } from '@/types/routine'

function makeExercise(
  id: number,
  day: RoutineExercise['day'],
  position: number,
): RoutineExercise {
  return {
    id,
    day,
    sets: 3,
    repetitions: '10',
    position,
    rest: 60,
    exercise: {
      id,
      name: `Ejercicio ${id}`,
      description: null,
      muscular_group: 'pecho',
    },
  }
}

describe('groupExercisesByDay', () => {
  it('agrupa de lunes a domingo y ordena por position dentro del día', () => {
    const groups = groupExercisesByDay([
      makeExercise(3, 'domingo', 1),
      makeExercise(2, 'lunes', 2),
      makeExercise(1, 'lunes', 1),
      makeExercise(4, 'miercoles', 1),
    ])

    expect(groups.map((group) => group.day)).toEqual([
      'lunes',
      'miercoles',
      'domingo',
    ])
    expect(groups[0]?.exercises.map((exercise) => exercise.id)).toEqual([1, 2])
  })

  it('omite los días sin ejercicios', () => {
    const groups = groupExercisesByDay([makeExercise(1, 'viernes', 1)])

    expect(groups).toHaveLength(1)
    expect(groups[0]?.label).toBe('Viernes')
  })

  it('devuelve una lista vacía si no hay ejercicios', () => {
    expect(groupExercisesByDay([])).toEqual([])
  })
})
