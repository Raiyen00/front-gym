import { useState } from 'react'
import { Loader2, Save } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'

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
import { useUsers } from '@/features/users/queries'
import {
  sportProfileFormSchema,
  type SportProfileFormValues,
} from '@/features/sportProfiles/schema'
import {
  SPORT_GOALS,
  SPORT_LEVELS,
  optionsWithLegacy,
} from '@/features/sportProfiles/constants'
import {
  buildSportProfileCreate,
  buildSportProfileUpdate,
} from '@/features/sportProfiles/payload'
import type {
  SportProfile,
  SportProfileCreate,
  SportProfileUpdate,
} from '@/types/sportProfile'

interface SportProfileFormDialogProps {
  open: boolean
  /** `null` => alta (requiere elegir socio). */
  profile: SportProfile | null
  isPending: boolean
  onSubmit: (payload: SportProfileCreate | SportProfileUpdate) => Promise<void>
  onOpenChange: (open: boolean) => void
}

const CREATE_DEFAULTS: SportProfileFormValues = {
  goal: '',
  level: '',
  days_per_week: '3',
  session_duration: '60',
  age: '30',
  injuries: '',
  trainer_tracking: false,
}

export function SportProfileFormDialog({
  open,
  profile,
  isPending,
  onSubmit,
  onOpenChange,
}: SportProfileFormDialogProps) {
  const isEdit = profile !== null
  const { data: users } = useUsers()
  const [userId, setUserId] = useState(() => (profile ? String(profile.user_id) : ''))
  const [userError, setUserError] = useState<string | null>(null)

  const goalOptions = optionsWithLegacy(SPORT_GOALS, profile?.goal)
  const levelOptions = optionsWithLegacy(SPORT_LEVELS, profile?.level)

  const form = useForm<SportProfileFormValues>({
    resolver: zodResolver(sportProfileFormSchema),
    defaultValues: profile
      ? {
          goal: profile.goal,
          level: profile.level,
          days_per_week: String(profile.days_per_week),
          session_duration: String(profile.session_duration),
          age: String(profile.age),
          injuries: profile.injuries ?? '',
          trainer_tracking: profile.trainer_tracking,
        }
      : CREATE_DEFAULTS,
  })

  async function handleSubmit(values: SportProfileFormValues) {
    if (profile) {
      const payload = buildSportProfileUpdate(profile, values)
      if (Object.keys(payload).length === 0) {
        toast.info('No hay cambios para guardar')
        return
      }
      await onSubmit(payload)
      return
    }

    if (!userId) {
      setUserError('Seleccioná un socio')
      return
    }
    setUserError(null)
    await onSubmit(buildSportProfileCreate(Number(userId), values))
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Editar perfil deportivo' : 'Nuevo perfil deportivo'}</DialogTitle>
          <DialogDescription>
            {isEdit
              ? 'Solo se envían los campos modificados (sin user_id).'
              : 'El perfil se asocia a un socio existente.'}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} noValidate className="space-y-4">
            {!isEdit && (
              <FormItem>
                <FormLabel>Socio</FormLabel>
                <Select
                  value={userId}
                  onValueChange={(value) => {
                    setUserId(value)
                    setUserError(null)
                  }}
                >
                  <FormControl>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Elegí un socio" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {users?.map((u) => (
                      <SelectItem key={u.id} value={String(u.id)}>
                        {u.name} {u.lastname} ({u.email})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {userError && <p className="text-sm text-destructive">{userError}</p>}
              </FormItem>
            )}

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="goal"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Objetivo</FormLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Elegí un objetivo" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {goalOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="level"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nivel</FormLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Elegí un nivel" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {levelOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="days_per_week"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Días / semana</FormLabel>
                    <FormControl>
                      <Input type="number" min={1} max={7} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="session_duration"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Duración (min)</FormLabel>
                    <FormControl>
                      <Input type="number" min={1} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="age"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Edad</FormLabel>
                    <FormControl>
                      <Input type="number" min={11} max={100} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="injuries"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Lesiones (opcional)</FormLabel>
                  <FormControl>
                    <Input placeholder="Sin lesiones" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="trainer_tracking"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center gap-3 rounded-md border border-input p-3">
                  <FormControl>
                    <input
                      type="checkbox"
                      name={field.name}
                      ref={field.ref}
                      checked={field.value}
                      onChange={(event) => field.onChange(event.target.checked)}
                      onBlur={field.onBlur}
                      className="size-4 accent-primary"
                    />
                  </FormControl>
                  <FormLabel className="cursor-pointer">Seguimiento del entrenador</FormLabel>
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
              <Button type="submit" disabled={isPending}>
                {isPending ? (
                  <>
                    <Loader2 className="size-3.5 animate-spin mr-2" />
                    Guardando...
                  </>
                ) : (
                  <>
                    <Save className="size-3.5 mr-2" />
                    {isEdit ? 'Guardar cambios' : 'Crear perfil'}
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
