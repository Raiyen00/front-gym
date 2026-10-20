import type { ReactNode } from 'react'
import { Badge } from '@/components/ui/badge'
import { formatSportOption } from '@/features/sportProfiles/constants'
import type { SportProfile } from '@/types/sportProfile'

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-border/50 pb-2 last:border-0 last:pb-0">
      <span className="text-muted-foreground">{label}</span>
      <span className="text-right font-medium">{children}</span>
    </div>
  )
}

interface SportProfileDetailsProps {
  profile: SportProfile
  userLabel?: string
}

/** Detalle de solo lectura de un perfil deportivo. */
export function SportProfileDetails({ profile, userLabel }: SportProfileDetailsProps) {
  return (
    <div className="grid gap-3 text-sm">
      {userLabel && <Field label="Socio">{userLabel}</Field>}
      <Field label="Objetivo">{formatSportOption(profile.goal)}</Field>
      <Field label="Nivel">{formatSportOption(profile.level)}</Field>
      <Field label="Días por semana">{profile.days_per_week}</Field>
      <Field label="Duración de sesión">{profile.session_duration} min</Field>
      <Field label="Edad">{profile.age}</Field>
      <Field label="Lesiones">{profile.injuries?.trim() ? profile.injuries : '-'}</Field>
      <Field label="Seguimiento del entrenador">
        <Badge variant={profile.trainer_tracking ? 'default' : 'outline'}>
          {profile.trainer_tracking ? 'Sí' : 'No'}
        </Badge>
      </Field>
    </div>
  )
}
