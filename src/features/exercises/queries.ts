import { queryKeys } from '@/lib/api/queryKeys'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import * as exercisesApi from '@/features/exercises/api'
import type { GrupoMuscular } from '@/types/enums'
import type { ExerciseCreate, ExerciseUpdate } from '@/types/exercise'

export function useExercises(muscularGroup?: GrupoMuscular) {
  return useQuery({
    queryKey: queryKeys.exercises.list(muscularGroup),
    queryFn: () => exercisesApi.getExercises(muscularGroup),
  })
}

export function useExercise(id: number) {
  return useQuery({
    queryKey: queryKeys.exercises.detail(id),
    queryFn: () => exercisesApi.getExercise(id),
    enabled: id > 0,
  })
}

export function useCreateExercise() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: ExerciseCreate) => exercisesApi.createExercise(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.exercises.all })
    },
  })
}

export function useUpdateExercise(id: number) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: ExerciseUpdate) => exercisesApi.updateExercise(id, data),
    onSuccess: (updated) => {
      queryClient.setQueryData(queryKeys.exercises.detail(updated.id), updated)
      queryClient.invalidateQueries({ queryKey: queryKeys.exercises.all })
    },
  })
}

export function useDeleteExercise() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: number) => exercisesApi.deleteExercise(id),
    onSuccess: (_data, id) => {
      queryClient.removeQueries({ queryKey: queryKeys.exercises.detail(id) })
      queryClient.invalidateQueries({ queryKey: queryKeys.exercises.all })
    },
  })
}
