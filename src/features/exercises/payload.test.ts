import { describe, expect, it } from 'vitest'

import { buildExercisePayload } from '@/features/exercises/payload'

describe('buildExercisePayload', () => {
  it('trimmea el nombre y convierte una descripción vacía en null', () => {
    const payload = buildExercisePayload({
      name: '  Sentadilla  ',
      description: '   ',
      muscular_group: 'pierna',
    })

    expect(payload).toEqual({
      name: 'Sentadilla',
      description: null,
      muscular_group: 'pierna',
    })
  })

  it('conserva la descripción cuando tiene contenido', () => {
    const payload = buildExercisePayload({
      name: 'Remo con barra',
      description: ' Espalda media ',
      muscular_group: 'espalda',
    })

    expect(payload.description).toBe('Espalda media')
  })
})
