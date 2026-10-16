import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { Button } from '@/components/ui/button'

describe('Button', () => {
  it('renderiza el contenido', () => {
    render(<Button>Ingresar al sistema</Button>)
    expect(
      screen.getByRole('button', { name: 'Ingresar al sistema' }),
    ).toBeInTheDocument()
  })

  it('aplica la variante destructive', () => {
    render(<Button variant="destructive">Cerrar</Button>)
    expect(screen.getByRole('button', { name: 'Cerrar' })).toHaveAttribute(
      'data-variant',
      'destructive',
    )
  })
})
