import { describe, expect, it } from 'vitest'

import { NAV_ITEMS } from '@/config/nav'
import { ROLES, type Rol } from '@/types/enums'

/** Rutas visibles para un rol (lo que consume el sidebar). */
function routesFor(rol: Rol): string[] {
  return NAV_ITEMS.filter((item) => item.allowedRoles.includes(rol)).map(
    (item) => item.to,
  )
}

describe('NAV_ITEMS (matriz de acceso)', () => {
  it('el profesor ve su perfil y su perfil deportivo', () => {
    const routes = routesFor('profesor')

    expect(routes).toContain('/mi-perfil')
    expect(routes).toContain('/mi-perfil-deportivo')
    // Sigue sin acceso a la gestión de pagos ni a los perfiles ajenos.
    expect(routes).not.toContain('/pagos')
    expect(routes).not.toContain('/perfiles-deportivos')
  })

  it('el cliente ve Mi perfil, Mi perfil deportivo y Mi membresía', () => {
    expect(routesFor('cliente')).toEqual(
      expect.arrayContaining([
        '/mi-perfil',
        '/mi-perfil-deportivo',
        '/mi-membresia',
      ]),
    )
  })

  it('el admin gestiona socios, perfiles y pagos sin las vistas de cliente', () => {
    const routes = routesFor('admin')

    expect(routes).toEqual(
      expect.arrayContaining(['/usuarios', '/perfiles-deportivos', '/pagos']),
    )
    expect(routes).not.toContain('/mi-membresia')
    expect(routes).not.toContain('/mi-perfil-deportivo')
  })

  it('todos los roles ven el panel y las rutinas', () => {
    for (const rol of ROLES) {
      expect(routesFor(rol)).toEqual(
        expect.arrayContaining(['/dashboard', '/rutinas']),
      )
    }
  })

  it('cada ítem declara al menos un rol', () => {
    for (const item of NAV_ITEMS) {
      expect(item.allowedRoles.length).toBeGreaterThan(0)
    }
  })
})
