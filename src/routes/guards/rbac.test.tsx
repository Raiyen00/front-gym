import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { HttpResponse, http } from 'msw'
import { beforeEach, describe, expect, it } from 'vitest'

import { App } from '@/App'
import { server } from '@/test/msw/server'
import type { Rol } from '@/types/enums'

const BASE = 'http://127.0.0.1:8000'

function makeUser(rol: Rol) {
  return {
    id: 1,
    email: 'ana@test.com',
    name: 'Ana',
    lastname: 'Gómez',
    dni: '38999888',
    phone: '1145678901',
    rol,
    active: true,
    register_date: '2026-01-01T00:00:00Z',
  }
}

function mockSession(rol: Rol) {
  localStorage.setItem('gymsass_token', 'jwt-test')
  server.use(http.get(`${BASE}/users/me`, () => HttpResponse.json(makeUser(rol))))
}

function goTo(path: string) {
  window.history.pushState({}, '', path)
}

beforeEach(() => {
  localStorage.clear()
})

describe('RBAC y navegación', () => {
  it('sin sesión redirige /dashboard a /login', async () => {
    goTo('/dashboard')
    render(<App />)

    expect(
      await screen.findByRole('heading', { name: 'Ingreso al sistema' }),
    ).toBeInTheDocument()
  })

  it('con sesión de cliente entra al panel', async () => {
    mockSession('cliente')
    goTo('/dashboard')
    render(<App />)

    expect(
      await screen.findByRole('heading', { name: 'Hola, Ana' }),
    ).toBeInTheDocument()
  })

  it('el cliente no ve en el menú las secciones restringidas', async () => {
    mockSession('cliente')
    goTo('/dashboard')
    render(<App />)

    await screen.findByRole('heading', { name: 'Hola, Ana' })
    expect(screen.queryByRole('link', { name: 'Socios' })).not.toBeInTheDocument()
    expect(screen.queryByRole('link', { name: 'Pagos' })).not.toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Mi perfil' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Mi membresía' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Rutinas' })).toBeInTheDocument()
  })

  it('rol sin permiso recibe 403', async () => {
    mockSession('cliente')
    goTo('/pagos')
    render(<App />)

    expect(await screen.findByText('Acceso denegado')).toBeInTheDocument()
  })

  it('el profesor ve Socios pero no Pagos', async () => {
    mockSession('profesor')
    goTo('/dashboard')
    render(<App />)

    await screen.findByRole('heading', { name: 'Hola, Ana' })
    expect(screen.getByRole('link', { name: 'Socios' })).toBeInTheDocument()
    expect(screen.queryByRole('link', { name: 'Pagos' })).not.toBeInTheDocument()
  })

  it('el admin accede a Pagos', async () => {
    mockSession('admin')
    server.use(
      http.get(`${BASE}/payment`, () => HttpResponse.json([])),
      http.get(`${BASE}/users`, () => HttpResponse.json([])),
    )
    goTo('/pagos')
    render(<App />)

    expect(
      await screen.findByRole('heading', { name: 'Pagos' }),
    ).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Socios' })).toBeInTheDocument()
  })

  it('el admin abre el diálogo de alta de socio', async () => {
    mockSession('admin')
    server.use(http.get(`${BASE}/users`, () => HttpResponse.json([])))
    goTo('/usuarios')
    const user = userEvent.setup()
    render(<App />)

    await screen.findByRole('heading', { name: 'Socios' })
    await user.click(screen.getByRole('button', { name: 'Nuevo socio' }))

    expect(
      await screen.findByRole('heading', { name: 'Nuevo socio' }),
    ).toBeInTheDocument()
    expect(screen.getByLabelText('Contraseña inicial')).toBeInTheDocument()
  })
})
