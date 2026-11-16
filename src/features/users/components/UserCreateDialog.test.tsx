import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import { UserCreateDialog } from '@/features/users/components/UserCreateDialog'
import type { User } from '@/types/user'

const INACTIVE_USER: User = {
  id: 9,
  email: 'ana@test.com',
  name: 'Ana',
  lastname: 'Gómez',
  dni: '38999888',
  phone: '1145678901',
  rol: 'cliente',
  state: 'inactivo',
  register_date: '2026-01-01T00:00:00Z',
}

describe('UserCreateDialog', () => {
  it('envía los datos del socio sin incluir confirmPassword', async () => {
    const onSubmit = vi.fn().mockResolvedValue(undefined)
    const user = userEvent.setup()

    render(
      <UserCreateDialog
        open
        isPending={false}
        onSubmit={onSubmit}
        onOpenChange={vi.fn()}
      />,
    )

    await user.type(screen.getByLabelText('Nombre'), 'Ana')
    await user.type(screen.getByLabelText('Apellido'), 'Gómez')
    await user.type(screen.getByLabelText('DNI'), '38999888')
    await user.type(screen.getByLabelText('Teléfono'), '1145678901')
    await user.type(screen.getByLabelText('Correo electrónico'), 'ana@test.com')
    await user.type(screen.getByLabelText('Contraseña inicial'), 'Secreta123')
    await user.type(screen.getByLabelText('Confirmar contraseña'), 'Secreta123')

    await user.click(screen.getByRole('button', { name: 'Crear socio' }))

    await waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(1))
    expect(onSubmit).toHaveBeenCalledWith({
      name: 'Ana',
      lastname: 'Gómez',
      dni: '38999888',
      phone: '1145678901',
      email: 'ana@test.com',
      password: 'Secreta123',
    })
    expect(
      screen.getByText(/Mínimo 8 caracteres, al menos una mayúscula/),
    ).toBeInTheDocument()
  })

  it('no envía el formulario si las contraseñas no coinciden', async () => {
    const onSubmit = vi.fn()
    const user = userEvent.setup()

    render(
      <UserCreateDialog
        open
        isPending={false}
        onSubmit={onSubmit}
        onOpenChange={vi.fn()}
      />,
    )

    await user.type(screen.getByLabelText('Contraseña inicial'), 'Secreta123')
    await user.type(screen.getByLabelText('Confirmar contraseña'), 'Otraclave123')
    await user.click(screen.getByRole('button', { name: 'Crear socio' }))

    expect(
      await screen.findByText('Las contraseñas no coinciden'),
    ).toBeInTheDocument()
    expect(onSubmit).not.toHaveBeenCalled()
  })

  it('avisa cuando el email pertenece a un socio dado de baja', async () => {
    const user = userEvent.setup()

    render(
      <UserCreateDialog
        open
        isPending={false}
        users={[INACTIVE_USER]}
        onSubmit={vi.fn()}
        onOpenChange={vi.fn()}
      />,
    )

    await user.type(screen.getByLabelText('Correo electrónico'), 'ana@test.com')

    expect(
      await screen.findByText(/Ya existe un socio dado de baja con ese email/),
    ).toBeInTheDocument()
    expect(screen.getByText(/Ana Gómez/)).toBeInTheDocument()
  })

  it('no avisa cuando el email es de un socio habilitado', async () => {
    const user = userEvent.setup()

    render(
      <UserCreateDialog
        open
        isPending={false}
        users={[{ ...INACTIVE_USER, state: 'activo' }]}
        onSubmit={vi.fn()}
        onOpenChange={vi.fn()}
      />,
    )

    await user.type(screen.getByLabelText('Correo electrónico'), 'ana@test.com')

    expect(
      screen.queryByText(/Ya existe un socio dado de baja con ese email/),
    ).not.toBeInTheDocument()
  })
})
