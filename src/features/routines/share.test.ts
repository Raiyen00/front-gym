import { describe, expect, it } from 'vitest'

import {
  buildRoutineShareText,
  whatsappShareUrl,
} from '@/features/routines/share'
import type { RoutineExercise } from '@/types/routine'

function makeRow(
  id: number,
  day: RoutineExercise['day'],
  position: number,
  overrides: Partial<RoutineExercise> = {},
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
    ...overrides,
  }
}

describe('buildRoutineShareText', () => {
  it('arma el resumen con encabezado, días en orden y detalle por renglón', () => {
    const text = buildRoutineShareText({
      routineId: 9,
      memberLabel: 'Ana Gómez',
      dateGenerated: '2026-10-25',
      exercises: [
        makeRow(4, 'miercoles', 1, {
          sets: 4,
          repetitions: '8-12',
          rest: 90,
          exercise: {
            id: 4,
            name: 'Remo con barra',
            description: null,
            muscular_group: 'espalda',
          },
        }),
        makeRow(5, 'lunes', 1, {
          exercise: {
            id: 5,
            name: 'Sentadilla',
            description: null,
            muscular_group: 'pierna',
          },
        }),
      ],
    })

    expect(text).toContain('Rutina #9 — Ana Gómez')
    expect(text).toContain('Generada el 25/10/2026 · 2 ejercicios')
    expect(text).toContain('*Lunes*')
    expect(text).toContain('*Miércoles*')
    expect(text).toContain(
      '1. Sentadilla (Pierna) — 3 × 10 · descanso 60 s',
    )
    expect(text).toContain(
      '1. Remo con barra (Espalda) — 4 × 8-12 · descanso 90 s',
    )

    // Lunes primero, aunque el backend mande los días desordenados.
    expect(text.indexOf('*Lunes*')).toBeLessThan(text.indexOf('*Miércoles*'))
  })

  it('usa singular en el encabezado cuando hay un solo ejercicio', () => {
    const text = buildRoutineShareText({
      routineId: 1,
      memberLabel: 'Ana Gómez',
      dateGenerated: '2026-10-25',
      exercises: [makeRow(1, 'lunes', 1)],
    })

    expect(text).toContain('1 ejercicio')
  })

  it('avisa cuando la rutina todavía no tiene ejercicios', () => {
    const text = buildRoutineShareText({
      routineId: 9,
      memberLabel: 'Ana Gómez',
      dateGenerated: '2026-10-25',
      exercises: [],
    })

    expect(text).toContain('0 ejercicios')
    expect(text).toContain('La rutina todavía no tiene ejercicios cargados.')
    expect(text).not.toContain('*')
  })
})

describe('whatsappShareUrl', () => {
  it('codifica el texto para wa.me', () => {
    const url = whatsappShareUrl('Rutina #9 — Ana Gómez\n*Lunes*')

    expect(url).toBe(
      `https://wa.me/?text=${encodeURIComponent('Rutina #9 — Ana Gómez\n*Lunes*')}`,
    )
    expect(url).not.toContain(' ')
    expect(url).not.toContain('#')
    expect(decodeURIComponent(url.split('text=')[1] ?? '')).toBe(
      'Rutina #9 — Ana Gómez\n*Lunes*',
    )
  })
})
