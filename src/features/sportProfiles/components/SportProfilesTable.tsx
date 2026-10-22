import { Edit, Eye, MoreHorizontal, Trash2 } from 'lucide-react'
import { format } from 'date-fns'

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { formatSportOption } from '@/features/sportProfiles/constants'
import type { SportProfile } from '@/types/sportProfile'

interface SportProfilesTableProps {
  profiles: SportProfile[]
  getUserLabel: (userId: number) => string
  onView: (profile: SportProfile) => void
  onEdit: (profile: SportProfile) => void
  onDelete: (profile: SportProfile) => void
}

export function SportProfilesTable({
  profiles,
  getUserLabel,
  onView,
  onEdit,
  onDelete,
}: SportProfilesTableProps) {
  if (profiles.length === 0) {
    return (
      <div className="flex flex-col items-center gap-1.5 px-6 py-14 text-center">
        <p className="text-[0.875rem] font-medium text-foreground">
          No hay perfiles deportivos
        </p>
        <p className="text-[0.8125rem] text-muted-foreground">
          Probá con otra búsqueda o creá un perfil nuevo.
        </p>
      </div>
    )
  }

  return (
    <Table>
      <TableHeader>
        <TableRow className="hover:bg-transparent">
          <TableHead className="pl-5">Socio</TableHead>
          <TableHead>Objetivo</TableHead>
          <TableHead className="hidden lg:table-cell">Nivel</TableHead>
          <TableHead className="num hidden text-right md:table-cell">Días/sem</TableHead>
          <TableHead className="num hidden text-right md:table-cell">Sesión</TableHead>
          <TableHead className="num hidden text-right lg:table-cell">Edad</TableHead>
          <TableHead className="hidden lg:table-cell">Seguimiento</TableHead>
          <TableHead className="num hidden text-right xl:table-cell">Creado</TableHead>
          <TableHead className="w-12 pr-5 text-right">
            <span className="sr-only">Acciones</span>
          </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {profiles.map((profile) => (
          <TableRow key={profile.id}>
            <TableCell className="pl-5">
              <p className="text-[0.875rem] font-medium text-foreground">
                {getUserLabel(profile.user_id)}
              </p>
              <p className="num mt-0.5 text-[0.8125rem] text-text-muted lg:hidden">
                {formatSportOption(profile.level)} · {profile.days_per_week} días ·{' '}
                {profile.session_duration} min · {profile.age} años
              </p>
              <p className="num mt-0.5 text-[0.8125rem] text-text-muted xl:hidden">
                {profile.trainer_tracking ? 'Con seguimiento' : 'Sin seguimiento'} ·{' '}
                {format(new Date(profile.created_at), 'dd/MM/yyyy')}
              </p>
            </TableCell>
            <TableCell className="text-[0.8125rem] text-foreground/90">
              {formatSportOption(profile.goal)}
            </TableCell>
            <TableCell className="hidden text-[0.8125rem] text-muted-foreground lg:table-cell">
              {formatSportOption(profile.level)}
            </TableCell>
            <TableCell className="num hidden text-right text-[0.8125rem] text-muted-foreground md:table-cell">
              {profile.days_per_week}
            </TableCell>
            <TableCell className="num hidden text-right text-[0.8125rem] text-muted-foreground md:table-cell">
              {profile.session_duration} min
            </TableCell>
            <TableCell className="num hidden text-right text-[0.8125rem] text-muted-foreground lg:table-cell">
              {profile.age}
            </TableCell>
            <TableCell className="hidden lg:table-cell">
              <Badge variant={profile.trainer_tracking ? 'default' : 'outline'}>
                {profile.trainer_tracking ? 'Sí' : 'No'}
              </Badge>
            </TableCell>
            <TableCell className="num hidden text-right text-[0.8125rem] text-muted-foreground xl:table-cell">
              {format(new Date(profile.created_at), 'dd/MM/yyyy')}
            </TableCell>
            <TableCell className="pr-5 text-right">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    aria-label={`Acciones del perfil de ${getUserLabel(profile.user_id)}`}
                  >
                    <MoreHorizontal className="size-4" strokeWidth={1.75} />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => onView(profile)}>
                    <Eye className="size-4" />
                    Ver
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onEdit(profile)}>
                    <Edit className="size-4" />
                    Editar
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem variant="destructive" onClick={() => onDelete(profile)}>
                    <Trash2 className="size-4" />
                    Eliminar
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
