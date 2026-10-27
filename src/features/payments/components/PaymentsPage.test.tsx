import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen, within } from '@testing-library/react'
import { HttpResponse, http } from 'msw'
import { describe, expect, it } from 'vitest'

import { PaymentsPage } from '@/features/payments/components/PaymentsPage'
import { formatCurrency } from '@/lib/formatters'
import { server } from '@/test/msw/server'
import type { PaymentWire } from '@/types/payment'

const BASE = 'http://127.0.0.1:8000'

function isoAt(year: number, month: number): string {
  return new Date(year, month, 15, 12, 0, 0).toISOString()
}

/**
 * `getByText` normaliza solo el texto del DOM (`\s+` → espacio simple) y
 * compara el matcher string tal cual. `Intl` en es-AR separa el `$` del
 * importe con un no-break space, así que hay que normalizar lo esperado.
 */
function currencyText(value: number): string {
  return formatCurrency(value).replace(/\s+/g, ' ')
}

function makePayment(
  overrides: Partial<PaymentWire> & { id: number },
): PaymentWire {
  const now = new Date()
  return {
    user_id: 7,
    amount: 0,
    payment_method: 'efectivo',
    payment_date: isoAt(now.getFullYear(), now.getMonth()),
    // Lejos de la ventana de 7 días, para que no se liste como por vencer.
    expiration_date: isoAt(now.getFullYear(), now.getMonth() + 2),
    ...overrides,
  }
}

function renderPage() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })

  return render(
    <QueryClientProvider client={queryClient}>
      <PaymentsPage />
    </QueryClientProvider>,
  )
}

function mockPayments(payments: PaymentWire[]) {
  server.use(
    http.get(`${BASE}/payment`, () => HttpResponse.json(payments)),
    http.get(`${BASE}/users`, () => HttpResponse.json([])),
  )
}

describe('PaymentsPage', () => {
  it('suma el recaudado del mes aunque el backend mande amount como string', async () => {
    const now = new Date()
    const lastMonth = isoAt(now.getFullYear(), now.getMonth() - 1)

    mockPayments([
      makePayment({ id: 1, amount: '15000.00' }),
      makePayment({ id: 2, amount: '20000.00', payment_method: 'tarjeta' }),
      // De otro mes: no entra en el total.
      makePayment({ id: 3, amount: '99999.00', payment_date: lastMonth }),
    ])

    renderPage()

    expect(
      await screen.findByText('Recaudado este mes'),
    ).toBeInTheDocument()

    const summary = screen.getByRole('region', { name: 'Resumen de pagos' })
    expect(within(summary).getByText(currencyText(15000 + 20000))).toBeInTheDocument()
    expect(screen.queryByText(/NaN/)).not.toBeInTheDocument()

    // El pago de otro mes no suma pero sí aparece en el historial.
    const history = screen.getByRole('region', { name: 'Historial de pagos' })
    expect(within(history).getByText(currencyText(99999))).toBeInTheDocument()
    expect(within(history).getByText('3 de 3 pagos')).toBeInTheDocument()
  })

  it('muestra $0 cuando todavía no hay pagos del mes', async () => {
    const now = new Date()
    const lastMonth = isoAt(now.getFullYear(), now.getMonth() - 1)

    mockPayments([
      makePayment({ id: 1, amount: '99999.00', payment_date: lastMonth }),
    ])

    renderPage()

    expect(
      await screen.findByText('Recaudado este mes'),
    ).toBeInTheDocument()
    const summary = screen.getByRole('region', { name: 'Resumen de pagos' })
    expect(within(summary).getByText(currencyText(0))).toBeInTheDocument()
  })

  it('muestra la recaudación de los últimos 6 meses y los socios activos por mes', async () => {
    const now = new Date()
    const twoMonthsAgo = isoAt(now.getFullYear(), now.getMonth() - 2)

    mockPayments([
      makePayment({ id: 1, amount: '15000.00' }),
      makePayment({ id: 2, amount: '20000.00', user_id: 8 }),
      makePayment({
        id: 3,
        amount: '99999.00',
        payment_date: twoMonthsAgo,
        user_id: 9,
      }),
    ])

    renderPage()

    const collected = await screen.findByRole('region', {
      name: 'Recaudación mensual',
    })
    expect(within(collected).getByText(currencyText(15000 + 20000))).toBeInTheDocument()
    expect(within(collected).getByText(currencyText(99999))).toBeInTheDocument()
    // Los otros 4 meses de la serie están en cero.
    expect(within(collected).getAllByText(currencyText(0))).toHaveLength(4)

    const clients = screen.getByRole('region', {
      name: 'Clientes activos por mes',
    })
    expect(within(clients).getByText('2 socios')).toBeInTheDocument()
    expect(within(clients).getByText('1 socio')).toBeInTheDocument()
    expect(within(clients).getAllByText('0 socios')).toHaveLength(4)
  })

  it('lista los socios cuya membresía vence en los próximos 7 días', async () => {
    const now = new Date()
    const expirationIn = (days: number) =>
      new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate() + days,
        12,
        0,
        0,
      ).toISOString()

    server.use(
      http.get(`${BASE}/payment`, () =>
        HttpResponse.json([
          makePayment({ id: 1, user_id: 7, expiration_date: expirationIn(3) }),
          makePayment({ id: 2, user_id: 8, expiration_date: expirationIn(0) }),
          makePayment({ id: 3, user_id: 9, expiration_date: expirationIn(20) }),
          makePayment({ id: 4, user_id: 10, expiration_date: expirationIn(-5) }),
        ]),
      ),
      http.get(`${BASE}/users`, () =>
        HttpResponse.json([
          { id: 7, name: 'Ana', lastname: 'Gómez' },
          { id: 8, name: 'Luis', lastname: 'Pérez' },
        ]),
      ),
    )

    renderPage()

    const card = await screen.findByRole('region', {
      name: 'Membresías por vencer',
    })
    expect(
      within(card).getByText('2 socios en los próximos 7 días'),
    ).toBeInTheDocument()
    expect(within(card).getByText('Ana Gómez')).toBeInTheDocument()
    expect(within(card).getByText('Vence en 3 días')).toBeInTheDocument()
    expect(within(card).getByText('Luis Pérez')).toBeInTheDocument()
    expect(within(card).getByText('Vence hoy')).toBeInTheDocument()

    // A 20 días queda fuera de la ventana y la vencida no se lista acá.
    expect(within(card).queryByText('Socio #9')).not.toBeInTheDocument()
    expect(within(card).queryByText('Socio #10')).not.toBeInTheDocument()
    expect(within(card).queryByText(/Vence en 20 días/)).not.toBeInTheDocument()
  })

  it('avisa cuando no hay membresías por vencer', async () => {
    mockPayments([makePayment({ id: 1, amount: '15000.00' })])

    renderPage()

    const card = await screen.findByRole('region', {
      name: 'Membresías por vencer',
    })
    expect(
      within(card).getByText(
        'Ninguna membresía vence en los próximos 7 días.',
      ),
    ).toBeInTheDocument()
    expect(within(card).getByText('0 socios en los próximos 7 días')).toBeInTheDocument()
  })
})
