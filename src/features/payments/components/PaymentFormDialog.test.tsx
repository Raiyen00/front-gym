import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { HttpResponse, http } from 'msw'
import { describe, expect, it, vi } from 'vitest'

import { PaymentFormDialog } from '@/features/payments/components/PaymentFormDialog'
import { Toaster } from '@/components/ui/sonner'
import { server } from '@/test/msw/server'

const BASE = 'http://127.0.0.1:8000'

function renderDialog() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })
  server.use(http.get(`${BASE}/users`, () => HttpResponse.json([])))

  return render(
    <QueryClientProvider client={queryClient}>
      <PaymentFormDialog
        open
        isPending={false}
        onSubmit={vi.fn()}
        onOpenChange={vi.fn()}
      />
      <Toaster />
    </QueryClientProvider>,
  )
}

describe('PaymentFormDialog', () => {
  it('no envía el formulario si falta elegir socio y monto', async () => {
    const user = userEvent.setup()
    const onSubmit = vi.fn().mockResolvedValue(undefined)
    renderDialog()

    await user.click(screen.getByRole('button', { name: 'Registrar pago' }))

    await waitFor(() =>
      expect(screen.getByText('Seleccioná un socio')).toBeInTheDocument(),
    )
    expect(screen.getByText('Ingresá el monto')).toBeInTheDocument()
    expect(onSubmit).not.toHaveBeenCalled()
  })

  it('muestra el formulario con el vencimiento por defecto', () => {
    renderDialog()

    expect(screen.getByLabelText('Monto')).toBeInTheDocument()
    expect(screen.getByLabelText('Vencimiento')).toBeInTheDocument()
  })
})
