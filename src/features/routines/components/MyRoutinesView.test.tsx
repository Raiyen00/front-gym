import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen, within } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { HttpResponse, http } from 'msw'
import { describe, expect, it } from 'vitest'

import { MyRoutinesView } from '@/features/routines/components/MyRoutinesView'
import { server } from '@/test/msw/server'

const BASE = 'http://127.0.0.1:8000'

const ROUTINE = {
  id: 9,
  user_id: 7,
  date_generated: '2026-10-25',
  state: true,
  exercises: [
    {
      id: 7,
      day: 'lunes',
      sets: 4,
      repetitions: '10',
      position: 1,
      rest: 60,
      exercise: {
        id: 1,
        name: 'Press de banca con barra',
        description: null,
        muscular_group: 'pecho',
      },
    },
  ],
}

function renderView(routines: unknown[]) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })
  server.use(
    http.get(`${BASE}/routines/me`, () => HttpResponse.json(routines)),
  )

  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter>
        <MyRoutinesView />
      </MemoryRouter>
    </QueryClientProvider>,
  )
}

describe('MyRoutinesView', () => {
  it('separa las rutinas inactivas en el historial', async () => {
    renderView([ROUTINE, { ...ROUTINE, id: 4, state: false }])

    const historyHeading = await screen.findByRole('heading', {
      name: 'Historial',
    })
    const history = historyHeading.closest('section')
    if (!history) throw new Error('No se encontró la sección Historial')

    expect(within(history).getByText('Plan #4')).toBeInTheDocument()
    expect(within(history).queryByText('Plan #9')).not.toBeInTheDocument()
    // La rutina activa sigue en la grilla principal.
    expect(screen.getByText('Plan #9')).toBeInTheDocument()
  })

  it('no muestra el historial si todas las rutinas están activas', async () => {
    renderView([ROUTINE])

    expect(await screen.findByText('Plan #9')).toBeInTheDocument()
    expect(
      screen.queryByRole('heading', { name: 'Historial' }),
    ).not.toBeInTheDocument()
  })
})
