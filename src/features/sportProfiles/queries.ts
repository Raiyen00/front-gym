import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { queryKeys } from '@/lib/api/queryKeys'
import * as sportProfilesApi from '@/features/sportProfiles/api'
import type {
  SportProfileCreate,
  SportProfileUpdate,
} from '@/types/sportProfile'

export function useSportProfiles() {
  return useQuery({
    queryKey: queryKeys.sportProfiles.all,
    queryFn: sportProfilesApi.getSportProfiles,
  })
}

export function useMySportProfiles() {
  return useQuery({
    queryKey: queryKeys.sportProfiles.me,
    queryFn: sportProfilesApi.getMySportProfiles,
  })
}

export function useSportProfile(id: number) {
  return useQuery({
    queryKey: queryKeys.sportProfiles.detail(id),
    queryFn: () => sportProfilesApi.getSportProfile(id),
    enabled: id > 0,
  })
}

export function useCreateSportProfile() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: SportProfileCreate) => sportProfilesApi.createSportProfile(data),
    onSuccess: (created) => {
      queryClient.setQueryData(queryKeys.sportProfiles.detail(created.id), created)
      queryClient.invalidateQueries({ queryKey: queryKeys.sportProfiles.all })
    },
  })
}

export function useUpdateSportProfile(id: number) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: SportProfileUpdate) => sportProfilesApi.updateSportProfile(id, data),
    onSuccess: (updated) => {
      queryClient.setQueryData(queryKeys.sportProfiles.detail(id), updated)
      queryClient.invalidateQueries({ queryKey: queryKeys.sportProfiles.all })
    },
  })
}

export function useDeleteSportProfile() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: number) => sportProfilesApi.deleteSportProfile(id),
    onSuccess: (_data, id) => {
      queryClient.removeQueries({ queryKey: queryKeys.sportProfiles.detail(id) })
      queryClient.invalidateQueries({ queryKey: queryKeys.sportProfiles.all })
    },
  })
}
