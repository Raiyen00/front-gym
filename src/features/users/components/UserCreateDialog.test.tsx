import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import { UserCreateDialog } from '@/features/users/components/UserCreateDialog'

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
    await user.type(screen.getByLabelText('Contraseña inicial'), 'secreta123')
    await user.type(screen.getByLabelText('Confirmar contraseña'), 'secreta123')

    await user.click(screen.getByRole('button', { name: 'Crear socio' }))

    await waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(1))
    expect(onSubmit).toHaveBeenCalledWith({
      name: 'Ana',
      lastname: 'Gómez',
      dni: '38999888',
      phone: '1145678901',
      email: 'ana@test.com',
      password: 'secreta123',
    })
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

    await user.type(screen.getByLabelText('Contraseña inicial'), 'secreta123')
    await user.type(screen.getByLabelText('Confirmar contraseña'), 'otraclave123')
    await user.click(screen.getByRole('button', { name: 'Crear socio' }))

    expect(
      await screen.findByText('Las contraseñas no coinciden'),
    ).toBeInTheDocument()
    expect(onSubmit).not.toHaveBeenCalled()
  })
})
