import { queryKeys } from '@/lib/api/queryKeys'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import * as usersApi from '@/features/users/api'
import type { UserUpdate } from '@/types/user'

export function useUsers() {
  return useQuery({
    queryKey: queryKeys.users.all,
    queryFn: usersApi.getUsers,
  })
}

export function useUser(id: number) {
  return useQuery({
    queryKey: queryKeys.users.detail(id),
    queryFn: () => usersApi.getUser(id),
    enabled: id > 0,
  })
}

export function useUpdateUser(id: number) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: UserUpdate) => usersApi.updateUser(id, data),
    onSuccess: (updatedUser) => {
      queryClient.setQueryData(queryKeys.users.detail(id), updatedUser)
      queryClient.invalidateQueries({ queryKey: queryKeys.users.all })
    },
  })
}

export function useEnableUser() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: number) => usersApi.enableUser(id),
    onSuccess: (updatedUser) => {
      queryClient.setQueryData(queryKeys.users.detail(updatedUser.id), updatedUser)
      queryClient.invalidateQueries({ queryKey: queryKeys.users.all })
    },
  })
}

export function useDeleteUser() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: number) => usersApi.deleteUser(id),
    onSuccess: (_data, id) => {
      queryClient.removeQueries({ queryKey: queryKeys.users.detail(id) })
      queryClient.invalidateQueries({ queryKey: queryKeys.users.all })
    },
  })
}
