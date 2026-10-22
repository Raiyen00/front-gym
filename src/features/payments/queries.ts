import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { queryKeys } from '@/lib/api/queryKeys'
import * as paymentsApi from '@/features/payments/api'
import type { PaymentCreate } from '@/types/payment'

export function usePayments() {
  return useQuery({
    queryKey: queryKeys.payments.all,
    queryFn: paymentsApi.getPayments,
  })
}

export function useMyPayments() {
  return useQuery({
    queryKey: queryKeys.payments.me,
    queryFn: paymentsApi.getMyPayments,
  })
}

export function usePayment(id: number) {
  return useQuery({
    queryKey: queryKeys.payments.detail(id),
    queryFn: () => paymentsApi.getPayment(id),
    enabled: id > 0,
  })
}

export function useCreatePayment() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: PaymentCreate) => paymentsApi.createPayment(data),
    onSuccess: (created) => {
      queryClient.setQueryData(queryKeys.payments.detail(created.id), created)
      queryClient.invalidateQueries({ queryKey: queryKeys.payments.all })
      queryClient.invalidateQueries({ queryKey: queryKeys.payments.me })
    },
  })
}
