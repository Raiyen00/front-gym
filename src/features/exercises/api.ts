import { request } from '@/lib/api/client'
import { ENDPOINTS } from '@/lib/api/config'
import type { GrupoMuscular } from '@/types/enums'
import type { Exercise, ExerciseCreate, ExerciseUpdate } from '@/types/exercise'

const BASE = ENDPOINTS.EXERCISES

/** GET /exercises — con filtro opcional `?muscular_group=`. */
export function getExercises(muscularGroup?: GrupoMuscular): Promise<Exercise[]> {
  const query = muscularGroup
    ? `?muscular_group=${encodeURIComponent(muscularGroup)}`
    : ''
  return request<Exercise[]>(`${BASE}${query}`)
}

/** GET /exercises/{id}. */
export function getExercise(id: number): Promise<Exercise> {
  return request<Exercise>(`${BASE}/${id}`)
}

/**
 * POST /exercises — 201 en éxito.
 * 409 con `detail: "El ejercicio con el nombre '<nombre>' ya existe."`
 * cuando el nombre está duplicado.
 */
export function createExercise(data: ExerciseCreate): Promise<Exercise> {
  return request<Exercise>(BASE, {
    method: 'POST',
    body: data,
  })
}

/** PATCH /exercises/{id} — parcial. */
export function updateExercise(id: number, data: ExerciseUpdate): Promise<Exercise> {
  return request<Exercise>(`${BASE}/${id}`, {
    method: 'PATCH',
    body: data,
  })
}

/** DELETE /exercises/{id} — 204 sin body. */
export function deleteExercise(id: number): Promise<void> {
  return request<void>(`${BASE}/${id}`, {
    method: 'DELETE',
  })
}
