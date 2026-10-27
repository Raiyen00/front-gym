import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { queryKeys } from '@/lib/api/queryKeys'
import * as routinesApi from '@/features/routines/api'
import type {
  RoutineCreate,
  RoutineExerciseCreate,
  RoutineExerciseUpdate,
  RoutineUpdate,
} from '@/types/routine'

export function useRoutines() {
  return useQuery({
    queryKey: queryKeys.routines.all,
    queryFn: routinesApi.getRoutines,
  })
}

export function useMyRoutines() {
  return useQuery({
    queryKey: queryKeys.routines.me,
    queryFn: routinesApi.getMyRoutines,
  })
}

export function useRoutine(id: number) {
  return useQuery({
    queryKey: queryKeys.routines.detail(id),
    queryFn: () => routinesApi.getRoutine(id),
    enabled: id > 0,
  })
}

/** Renglones planos; el detalle visual usa `useRoutine` para traer el ejercicio anidado. */
export function useRoutineExercises(routineId: number) {
  return useQuery({
    queryKey: queryKeys.routines.exercises(routineId),
    queryFn: () => routinesApi.getRoutineExercises(routineId),
    enabled: routineId > 0,
  })
}

export function useCreateRoutine() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: RoutineCreate) => routinesApi.createRoutine(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.routines.all })
      queryClient.invalidateQueries({ queryKey: queryKeys.routines.me })
    },
  })
}

export function useUpdateRoutine() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: RoutineUpdate }) =>
      routinesApi.updateRoutine(id, data),
    onSuccess: (updated) => {
      queryClient.setQueryData(queryKeys.routines.detail(updated.id), (current) =>
        current ? { ...current, ...updated } : current,
      )
      queryClient.invalidateQueries({ queryKey: queryKeys.routines.all })
      queryClient.invalidateQueries({ queryKey: queryKeys.routines.me })
    },
  })
}

export function useDeleteRoutine() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: number) => routinesApi.deleteRoutine(id),
    onSuccess: (_data, id) => {
      queryClient.removeQueries({ queryKey: queryKeys.routines.detail(id) })
      queryClient.invalidateQueries({ queryKey: queryKeys.routines.all })
      queryClient.invalidateQueries({ queryKey: queryKeys.routines.me })
    },
  })
}

function invalidateRoutine(
  queryClient: ReturnType<typeof useQueryClient>,
  routineId: number,
) {
  queryClient.invalidateQueries({
    queryKey: queryKeys.routines.detail(routineId),
  })
  queryClient.invalidateQueries({
    queryKey: queryKeys.routines.exercises(routineId),
  })
  queryClient.invalidateQueries({ queryKey: queryKeys.routines.me })
}

export function useCreateRoutineExercise(routineId: number) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: RoutineExerciseCreate) =>
      routinesApi.createRoutineExercise(routineId, data),
    onSuccess: () => invalidateRoutine(queryClient, routineId),
  })
}

export function useUpdateRoutineExercise(routineId: number) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      exerciseRowId,
      data,
    }: {
      exerciseRowId: number
      data: RoutineExerciseUpdate
    }) => routinesApi.updateRoutineExercise(routineId, exerciseRowId, data),
    onSuccess: () => invalidateRoutine(queryClient, routineId),
  })
}

export function useDeleteRoutineExercise(routineId: number) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (exerciseRowId: number) =>
      routinesApi.deleteRoutineExercise(routineId, exerciseRowId),
    onSuccess: () => invalidateRoutine(queryClient, routineId),
  })
}
