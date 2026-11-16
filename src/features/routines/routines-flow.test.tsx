import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { HttpResponse, http } from 'msw'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { App } from '@/App'
import { server } from '@/test/msw/server'

const BASE = 'http://127.0.0.1:8000'

const CLIENT = {
  id: 7,
  email: 'ana@test.com',
  name: 'Ana',
  lastname: 'Gómez',
  dni: '38999888',
  phone: '1145678901',
  rol: 'cliente',
  state: 'habilitado_entrenar',
  register_date: '2026-01-01T00:00:00Z',
}

const SPORT_PROFILE = {
  id: 3,
  user_id: 7,
  goal: 'fuerza',
  level: 'principiante',
  days_per_week: 3,
  session_duration: 60,
  age: 30,
  injuries: null,
  trainer_tracking: false,
  created_at: '2026-01-02T00:00:00Z',
}

const EXERCISE = {
  id: 1,
  name: 'Press de banca con barra',
  description: 'Banco plano, agarre medio',
  muscular_group: 'pecho',
}

const ROUTINE_DETAIL = {
  id: 9,
  user_id: 7,
  date_generated: '2026-10-25',
  state: true,
  exercises: [
    {
      id: 8,
      day: 'miercoles',
      sets: 3,
      repetitions: '12',
      position: 1,
      rest: 45,
      exercise: {
        ...EXERCISE,
        id: 2,
        name: 'Remo con barra',
        muscular_group: 'espalda',
      },
    },
    {
      id: 7,
      day: 'lunes',
      sets: 4,
      repetitions: '10',
      position: 2,
      rest: 60,
      exercise: EXERCISE,
    },
    {
      id: 6,
      day: 'lunes',
      sets: 3,
      repetitions: '8-12',
      position: 1,
      rest: 90,
      exercise: {
        ...EXERCISE,
        id: 3,
        name: 'Sentadilla',
        muscular_group: 'pierna',
      },
    },
  ],
}

function mockSession(rol: 'cliente' | 'admin') {
  localStorage.setItem('gymsass_token', 'jwt-test')
  server.use(
    http.get(`${BASE}/users/me`, () =>
      HttpResponse.json({ ...CLIENT, rol }),
    ),
  )
}

beforeEach(() => {
  localStorage.clear()
})

afterEach(() => {
  vi.restoreAllMocks()
})

