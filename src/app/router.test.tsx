import { render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'

import { App } from '@/App'

afterEach(() => {
  window.history.pushState({}, '', '/')
})

describe('AppRouter', () => {
  it('renderiza la página de auth en "/"', () => {
    render(<App />)
    expect(screen.getByText('Ingreso al sistema')).toBeInTheDocument()
  })

  it('renderiza 404 en una ruta desconocida', () => {
    window.history.pushState({}, '', '/ruta-inexistente')
    render(<App />)
    expect(screen.getByText('Página no encontrada')).toBeInTheDocument()
  })
})
