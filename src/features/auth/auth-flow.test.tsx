import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { HttpResponse, http } from 'msw'
import { beforeEach, describe, expect, it } from 'vitest'

import { App } from '@/App'
import { server } from '@/test/msw/server'

const BASE = 'http://127.0.0.1:8000'

const USER = {
  id: 7,
  email: 'ana@test.com',
  name: 'Ana',
  lastname: 'Gómez',
  dni: '38999888',
  phone: '1145678901',
  rol: 'cliente' as const,
  state: 'activo' as const,
  register_date: '2026-01-01T00:00:00Z',
}

beforeEach(() => {
  localStorage.clear()
  window.history.pushState({}, '', '/login')
})

async function renderLoggedIn() {
  localStorage.setItem('gymsass_token', 'jwt-abc')
  server.use(http.get(`${BASE}/users/me`, () => HttpResponse.json(USER)))
  render(<App />)
  await screen.findByText('Hola, Ana')
}

describe('flujo de autenticación', () => {
  it('inicia sesión e hidrata el usuario con /users/me', async () => {
    server.use(
      http.post(`${BASE}/auth/login`, () =>
        HttpResponse.json({ access_token: 'jwt-abc', token_type: 'bearer' }),
      ),
      http.get(`${BASE}/users/me`, () => HttpResponse.json(USER)),
    )

    const user = userEvent.setup()
    render(<App />)

    await user.type(screen.getByLabelText('Correo electrónico'), 'ana@test.com')
    await user.type(screen.getByLabelText('Contraseña'), 'secreta123')
    await user.click(screen.getByRole('button', { name: 'Ingresar al sistema' }))

    expect(await screen.findByText('Hola, Ana')).toBeInTheDocument()
    expect(window.location.pathname).toBe('/dashboard')
    expect(screen.queryByText(/Token de autorización/)).not.toBeInTheDocument()
    expect((await screen.findAllByText('Activo')).length).toBeGreaterThan(0)
    expect(localStorage.getItem('gymsass_token')).toBe('jwt-abc')
  })

  it('restaura la sesión si ya hay token al montar', async () => {
    localStorage.setItem('gymsass_token', 'jwt-previo')
    server.use(http.get(`${BASE}/users/me`, () => HttpResponse.json(USER)))

    render(<App />)

    expect(await screen.findByText('Hola, Ana')).toBeInTheDocument()
  })

  it('muestra y oculta la contraseña con el botón del ojo', async () => {
    const user = userEvent.setup()
    render(<App />)

    const password = screen.getByLabelText('Contraseña')
    expect(password).toHaveAttribute('type', 'password')

    await user.click(screen.getByRole('button', { name: 'Mostrar contraseña' }))
    expect(password).toHaveAttribute('type', 'text')

    await user.click(screen.getByRole('button', { name: 'Ocultar contraseña' }))
    expect(password).toHaveAttribute('type', 'password')
  })

  it('muestra el error de credenciales (401)', async () => {
    server.use(
      http.post(`${BASE}/auth/login`, () =>
        HttpResponse.json({ detail: 'Contraseña incorrecta' }, { status: 401 }),
      ),
    )

    const user = userEvent.setup()
    render(<App />)

    await user.type(screen.getByLabelText('Correo electrónico'), 'ana@test.com')
    await user.type(screen.getByLabelText('Contraseña'), 'mala')
    await user.click(screen.getByRole('button', { name: 'Ingresar al sistema' }))

    const matches = await screen.findAllByText('Contraseña incorrecta')
    expect(matches.length).toBeGreaterThan(0)
  })

  it('registra un socio y envía los campos correctos', async () => {
    let payload: Record<string, unknown> = {}
    server.use(
      http.post(`${BASE}/auth/register`, async ({ request }) => {
        payload = (await request.json()) as Record<string, unknown>
        return HttpResponse.json({ ...USER }, { status: 201 })
      }),
    )

    const user = userEvent.setup()
    render(<App />)

    await user.click(screen.getByRole('tab', { name: 'Registrar socio' }))
    await user.type(screen.getByLabelText('Nombre'), 'Ana')
    await user.type(screen.getByLabelText('Apellido'), 'Gómez')
    await user.type(screen.getByLabelText('DNI'), '38999888')
    await user.type(screen.getByLabelText('Teléfono'), '1145678901')
    await user.type(screen.getByLabelText('Correo electrónico'), 'ana@test.com')
    await user.type(screen.getByLabelText('Contraseña'), 'Secreta123')
    await user.type(screen.getByLabelText('Confirmar contraseña'), 'Secreta123')
    await user.click(screen.getByRole('button', { name: 'Crear cuenta de socio' }))

    expect(
      await screen.findByText(/¡Cuenta creada con éxito!/),
    ).toBeInTheDocument()
    expect(payload).toEqual({
      name: 'Ana',
      lastname: 'Gómez',
      dni: '38999888',
      phone: '1145678901',
      email: 'ana@test.com',
      password: 'Secreta123',
    })
  })

  it('valida que las contraseñas coincidan (sin llamar a la API)', async () => {
    const user = userEvent.setup()
    render(<App />)

    await user.click(screen.getByRole('tab', { name: 'Registrar socio' }))
    await user.type(screen.getByLabelText('Nombre'), 'Ana')
    await user.type(screen.getByLabelText('Apellido'), 'Gómez')
    await user.type(screen.getByLabelText('DNI'), '38999888')
    await user.type(screen.getByLabelText('Teléfono'), '1145678901')
    await user.type(screen.getByLabelText('Correo electrónico'), 'ana@test.com')
    await user.type(screen.getByLabelText('Contraseña'), 'Secreta123')
    await user.type(screen.getByLabelText('Confirmar contraseña'), 'Secreta124')
    await user.click(screen.getByRole('button', { name: 'Crear cuenta de socio' }))

    expect(
      await screen.findByText('Las contraseñas no coinciden'),
    ).toBeInTheDocument()
  })

  it('muestra la política y rechaza una contraseña sin mayúscula', async () => {
    const user = userEvent.setup()
    render(<App />)

    await user.click(screen.getByRole('tab', { name: 'Registrar socio' }))
    expect(
      screen.getByText(/Mínimo 8 caracteres, al menos una mayúscula/),
    ).toBeInTheDocument()

    await user.type(screen.getByLabelText('Nombre'), 'Ana')
    await user.type(screen.getByLabelText('Apellido'), 'Gómez')
    await user.type(screen.getByLabelText('DNI'), '38999888')
    await user.type(screen.getByLabelText('Teléfono'), '1145678901')
    await user.type(screen.getByLabelText('Correo electrónico'), 'ana@test.com')
    await user.type(screen.getByLabelText('Contraseña'), 'secreta123')
    await user.type(screen.getByLabelText('Confirmar contraseña'), 'secreta123')
    await user.click(screen.getByRole('button', { name: 'Crear cuenta de socio' }))

    expect(
      await screen.findByText(
        'La contraseña debe incluir al menos una mayúscula',
      ),
    ).toBeInTheDocument()
  })

  it('cambia la contraseña y envía old_password/new_password', async () => {
    let payload: Record<string, unknown> = {}
    await renderLoggedIn()
    server.use(
      http.patch(`${BASE}/auth/password`, async ({ request }) => {
        payload = (await request.json()) as Record<string, unknown>
        return HttpResponse.json(USER)
      }),
    )

    const user = userEvent.setup()
    await user.click(screen.getByRole('button', { name: 'Cambiar contraseña' }))
    await user.type(screen.getByLabelText('Contraseña actual'), 'secreta123')
    await user.type(screen.getByLabelText('Nueva contraseña'), 'Nueva1234')
    await user.type(
      screen.getByLabelText('Confirmar nueva contraseña'),
      'Nueva1234',
    )
    await user.click(
      screen.getByRole('button', { name: 'Actualizar contraseña' }),
    )

    expect(
      await screen.findByText('Contraseña actualizada correctamente'),
    ).toBeInTheDocument()
    expect(payload).toEqual({
      old_password: 'secreta123',
      new_password: 'Nueva1234',
    })
  })

  it('muestra el error del backend si la contraseña actual es incorrecta', async () => {
    await renderLoggedIn()
    server.use(
      http.patch(`${BASE}/auth/password`, () =>
        HttpResponse.json({ detail: 'Contraseña incorrecta' }, { status: 400 }),
      ),
    )

    const user = userEvent.setup()
    await user.click(screen.getByRole('button', { name: 'Cambiar contraseña' }))
    await user.type(screen.getByLabelText('Contraseña actual'), 'incorrecta')
    await user.type(screen.getByLabelText('Nueva contraseña'), 'Nueva1234')
    await user.type(
      screen.getByLabelText('Confirmar nueva contraseña'),
      'Nueva1234',
    )
    await user.click(
      screen.getByRole('button', { name: 'Actualizar contraseña' }),
    )

    const matches = await screen.findAllByText('Contraseña incorrecta')
    expect(matches.length).toBeGreaterThan(0)
  })

  it('valida que la confirmación coincida antes de llamar a la API', async () => {
    await renderLoggedIn()

    const user = userEvent.setup()
    await user.click(screen.getByRole('button', { name: 'Cambiar contraseña' }))
    await user.type(screen.getByLabelText('Contraseña actual'), 'secreta123')
    await user.type(screen.getByLabelText('Nueva contraseña'), 'Nueva1234')
    await user.type(
      screen.getByLabelText('Confirmar nueva contraseña'),
      'Nueva1235',
    )
    await user.click(
      screen.getByRole('button', { name: 'Actualizar contraseña' }),
    )

    expect(
      await screen.findByText('Las contraseñas no coinciden'),
    ).toBeInTheDocument()
  })

  it('cambia la contraseña desde el login y deja la sesión iniciada', async () => {
    let loginCalls = 0
    let patchAuthorization: string | null = null
    let patchPayload: Record<string, unknown> = {}

    server.use(
      http.post(`${BASE}/auth/login`, () => {
        loginCalls += 1
        return HttpResponse.json({
          access_token: `jwt-${loginCalls}`,
          token_type: 'bearer',
        })
      }),
      http.patch(`${BASE}/auth/password`, async ({ request }) => {
        patchAuthorization = request.headers.get('authorization')
        patchPayload = (await request.json()) as Record<string, unknown>
        return HttpResponse.json(USER)
      }),
      http.get(`${BASE}/users/me`, () => HttpResponse.json(USER)),
    )

    const user = userEvent.setup()
    render(<App />)

    await user.type(screen.getByLabelText('Correo electrónico'), 'ana@test.com')
    await user.click(
      screen.getByRole('button', { name: '¿Olvidaste tu contraseña?' }),
    )

    const dialog = await screen.findByRole('dialog')
    const dialogQueries = within(dialog)

    expect(dialogQueries.getByLabelText('Correo electrónico')).toHaveValue(
      'ana@test.com',
    )
    await user.type(
      dialogQueries.getByLabelText('Contraseña actual'),
      'secreta123',
    )
    await user.type(
      dialogQueries.getByLabelText('Nueva contraseña'),
      'Nueva1234',
    )
    await user.type(
      dialogQueries.getByLabelText('Confirmar nueva contraseña'),
      'Nueva1234',
    )
    await user.click(
      dialogQueries.getByRole('button', { name: 'Cambiar contraseña' }),
    )

    expect(await screen.findByText('Hola, Ana')).toBeInTheDocument()
    expect(window.location.pathname).toBe('/dashboard')
    expect(patchAuthorization).toBe('Bearer jwt-1')
    expect(patchPayload).toEqual({
      old_password: 'secreta123',
      new_password: 'Nueva1234',
    })
    // El primer login valida la identidad; el segundo abre la sesión nueva.
    expect(loginCalls).toBe(2)
  })

  it('no llama al PATCH si la contraseña actual es incorrecta', async () => {
    let patchCalls = 0

    server.use(
      http.post(`${BASE}/auth/login`, () =>
        HttpResponse.json({ detail: 'Contraseña incorrecta' }, { status: 401 }),
      ),
      http.patch(`${BASE}/auth/password`, () => {
        patchCalls += 1
        return HttpResponse.json(USER)
      }),
    )

    const user = userEvent.setup()
    render(<App />)

    await user.type(screen.getByLabelText('Correo electrónico'), 'ana@test.com')
    await user.click(
      screen.getByRole('button', { name: '¿Olvidaste tu contraseña?' }),
    )

    const dialog = await screen.findByRole('dialog')
    const dialogQueries = within(dialog)

    await user.type(
      dialogQueries.getByLabelText('Contraseña actual'),
      'incorrecta',
    )
    await user.type(
      dialogQueries.getByLabelText('Nueva contraseña'),
      'Nueva1234',
    )
    await user.type(
      dialogQueries.getByLabelText('Confirmar nueva contraseña'),
      'Nueva1234',
    )
    await user.click(
      dialogQueries.getByRole('button', { name: 'Cambiar contraseña' }),
    )

    const matches = await screen.findAllByText('Contraseña incorrecta')
    expect(matches.length).toBeGreaterThan(0)
    expect(patchCalls).toBe(0)
    expect(window.location.pathname).toBe('/login')
  })
})
