import { request } from '@/lib/api/client'
import { ENDPOINTS } from '@/lib/api/config'
import type {
  Routine,
  RoutineCreate,
  RoutineDetail,
  RoutineExerciseCreate,
  RoutineExerciseResponse,
  RoutineExerciseUpdate,
  RoutineUpdate,
} from '@/types/routine'

const BASE = ENDPOINTS.ROUTINES

/** GET /routines — profesor/admin, listado de cabeceras. */
export function getRoutines(): Promise<Routine[]> {
  return request<Routine[]>(BASE)
}

/** GET /routines/me — autenticado, rutinas propias con ejercicios anidados. */
export function getMyRoutines(): Promise<RoutineDetail[]> {
  return request<RoutineDetail[]>(`${BASE}/me`)
}

/** GET /routines/{id} — autenticado, detalle con ejercicios anidados. */
export function getRoutine(id: number): Promise<RoutineDetail> {
  return request<RoutineDetail>(`${BASE}/${id}`)
}

/** POST /routines — profesor/admin, 201. */
export function createRoutine(data: RoutineCreate): Promise<Routine> {
  return request<Routine>(BASE, {
    method: 'POST',
    body: data,
  })
}

/** PATCH /routines/{id} — profesor/admin, parcial. */
export function updateRoutine(
  id: number,
  data: RoutineUpdate,
): Promise<Routine> {
  return request<Routine>(`${BASE}/${id}`, {
    method: 'PATCH',
    body: data,
  })
}

/** DELETE /routines/{id} — profesor/admin, 204. */
export function deleteRoutine(id: number): Promise<void> {
  return request<void>(`${BASE}/${id}`, {
    method: 'DELETE',
  })
}

/**
 * GET /routines/{id}/exercises — autenticado.
 * La pantalla de detalle usa `getRoutine` para tener el ejercicio anidado;
 * esta variante queda disponible para consumidores que solo necesitan los renglones.
 */
export function getRoutineExercises(
  routineId: number,
): Promise<RoutineExerciseResponse[]> {
  return request<RoutineExerciseResponse[]>(`${BASE}/${routineId}/exercises`)
}

/** POST /routines/{id}/exercises — profesor/admin, 201. */
export function createRoutineExercise(
  routineId: number,
  data: RoutineExerciseCreate,
): Promise<RoutineExerciseResponse> {
  return request<RoutineExerciseResponse>(`${BASE}/${routineId}/exercises`, {
    method: 'POST',
    body: data,
  })
}

/** PATCH /routines/{id}/exercises/{reId} — profesor/admin, parcial. */
export function updateRoutineExercise(
  routineId: number,
  reId: number,
  data: RoutineExerciseUpdate,
): Promise<RoutineExerciseResponse> {
  return request<RoutineExerciseResponse>(
    `${BASE}/${routineId}/exercises/${reId}`,
    {
      method: 'PATCH',
      body: data,
    },
  )
}

/** DELETE /routines/{id}/exercises/{reId} — profesor/admin, 204. */
export function deleteRoutineExercise(
  routineId: number,
  reId: number,
): Promise<void> {
  return request<void>(`${BASE}/${routineId}/exercises/${reId}`, {
    method: 'DELETE',
  })
}
