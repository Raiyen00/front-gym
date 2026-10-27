/**
 * Enums espejo de `models/enums.py` de la API.
 * Los valores coinciden exactamente con los del backend (minúsculas).
 */

export const ROLES = ['admin', 'profesor', 'cliente'] as const
export type Rol = (typeof ROLES)[number]

export const ROL_LABELS: Record<Rol, string> = {
  admin: 'Administrador',
  profesor: 'Profesor',
  cliente: 'Socio / Cliente',
}

export const METODOS_PAGO = [
  'tarjeta',
  'efectivo',
  'transferencia',
  'mercado_pago',
] as const
export type MetodoPago = (typeof METODOS_PAGO)[number]

export const METODO_PAGO_LABELS: Record<MetodoPago, string> = {
  tarjeta: 'Tarjeta',
  efectivo: 'Efectivo',
  transferencia: 'Transferencia',
  mercado_pago: 'Mercado Pago',
}

export const GRUPOS_MUSCULARES = [
  'pecho',
  'espalda',
  'pierna',
  'hombro',
  'biceps',
  'triceps',
  'abdomen',
  'gluteo',
  'full_body',
] as const
export type GrupoMuscular = (typeof GRUPOS_MUSCULARES)[number]

export const GRUPO_MUSCULAR_LABELS: Record<GrupoMuscular, string> = {
  pecho: 'Pecho',
  espalda: 'Espalda',
  pierna: 'Pierna',
  hombro: 'Hombro',
  biceps: 'Bíceps',
  triceps: 'Tríceps',
  abdomen: 'Abdomen',
  gluteo: 'Glúteo',
  full_body: 'Full body',
}

export const USER_STATES = [
  'activo',
  'inactivo',
  'pendiente_habilitacion',
  'habilitado_entrenar',
] as const
export type UserState = (typeof USER_STATES)[number]

export const USER_STATE_LABELS: Record<UserState, string> = {
  activo: 'Activo',
  inactivo: 'Inactivo',
  pendiente_habilitacion: 'Pendiente de habilitación',
  habilitado_entrenar: 'Habilitado para entrenar',
}

export const DIAS_SEMANA = [
  'lunes',
  'martes',
  'miercoles',
  'jueves',
  'viernes',
  'sabado',
  'domingo',
] as const
export type DiaSemana = (typeof DIAS_SEMANA)[number]

export const DIA_SEMANA_LABELS: Record<DiaSemana, string> = {
  lunes: 'Lunes',
  martes: 'Martes',
  miercoles: 'Miércoles',
  jueves: 'Jueves',
  viernes: 'Viernes',
  sabado: 'Sábado',
  domingo: 'Domingo',
}
