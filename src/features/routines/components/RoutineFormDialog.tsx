import { useMemo, useState } from 'react'
import { Loader2, Save } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'

import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useAuth } from '@/features/auth/useAuth'
import { getErrorMessage } from '@/features/auth/utils'
import { useUsers } from '@/features/users/queries'
import { useSportProfiles } from '@/features/sportProfiles/queries'
import {
  routineFormSchema,
  type RoutineFormValues,
} from '@/features/routines/schema'
import { buildRoutineCreate } from '@/features/routines/payload'
import { todayInputDate } from '@/features/routines/dates'
import { ApiError } from '@/lib/api/client'
import type { RoutineCreate } from '@/types/routine'

interface RoutineFormDialogProps {
  open: boolean
  isPending: boolean
  onSubmit: (payload: RoutineCreate) => Promise<void>
  onOpenChange: (open: boolean) => void
}

export function RoutineFormDialog({
  open,
  isPending,
  onSubmit,
  onOpenChange,
}: RoutineFormDialogProps) {
  const { user } = useAuth()
  const { data: users, isLoading: usersLoading } = useUsers()
  // `GET /sport-profiles` es solo para admin: un profesor no puede listar los
  // perfiles y se apoya en el 409 de la API.
  const isAdmin = user?.rol === 'admin'
  const { data: profiles, isLoading: profilesLoading } = useSportProfiles({
    enabled: open && isAdmin,
  })
  const [conflict, setConflict] = useState<string | null>(null)

  // Si la consulta de perfiles falla (por ejemplo, por red) seguimos
  // ofreciendo los socios habilitados y el 409 de la API cubre el resto.
  const filterByProfile = isAdmin && profiles !== undefined
  const profileUserIds = useMemo(
    () => new Set((profiles ?? []).map((profile) => profile.user_id)),
    [profiles],
  )

  /**
   * La API rechaza con 409 asignar una rutina a un socio sin perfil deportivo,
   * así que solo ofrecemos socios y profesores habilitados para entrenar (y, si
   * el usuario es admin, que además ya tengan su perfil deportivo).
   */
  const eligibleUsers = useMemo(
    () =>
      (users ?? []).filter(
        (candidate) =>
          candidate.state === 'habilitado_entrenar' &&
          (!filterByProfile || profileUserIds.has(candidate.id)),
      ),
    [users, filterByProfile, profileUserIds],
  )

  const eligibilityLoading = usersLoading || (isAdmin && profilesLoading)
  const noEligibleUsers =
    !eligibilityLoading && users !== undefined && eligibleUsers.length === 0

  const form = useForm<RoutineFormValues>({
    resolver: zodResolver(routineFormSchema),
    defaultValues: {
      user_id: '',
      date_generated: todayInputDate(),
    },
  })

  async function handleSubmit(values: RoutineFormValues) {
    setConflict(null)

    try {
      await onSubmit(buildRoutineCreate(values))
    } catch (error) {
      const message = getErrorMessage(error)
      // 409 de la API: el socio no tiene perfil deportivo. Se muestra inline
      // para poder elegir otro socio sin cerrar el diálogo.
      if (error instanceof ApiError && error.status === 409) {
        setConflict(
          'El socio no tiene un perfil deportivo. Creá su perfil deportivo antes de asignarle una rutina.',
        )
        return
      }
      toast.error(message)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Nueva rutina</DialogTitle>
          <DialogDescription>
            La rutina se crea activa y vacía; después agregás los ejercicios
            por día.
          </DialogDescription>
        </DialogHeader>

        {conflict && (
          <Alert variant="warning">
            <AlertDescription>{conflict}</AlertDescription>
          </Alert>
        )}

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            noValidate
            className="space-y-4"
          >
            <FormField
              control={form.control}
              name="user_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Socio o profesor</FormLabel>
                  <Select
                    value={field.value}
                    onValueChange={(value) => {
                      setConflict(null)
                      field.onChange(value)
                    }}
                    disabled={eligibilityLoading || noEligibleUsers}
                  >
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <SelectValue
                          placeholder={
                            eligibilityLoading
                              ? 'Cargando socios...'
                              : noEligibleUsers
                                ? 'Sin socios ni profesores disponibles'
                                : 'Elegí un socio o profesor'
                          }
                        />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {eligibleUsers.map((candidate) => (
                        <SelectItem key={candidate.id} value={String(candidate.id)}>
                          {candidate.name} {candidate.lastname} ({candidate.email})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {noEligibleUsers && (
                    <p className="text-[0.8125rem] text-warning">
                      No hay socios ni profesores habilitados para entrenar con
                      perfil deportivo. Hace falta estar habilitado para entrenar y
                      tener el perfil deportivo creado.
                    </p>
                  )}
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="date_generated"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Fecha</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isPending}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={isPending || eligibilityLoading || noEligibleUsers}
              >
                {isPending ? (
                  <>
                    <Loader2 className="size-3.5 animate-spin" />
                    Creando...
                  </>
                ) : (
                  <>
                    <Save className="size-3.5" />
                    Crear rutina
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
