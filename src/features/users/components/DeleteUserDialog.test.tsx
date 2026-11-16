import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import { DeleteUserDialog } from '@/features/users/components/DeleteUserDialog'
import type { User } from '@/types/user'

const USER: User = {
  id: 7,
  email: 'ana@test.com',
  name: 'Ana',
  lastname: 'Gómez',
  dni: '38999888',
  phone: '1145678901',
  rol: 'cliente',
  state: 'inactivo',
  register_date: '2026-01-01T00:00:00Z',
}

function renderDialog(isPending = false) {
  const onConfirm = vi.fn()

  render(
    <DeleteUserDialog
      user={USER}
      isPending={isPending}
      onConfirm={onConfirm}
      onOpenChange={vi.fn()}
    />,
  )

  return { onConfirm }
}

describe('DeleteUserDialog', () => {
  it('habla de dar de baja y aclara que el historial se conserva', () => {
    renderDialog()

    expect(
      screen.getByRole('heading', { name: 'Dar de baja' }),
    ).toBeInTheDocument()
    expect(screen.getByText(/su historial se conserva/)).toBeInTheDocument()
    expect(screen.getByText(/"Habilitar"/)).toBeInTheDocument()
    expect(screen.queryByText(/no se puede deshacer/)).not.toBeInTheDocument()
  })

  it('confirma la baja al tocar el botón', async () => {
    const user = userEvent.setup()
    const { onConfirm } = renderDialog()

    await user.click(screen.getByRole('button', { name: 'Dar de baja' }))

    expect(onConfirm).toHaveBeenCalledTimes(1)
  })

  it('muestra el estado pendiente y bloquea el botón', () => {
    renderDialog(true)

    expect(
      screen.getByRole('button', { name: /Dando de baja/ }),
    ).toBeDisabled()
  })
})
