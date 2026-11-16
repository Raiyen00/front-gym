import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { HttpResponse, http } from 'msw'
import type { ComponentProps } from 'react'
import { describe, expect, it, vi } from 'vitest'

import { SportProfileFormDialog } from '@/features/sportProfiles/components/SportProfileFormDialog'
import { Toaster } from '@/components/ui/sonner'
import { server } from '@/test/msw/server'
import type { SportProfile } from '@/types/sportProfile'
import type { User } from '@/types/user'

const BASE = 'http://127.0.0.1:8000'

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

function makeUser(overrides: Partial<User>): User {
  return {
    id: 1,
    email: 'socio@test.com',
    name: 'Socio',
    lastname: 'Test',
    dni: '30000000',
    phone: null,
    rol: 'cliente',
    state: 'habilitado_entrenar',
    register_date: '2026-01-01T00:00:00Z',
    ...overrides,
  }
}

function renderDialog(
  props: Partial<ComponentProps<typeof SportProfileFormDialog>> = {},
  users: User[] = [],
) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })
  server.use(http.get(`${BASE}/users`, () => HttpResponse.json(users)))

  return render(
    <QueryClientProvider client={queryClient}>
      <SportProfileFormDialog
        open
        profile={ORIGINAL}
        isPending={false}
        onSubmit={vi.fn()}
        onOpenChange={vi.fn()}
        {...props}
      />
      <Toaster />
    </QueryClientProvider>,
  )
}

describe('SportProfileFormDialog (alta)', () => {
  it('solo ofrece socios habilitados para entrenar', async () => {
    const user = userEvent.setup()
    renderDialog(
      { profile: null },
      [
        makeUser({ id: 7, name: 'Ana', lastname: 'Habilitada' }),
        makeUser({
          id: 8,
          name: 'Beto',
          lastname: 'Pendiente',
          state: 'pendiente_habilitacion',
        }),
      ],
    )

    const select = await screen.findByRole('combobox', { name: 'Socio o profesor' })
    await waitFor(() => expect(select).toBeEnabled())
    await user.click(select)

    expect(
      await screen.findByRole('option', { name: /Ana Habilitada/ }),
    ).toBeInTheDocument()
    expect(
      screen.queryByRole('option', { name: /Beto Pendiente/ }),
    ).not.toBeInTheDocument()
  })

  it('avisa cuando no hay socios habilitados', async () => {
    renderDialog({ profile: null }, [
      makeUser({ id: 8, state: 'pendiente_habilitacion' }),
    ])

    expect(
      await screen.findByText(/No hay socios ni profesores habilitados para entrenar/),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('combobox', { name: 'Socio o profesor' }),
    ).toBeDisabled()
  })
})

describe('SportProfileFormDialog (edición)', () => {
  it('envía PATCH solo con trainer_tracking al cambiar el seguimiento', async () => {
    const onSubmit = vi.fn().mockResolvedValue(undefined)
    const user = userEvent.setup()
    renderDialog({ onSubmit })

    await user.click(screen.getByRole('checkbox', { name: /seguimiento del entrenador/i }))
    await user.click(screen.getByRole('button', { name: 'Guardar cambios' }))

    await waitFor(() =>
      expect(onSubmit).toHaveBeenCalledWith({ trainer_tracking: true }),
    )
    expect(onSubmit).toHaveBeenCalledTimes(1)
  })

  it('no llama a onSubmit si no hay cambios', async () => {
    const onSubmit = vi.fn().mockResolvedValue(undefined)
    const user = userEvent.setup()
    renderDialog({ onSubmit })

    await user.click(screen.getByRole('button', { name: 'Guardar cambios' }))

    await waitFor(() => expect(screen.getByText('No hay cambios para guardar')).toBeInTheDocument())
    expect(onSubmit).not.toHaveBeenCalled()
  })
})
