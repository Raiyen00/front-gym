import type { ReactNode } from 'react'
import { Badge } from '@/components/ui/badge'
import { formatSportOption } from '@/features/sportProfiles/constants'
import type { SportProfile } from '@/types/sportProfile'

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex items-baseline justify-between gap-4 border-b border-border py-2 last:border-b-0 last:pb-0">
      <span className="text-[0.8125rem] text-text-muted">{label}</span>
      <span className="text-right text-[0.8125rem] font-medium text-foreground">
        {children}
      </span>
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
    <div>
      {userLabel && <Field label="Socio">{userLabel}</Field>}
      <Field label="Objetivo">{formatSportOption(profile.goal)}</Field>
      <Field label="Nivel">{formatSportOption(profile.level)}</Field>
      <Field label="Días por semana">
        <span className="num">{profile.days_per_week}</span>
      </Field>
      <Field label="Duración de sesión">
        <span className="num">{profile.session_duration} min</span>
      </Field>
      <Field label="Edad">
        <span className="num">{profile.age}</span>
      </Field>
      <Field label="Lesiones">{profile.injuries?.trim() ? profile.injuries : '-'}</Field>
      <Field label="Seguimiento del entrenador">
        <Badge variant={profile.trainer_tracking ? 'default' : 'outline'}>
          {profile.trainer_tracking ? 'Sí' : 'No'}
        </Badge>
      </Field>
    </div>
  )
}
