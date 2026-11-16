import { describe, expect, it } from 'vitest'

import { ApiError } from '@/lib/api/client'
import {
  findInactiveUserByEmail,
  getCreateUserErrorMessage,
} from '@/features/users/createSupport'
import type { User } from '@/types/user'

function makeUser(overrides: Partial<User> & { id: number }): User {
  return {
    email: 'ana@test.com',
    name: 'Ana',
    lastname: 'Gómez',
    dni: '38999888',
    phone: '1145678901',
    rol: 'cliente',
    state: 'inactivo',
    register_date: '2026-01-01T00:00:00Z',
    ...overrides,
  }
}

describe('getCreateUserErrorMessage', () => {
  it('traduce el 409 de email duplicado a una acción concreta', () => {
    const error = new ApiError('Ya existe un usuario con ese email', {
      status: 409,
      detail: 'Ya existe un usuario con ese email',
    })

    expect(getCreateUserErrorMessage(error)).toBe(
      'Ya existe un socio con ese email. Si lo diste de baja, buscalo en la lista y tocá "Habilitar".',
    )
  })

  it('traduce el 409 de DNI duplicado a una acción concreta', () => {
    const error = new ApiError('Ya existe un usuario con ese DNI', {
      status: 409,
      detail: 'Ya existe un usuario con ese DNI',
    })

    expect(getCreateUserErrorMessage(error)).toBe(
      'Ya existe un socio con ese DNI. Si lo diste de baja, buscalo en la lista y tocá "Habilitar".',
    )
  })

  it('da un mensaje accionable cuando el 409 no trae un detalle reconocible', () => {
    const error = new ApiError('El recurso ya existe o está duplicado.', {
      status: 409,
    })

    expect(getCreateUserErrorMessage(error)).toBe(
      'Ya existe un socio con esos datos. Buscalo en la lista en lugar de crear una cuenta nueva.',
    )
  })

  it('conserva el mensaje del backend para errores que no son 409', () => {
    const error = new ApiError('El DNI debe tener 8 dígitos', {
      status: 400,
      detail: 'El DNI debe tener 8 dígitos',
    })

    expect(getCreateUserErrorMessage(error)).toBe('El DNI debe tener 8 dígitos')
  })

  it('usa el mensaje de red cuando el error no viene de la API', () => {
    expect(getCreateUserErrorMessage(new Error('boom'))).toBe(
      'Ocurrió un problema de comunicación con el servidor.',
    )
  })
})

describe('findInactiveUserByEmail', () => {
  const users = [
    makeUser({ id: 1, email: 'ana@test.com', state: 'inactivo' }),
    makeUser({ id: 2, email: 'luis@test.com', state: 'activo' }),
  ]

  it('encuentra al socio dado de baja sin distinguir mayúsculas ni espacios', () => {
    expect(findInactiveUserByEmail(users, '  ANA@Test.com ')?.id).toBe(1)
  })

  it('ignora a los socios que no están dados de baja', () => {
    expect(findInactiveUserByEmail(users, 'luis@test.com')).toBeUndefined()
  })

  it('devuelve undefined con email vacío, lista ausente o email desconocido', () => {
    expect(findInactiveUserByEmail(users, '   ')).toBeUndefined()
    expect(findInactiveUserByEmail(undefined, 'ana@test.com')).toBeUndefined()
    expect(findInactiveUserByEmail(users, 'nadie@test.com')).toBeUndefined()
  })
})
