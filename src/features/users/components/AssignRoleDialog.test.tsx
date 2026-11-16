import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import { AssignRoleDialog } from '@/features/users/components/AssignRoleDialog'
import type { User } from '@/types/user'

const USER: User = {
  id: 7,
  email: 'ana@test.com',
  name: 'Ana',
  lastname: 'Gómez',
  dni: '38999888',
  phone: '1145678901',
  rol: 'cliente',
  state: 'activo',
  register_date: '2026-01-01T00:00:00Z',
}

describe('AssignRoleDialog', () => {
  it('envía el rol elegido', async () => {
    const onSubmit = vi.fn().mockResolvedValue(undefined)
    const user = userEvent.setup()

    render(
      <AssignRoleDialog
        user={USER}
        isPending={false}
        onSubmit={onSubmit}
        onOpenChange={vi.fn()}
      />,
    )

    await user.click(screen.getByRole('combobox', { name: 'Rol' }))
    await user.click(await screen.findByRole('option', { name: 'Profesor' }))
    await user.click(screen.getByRole('button', { name: 'Asignar rol' }))

    await waitFor(() => expect(onSubmit).toHaveBeenCalledWith('profesor'))
    expect(onSubmit).toHaveBeenCalledTimes(1)
  })

  it('deshabilita el submit mientras el rol no cambia', () => {
    render(
      <AssignRoleDialog
        user={USER}
        isPending={false}
        onSubmit={vi.fn()}
        onOpenChange={vi.fn()}
      />,
    )

    expect(screen.getByRole('button', { name: 'Asignar rol' })).toBeDisabled()
  })
})
