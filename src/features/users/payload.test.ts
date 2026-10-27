import { describe, expect, it } from 'vitest'

import { buildUserUpdate } from '@/features/users/payload'

const VALUES = {
  name: 'Ana',
  lastname: 'Gómez',
  dni: '38999888',
  phone: '1145678901',
  email: 'ana@test.com',
}

describe('buildUserUpdate', () => {
  it('envía solo los campos modificados', () => {
    expect(buildUserUpdate(VALUES, { phone: true })).toEqual({
      phone: '1145678901',
    })
  })

  it('devuelve un objeto vacío si no hay cambios', () => {
    expect(buildUserUpdate(VALUES, {})).toEqual({})
  })
})
