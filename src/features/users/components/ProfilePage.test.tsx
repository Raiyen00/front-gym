import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { HttpResponse, http } from 'msw'
import { describe, expect, it, vi } from 'vitest'

import { Toaster } from '@/components/ui/sonner'
import { AuthContext } from '@/features/auth/context'
import { ProfilePage } from '@/features/users/components/ProfilePage'
import { server } from '@/test/msw/server'
import type { User } from '@/types/user'

const BASE = 'http://127.0.0.1:8000'

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

function renderPage() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })
  const updateCurrentUser = vi.fn()

  render(
    <QueryClientProvider client={queryClient}>
      <AuthContext.Provider
        value={{
          user: USER,
          status: 'authenticated',
          login: vi.fn(),
          register: vi.fn(),
          logout: vi.fn(),
          updateCurrentUser,
        }}
      >
        <ProfilePage />
      </AuthContext.Provider>
      <Toaster />
    </QueryClientProvider>,
  )

  return { updateCurrentUser }
}

describe('ProfilePage (cliente edita sus propios datos)', () => {
  it('hace PATCH /users/me solo con el campo modificado', async () => {
    const user = userEvent.setup()
    let payload: Record<string, unknown> = {}
    let path = ''
    server.use(
      http.patch(`${BASE}/users/me`, async ({ request }) => {
        path = new URL(request.url).pathname
        payload = (await request.json()) as Record<string, unknown>
        return HttpResponse.json({ ...USER, phone: '1199998888' })
      }),
    )
    const { updateCurrentUser } = renderPage()

    const phone = screen.getByLabelText('Teléfono')
    await user.clear(phone)
    await user.type(phone, '1199998888')
    await user.click(screen.getByRole('button', { name: 'Guardar cambios' }))

    await waitFor(() => expect(payload).toEqual({ phone: '1199998888' }))
    expect(path).toBe('/users/me')
    expect(updateCurrentUser).toHaveBeenCalledWith(
      expect.objectContaining({ phone: '1199998888' }),
    )
    expect(
      await screen.findByText('Perfil actualizado correctamente'),
    ).toBeInTheDocument()
  })

  it('no llama a la API si no hay cambios', async () => {
    const user = userEvent.setup()
    let called = false
    server.use(
      http.patch(`${BASE}/users/me`, () => {
        called = true
        return HttpResponse.json(USER)
      }),
    )
    renderPage()

    await user.click(screen.getByRole('button', { name: 'Guardar cambios' }))

    expect(
      await screen.findByText('No hay cambios para guardar'),
    ).toBeInTheDocument()
    expect(called).toBe(false)
  })
})
