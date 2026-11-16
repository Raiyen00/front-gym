import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { HttpResponse, http } from 'msw'
import { describe, expect, it, vi } from 'vitest'

import { Toaster } from '@/components/ui/sonner'
import { AuthContext } from '@/features/auth/context'
import { UsersPage } from '@/features/users/components/UsersPage'
import { server } from '@/test/msw/server'
import type { User } from '@/types/user'

const BASE = 'http://127.0.0.1:8000'

const ADMIN: User = {
  id: 1,
  email: 'admin@gymsass.com',
  name: 'Admin',
  lastname: 'Gimnasio',
  dni: '87654321',
  phone: '1145678901',
  rol: 'admin',
  state: 'activo',
  register_date: '2026-01-01T00:00:00Z',
}

function renderPage() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })

  render(
    <QueryClientProvider client={queryClient}>
      <AuthContext.Provider
        value={{
          user: ADMIN,
          status: 'authenticated',
          login: vi.fn(),
          register: vi.fn(),
          logout: vi.fn(),
          updateCurrentUser: vi.fn(),
        }}
      >
        <UsersPage />
      </AuthContext.Provider>
      <Toaster />
    </QueryClientProvider>,
  )
}

/** Abre el alta y completa todos los campos obligatorios. */
async function fillCreateForm(user: ReturnType<typeof userEvent.setup>) {
  await screen.findByRole('button', { name: 'Nuevo socio' })
  await user.click(screen.getByRole('button', { name: 'Nuevo socio' }))

  await user.type(screen.getByLabelText('Nombre'), 'Ana')
  await user.type(screen.getByLabelText('Apellido'), 'Gómez')
  await user.type(screen.getByLabelText('DNI'), '38999888')
  await user.type(screen.getByLabelText('Teléfono'), '1145678901')
  await user.type(screen.getByLabelText('Correo electrónico'), 'ana@test.com')
  await user.type(screen.getByLabelText('Contraseña inicial'), 'Secreta123')
  await user.type(screen.getByLabelText('Confirmar contraseña'), 'Secreta123')

  await user.click(screen.getByRole('button', { name: 'Crear socio' }))
}

describe('UsersPage — alta de socio', () => {
  it('traduce el 409 de email duplicado a una acción concreta', async () => {
    const user = userEvent.setup()
    server.use(
      http.get(`${BASE}/users`, () => HttpResponse.json([ADMIN])),
      http.post(`${BASE}/auth/register`, () =>
        HttpResponse.json(
          { detail: 'Ya existe un usuario con ese email' },
          { status: 409 },
        ),
      ),
    )

    renderPage()
    await fillCreateForm(user)

    expect(
      await screen.findByText(
        'Ya existe un socio con ese email. Si lo diste de baja, buscalo en la lista y tocá "Habilitar".',
      ),
    ).toBeInTheDocument()
    // El diálogo sigue abierto para corregir el dato.
    expect(screen.getByLabelText('Correo electrónico')).toBeInTheDocument()
  })

  it('muestra el detail del backend cuando el error no es 409', async () => {
    const user = userEvent.setup()
    server.use(
      http.get(`${BASE}/users`, () => HttpResponse.json([ADMIN])),
      http.post(`${BASE}/auth/register`, () =>
        HttpResponse.json(
          { detail: 'El DNI debe tener 8 dígitos' },
          { status: 400 },
        ),
      ),
    )

    renderPage()
    await fillCreateForm(user)

    expect(
      await screen.findByText('El DNI debe tener 8 dígitos'),
    ).toBeInTheDocument()
  })
})
