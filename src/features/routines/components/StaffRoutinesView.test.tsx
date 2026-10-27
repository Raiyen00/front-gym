import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { HttpResponse, http } from 'msw'
import { describe, expect, it } from 'vitest'

import { Toaster } from '@/components/ui/sonner'
import { StaffRoutinesView } from '@/features/routines/components/StaffRoutinesView'
import { server } from '@/test/msw/server'

const BASE = 'http://127.0.0.1:8000'

const ROUTINE = {
  id: 9,
  user_id: 7,
  date_generated: '2026-10-25',
  state: true,
}

const CLIENT = {
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

function renderView() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })

  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter>
        <StaffRoutinesView />
      </MemoryRouter>
      <Toaster />
    </QueryClientProvider>,
  )
}

describe('StaffRoutinesView', () => {
  it('desactiva una rutina desde el menú de acciones', async () => {
    const user = userEvent.setup()
    let patchedBody: Record<string, unknown> | null = null
    server.use(
      http.get(`${BASE}/routines`, () => HttpResponse.json([ROUTINE])),
      http.get(`${BASE}/users`, () => HttpResponse.json([CLIENT])),
      http.patch(`${BASE}/routines/9`, async ({ request }) => {
        patchedBody = (await request.json()) as Record<string, unknown>
        return HttpResponse.json({ ...ROUTINE, state: false })
      }),
    )

    renderView()

    await user.click(
      await screen.findByRole('button', { name: 'Acciones de la rutina 9' }),
    )
    await user.click(await screen.findByRole('menuitem', { name: 'Desactivar' }))

    await waitFor(() => expect(patchedBody).toEqual({ state: false }))
    expect(await screen.findByText('Rutina desactivada')).toBeInTheDocument()
  })

  it('ofrece activar cuando la rutina ya está inactiva', async () => {
    const user = userEvent.setup()
    server.use(
      http.get(`${BASE}/routines`, () =>
        HttpResponse.json([{ ...ROUTINE, state: false }]),
      ),
      http.get(`${BASE}/users`, () => HttpResponse.json([CLIENT])),
    )

    renderView()

    await user.click(
      await screen.findByRole('button', { name: 'Acciones de la rutina 9' }),
    )
    expect(
      await screen.findByRole('menuitem', { name: 'Activar' }),
    ).toBeInTheDocument()
  })
})
