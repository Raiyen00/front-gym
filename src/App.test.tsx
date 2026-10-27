import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { App } from '@/App'

describe('App', () => {
  it('renderiza el shell de autenticación con la marca', () => {
    render(<App />)
    expect(screen.getByText('GymSasS')).toBeInTheDocument()
    expect(
      screen.getByText('Socios, cuotas y rutinas en un mismo lugar.'),
    ).toBeInTheDocument()
  })
})