describe('flujo de rutinas', () => {
  it('el cliente ve sus rutinas y el detalle agrupado en solo lectura', async () => {
    const user = userEvent.setup()
    mockSession('cliente')
    server.use(
      http.get(`${BASE}/routines/me`, () =>
        HttpResponse.json([ROUTINE_DETAIL]),
      ),
      http.get(`${BASE}/routines/9`, () =>
        HttpResponse.json(ROUTINE_DETAIL),
      ),
    )
    window.history.pushState({}, '', '/rutinas')

    render(<App />)

    expect(
      await screen.findByRole('heading', { name: 'Mis rutinas' }),
    ).toBeInTheDocument()
    expect(screen.getByText('Plan #9')).toBeInTheDocument()

    await user.click(screen.getByRole('link', { name: /Ver rutina/ }))

    expect(
      await screen.findByRole('heading', { name: 'Rutina #9' }),
    ).toBeInTheDocument()
    expect(
      screen.queryByRole('button', { name: 'Agregar ejercicio' }),
    ).not.toBeInTheDocument()
    // Cada ejercicio aparece dos veces: en la tabla de pantalla y en la
    // hoja imprimible (que está oculta, pero los textos se buscan igual).
    expect(screen.getAllByText('Press de banca con barra')).toHaveLength(2)
    expect(screen.getAllByText('Remo con barra')).toHaveLength(2)

    const dayHeadings = screen
      .getAllByRole('heading', { level: 2 })
      .map((heading) => heading.textContent)
    expect(dayHeadings).toEqual(['Lunes', 'Miércoles'])
  })

  it('el admin ve el listado de rutinas y acciones de gestión', async () => {
    mockSession('admin')
    server.use(
      http.get(`${BASE}/routines`, () =>
        HttpResponse.json([
          {
            id: 9,
            user_id: 7,
            date_generated: '2026-10-25',
            state: true,
          },
        ]),
      ),
      http.get(`${BASE}/users`, () => HttpResponse.json([CLIENT])),
      http.get(`${BASE}/routines/9`, () =>
        HttpResponse.json(ROUTINE_DETAIL),
      ),
    )
    window.history.pushState({}, '', '/rutinas')

    render(<App />)

    expect(
      await screen.findByRole('heading', { name: 'Rutinas' }),
    ).toBeInTheDocument()
    // El nombre aparece en el encabezado de sesión y en la fila de la rutina.
    expect((await screen.findAllByText('Ana Gómez')).length).toBeGreaterThan(0)
    expect(screen.getByRole('button', { name: 'Nueva rutina' })).toBeInTheDocument()

    window.history.pushState({}, '', '/rutinas/9')
    window.dispatchEvent(new PopStateEvent('popstate'))

    expect(
      await screen.findByRole('heading', { name: 'Rutina #9' }),
    ).toBeInTheDocument()
    expect(
      await screen.findByRole('button', { name: 'Agregar ejercicio' }),
    ).toBeInTheDocument()
  })

  it('al crear una rutina navega al detalle con el formulario de ejercicios abierto', async () => {
    const user = userEvent.setup()
    mockSession('admin')
    let createdBody: Record<string, unknown> = {}
    server.use(
      http.get(`${BASE}/routines`, () => HttpResponse.json([])),
      http.get(`${BASE}/users`, () => HttpResponse.json([CLIENT])),
      http.get(`${BASE}/sport-profiles`, () =>
        HttpResponse.json([SPORT_PROFILE]),
      ),
      http.post(`${BASE}/routines`, async ({ request }) => {
        createdBody = (await request.json()) as Record<string, unknown>
        return HttpResponse.json(
          { id: 9, user_id: 7, date_generated: '2026-10-25', state: true },
          { status: 201 },
        )
      }),
      http.get(`${BASE}/routines/9`, () =>
        HttpResponse.json({ ...ROUTINE_DETAIL, exercises: [] }),
      ),
      http.get(`${BASE}/exercises`, () => HttpResponse.json([EXERCISE])),
    )
    window.history.pushState({}, '', '/rutinas')

    render(<App />)

    await screen.findByRole('heading', { name: 'Rutinas' })
    await user.click(screen.getByRole('button', { name: 'Nueva rutina' }))

    await user.click(screen.getByRole('combobox', { name: 'Socio' }))
    await user.click(await screen.findByRole('option', { name: /Ana Gómez/ }))
    await user.click(screen.getByRole('button', { name: 'Crear rutina' }))

    expect(createdBody).toMatchObject({ user_id: 7, state: true })

    // La rutina se crea vacía: el detalle abre el formulario de ejercicios.
    expect(window.location.pathname).toBe('/rutinas/9')
    const dialog = await screen.findByRole('dialog')
    expect(
      within(dialog).getByRole('heading', { name: 'Agregar ejercicio' }),
    ).toBeInTheDocument()

    await user.click(within(dialog).getByRole('button', { name: 'Cancelar' }))

    expect(
      await screen.findByRole('heading', { name: 'Rutina #9' }),
    ).toBeInTheDocument()
  })

  it('solo ofrece socios habilitados con perfil deportivo y muestra el 409 inline', async () => {
    const user = userEvent.setup()
    mockSession('admin')
    const sinPerfil = {
      ...CLIENT,
      id: 8,
      email: 'beto@test.com',
      name: 'Beto',
      lastname: 'Pérez',
    }
    const noHabilitado = {
      ...CLIENT,
      id: 9,
      email: 'carla@test.com',
      name: 'Carla',
      lastname: 'Ruiz',
      state: 'activo',
    }
    server.use(
      http.get(`${BASE}/routines`, () => HttpResponse.json([])),
      http.get(`${BASE}/users`, () =>
        HttpResponse.json([CLIENT, sinPerfil, noHabilitado]),
      ),
      http.get(`${BASE}/sport-profiles`, () =>
        HttpResponse.json([SPORT_PROFILE]),
      ),
      http.post(`${BASE}/routines`, () =>
        HttpResponse.json(
          { detail: 'El usuario no tiene un perfil deportivo' },
          { status: 409 },
        ),
      ),
    )
    window.history.pushState({}, '', '/rutinas')

    render(<App />)

    await screen.findByRole('heading', { name: 'Rutinas' })
    await user.click(screen.getByRole('button', { name: 'Nueva rutina' }))
    await user.click(screen.getByRole('combobox', { name: 'Socio' }))

    expect(
      await screen.findByRole('option', { name: /Ana Gómez/ }),
    ).toBeInTheDocument()
    expect(
      screen.queryByRole('option', { name: /Beto Pérez/ }),
    ).not.toBeInTheDocument()
    expect(
      screen.queryByRole('option', { name: /Carla Ruiz/ }),
    ).not.toBeInTheDocument()

    await user.click(screen.getByRole('option', { name: /Ana Gómez/ }))
    await user.click(screen.getByRole('button', { name: 'Crear rutina' }))

    expect(
      await screen.findByText(
        'El socio no tiene un perfil deportivo. Creá su perfil deportivo antes de asignarle una rutina.',
      ),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('heading', { name: 'Nueva rutina' }),
    ).toBeInTheDocument()
  })

  it('desactiva una rutina desde el detalle', async () => {
    const user = userEvent.setup()
    mockSession('admin')
    let patchedBody: Record<string, unknown> | null = null
    let routineState = true
    server.use(
      http.get(`${BASE}/routines/9`, () =>
        HttpResponse.json({ ...ROUTINE_DETAIL, state: routineState }),
      ),
      http.get(`${BASE}/users`, () => HttpResponse.json([CLIENT])),
      http.patch(`${BASE}/routines/9`, async ({ request }) => {
        patchedBody = (await request.json()) as Record<string, unknown>
        routineState = false
        return HttpResponse.json({ ...ROUTINE_DETAIL, state: routineState })
      }),
    )
    window.history.pushState({}, '', '/rutinas/9')

    render(<App />)

    await user.click(await screen.findByRole('button', { name: 'Desactivar' }))

    await waitFor(() => expect(patchedBody).toEqual({ state: false }))
    expect(await screen.findByText('Rutina desactivada')).toBeInTheDocument()
    expect(await screen.findByRole('button', { name: 'Activar' })).toBeInTheDocument()
  })

  it('permite imprimir la rutina y compartirla por WhatsApp', async () => {
    const user = userEvent.setup()
    mockSession('cliente')
    server.use(
      http.get(`${BASE}/routines/me`, () =>
        HttpResponse.json([ROUTINE_DETAIL]),
      ),
      http.get(`${BASE}/routines/9`, () =>
        HttpResponse.json(ROUTINE_DETAIL),
      ),
    )
    window.history.pushState({}, '', '/rutinas/9')
    const printSpy = vi.spyOn(window, 'print').mockImplementation(() => {})

    render(<App />)

    expect(
      await screen.findByRole('heading', { name: 'Rutina #9' }),
    ).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Imprimir / PDF' }))
    expect(printSpy).toHaveBeenCalledTimes(1)

    const link = screen.getByRole('link', { name: 'Compartir por WhatsApp' })
    expect(link).toHaveAttribute('target', '_blank')
    const href = link.getAttribute('href') ?? ''
    expect(href.startsWith('https://wa.me/?text=')).toBe(true)
    const text = decodeURIComponent(href.slice(href.indexOf('text=') + 5))
    expect(text).toContain('Rutina #9 — Ana Gómez')
    expect(text).toContain('Generada el 25/10/2026 · 3 ejercicios')
    expect(text).toContain('Press de banca con barra (Pecho)')

    // La hoja imprimible existe en el DOM pero está oculta en pantalla:
    // sin `hidden: true` solo se ve el encabezado de la página.
    expect(screen.getAllByRole('heading', { name: 'Rutina #9' })).toHaveLength(1)
    expect(
      screen.getAllByRole('heading', { name: 'Rutina #9', hidden: true }),
    ).toHaveLength(2)
  })
})
