import { describe, expect, it } from 'vitest'

import {
  currentPasswordSchema,
  newPasswordSchema,
} from '@/lib/passwordPolicy'

describe('política de contraseñas', () => {
  it('acepta una contraseña alfanumérica con mayúscula y número', () => {
    expect(newPasswordSchema.safeParse('Secreta123').success).toBe(true)
  })

  it.each([
    ['demasiado corta', 'Ab1'],
    ['sin mayúscula', 'secreta123'],
    ['sin número', 'Secreta'],
    ['con símbolos', 'Secreta123!'],
    ['con espacios', 'Secreta 123'],
  ])('rechaza una contraseña %s', (_case, value) => {
    expect(newPasswordSchema.safeParse(value).success).toBe(false)
  })

  it('acepta exactamente 128 caracteres', () => {
    const value = `A1${'a'.repeat(126)}`
    expect(value).toHaveLength(128)
    expect(newPasswordSchema.safeParse(value).success).toBe(true)
  })

  it('la contraseña actual solo exige longitud (puede tener símbolos)', () => {
    expect(currentPasswordSchema.safeParse('Vieja!12').success).toBe(true)
    expect(currentPasswordSchema.safeParse('corta').success).toBe(false)
  })
})
