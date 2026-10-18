import { describe, expect, it } from 'vitest'

import {
  buildSportProfileCreate,
  buildSportProfileUpdate,
} from '@/features/sportProfiles/payload'
import type { SportProfileFormValues } from '@/features/sportProfiles/schema'
import type { SportProfile } from '@/types/sportProfile'

const ORIGINAL: SportProfile = {
  id: 5,
  user_id: 7,
  goal: 'Hipertrofia',
  level: 'Intermedio',
  days_per_week: 4,
  session_duration: 60,
  age: 28,
  injuries: null,
  trainer_tracking: false,
  created_at: '2026-02-01T10:00:00Z',
}

const UNCHANGED: SportProfileFormValues = {
  goal: 'Hipertrofia',
  level: 'Intermedio',
  days_per_week: '4',
  session_duration: '60',
  age: '28',
  injuries: '',
  trainer_tracking: false,
}

describe('buildSportProfileUpdate (diff vs original)', () => {
  it('devuelve {} si no hay cambios', () => {
    expect(buildSportProfileUpdate(ORIGINAL, UNCHANGED)).toEqual({})
  })

  it('incluye solo trainer_tracking cuando cambia el seguimiento', () => {
    const payload = buildSportProfileUpdate(ORIGINAL, {
      ...UNCHANGED,
      trainer_tracking: true,
    })

    expect(payload).toEqual({ trainer_tracking: true })
  })

  it('convierte numéricos a number y no manda user_id', () => {
    const payload = buildSportProfileUpdate(ORIGINAL, {
      ...UNCHANGED,
      days_per_week: '5',
      age: '30',
    })

    expect(payload).toEqual({ days_per_week: 5, age: 30 })
    expect(payload).not.toHaveProperty('user_id')
  })

  it('normaliza injuries vacío a null y lo omite si no cambió', () => {
    expect(
      buildSportProfileUpdate(ORIGINAL, { ...UNCHANGED, injuries: '   ' }),
    ).toEqual({})

    expect(
      buildSportProfileUpdate(ORIGINAL, { ...UNCHANGED, injuries: 'Dolor lumbar' }),
    ).toEqual({ injuries: 'Dolor lumbar' })
  })

  it('detecta cambio de goal/level legibles', () => {
    const payload = buildSportProfileUpdate(ORIGINAL, {
      ...UNCHANGED,
      goal: 'Fuerza',
      level: 'Avanzado',
    })

    expect(payload).toEqual({ goal: 'Fuerza', level: 'Avanzado' })
  })
})

describe('buildSportProfileCreate', () => {
  it('arma el payload con user_id y sin created_at', () => {
    const payload = buildSportProfileCreate(7, UNCHANGED)

    expect(payload).toEqual({
      user_id: 7,
      goal: 'Hipertrofia',
      level: 'Intermedio',
      days_per_week: 4,
      session_duration: 60,
      age: 28,
      injuries: null,
      trainer_tracking: false,
    })
    expect(payload).not.toHaveProperty('created_at')
  })
})
