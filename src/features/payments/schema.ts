import { z } from 'zod'

import { METODOS_PAGO } from '@/types/enums'

/**
 * Formulario de alta de pago. El monto se maneja como string (acepta coma o
 * punto decimal) y la fecha como `YYYY-MM-DD` propia de `<input type="date">`.
 * La conversión al contrato de `PaymentCreate` vive en `payload.ts`.
 */
export const paymentFormSchema = z.object({
  user_id: z.string().trim().min(1, 'Seleccioná un socio'),
  amount: z
    .string()
    .trim()
    .min(1, 'Ingresá el monto')
    .refine((value) => {
      const amount = Number(value.replace(',', '.'))
      return Number.isFinite(amount) && amount > 0
    }, 'El monto debe ser mayor a 0'),
  payment_method: z.enum(METODOS_PAGO),
  expiration_date: z
    .string()
    .trim()
    .min(1, 'Seleccioná la fecha de vencimiento')
    .refine((value) => !Number.isNaN(Date.parse(value)), 'Fecha inválida'),
})

export type PaymentFormValues = z.infer<typeof paymentFormSchema>
