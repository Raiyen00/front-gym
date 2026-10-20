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
      <div className="flex items-center justify-center py-12 text-muted-foreground">
        No hay perfiles deportivos registrados
      </div>
    )
  }

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Socio</TableHead>
            <TableHead>Objetivo</TableHead>
            <TableHead>Nivel</TableHead>
            <TableHead>Días/sem</TableHead>
            <TableHead>Duración</TableHead>
            <TableHead>Edad</TableHead>
            <TableHead>Seguimiento</TableHead>
            <TableHead>Creado</TableHead>
            <TableHead className="text-right">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {profiles.map((profile) => (
            <TableRow key={profile.id}>
              <TableCell className="font-medium">{getUserLabel(profile.user_id)}</TableCell>
              <TableCell>{formatSportOption(profile.goal)}</TableCell>
              <TableCell>{formatSportOption(profile.level)}</TableCell>
              <TableCell>{profile.days_per_week}</TableCell>
              <TableCell>{profile.session_duration} min</TableCell>
              <TableCell>{profile.age}</TableCell>
              <TableCell>
                <Badge variant={profile.trainer_tracking ? 'default' : 'outline'}>
                  {profile.trainer_tracking ? 'Sí' : 'No'}
                </Badge>
              </TableCell>
              <TableCell>{format(new Date(profile.created_at), 'dd/MM/yyyy')}</TableCell>
              <TableCell className="text-right">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <MoreHorizontal className="size-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => onView(profile)}>
                      <Eye className="size-4 mr-2" />
                      Ver
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onEdit(profile)}>
                      <Edit className="size-4 mr-2" />
                      Editar
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem variant="destructive" onClick={() => onDelete(profile)}>
                      <Trash2 className="size-4 mr-2" />
                      Eliminar
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
