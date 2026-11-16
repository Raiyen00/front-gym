import { useEffect } from 'react'
import { AlertTriangle, Loader2, UserPlus } from 'lucide-react'
import { useForm, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'

import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
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
import { PasswordPolicyNote } from '@/components/PasswordPolicyNote'
import {
  userCreateSchema,
  type UserCreateFormValues,
} from '@/features/users/schema'
import { findInactiveUserByEmail } from '@/features/users/createSupport'
import type { User, UserCreate } from '@/types/user'

interface UserCreateDialogProps {
  open: boolean
  isPending: boolean
  /** Lista de socios ya cargada: sirve para avisar si el email es de una baja. */
  users?: User[]
  onSubmit: (data: UserCreate) => Promise<void>
  onOpenChange: (open: boolean) => void
}

const EMPTY_VALUES: UserCreateFormValues = {
  name: '',
  lastname: '',
  dni: '',
  phone: '',
  email: '',
  password: '',
  confirmPassword: '',
}

export function UserCreateDialog({
  open,
  isPending,
  users,
  onSubmit,
  onOpenChange,
}: UserCreateDialogProps) {
  const form = useForm<UserCreateFormValues>({
    resolver: zodResolver(userCreateSchema),
    defaultValues: EMPTY_VALUES,
  })

  useEffect(() => {
    if (open) form.reset(EMPTY_VALUES)
  }, [open, form])

  // Un email que ya pertenece a un socio dado de baja: conviene reactivarlo en
  // la lista en vez de crear una cuenta nueva (la API respondería 409).
  const email = useWatch({ control: form.control, name: 'email' })
  const inactiveMatch = findInactiveUserByEmail(users, email)

  async function handleSubmit(values: UserCreateFormValues) {
    const payload: UserCreate = {
      name: values.name,
      lastname: values.lastname,
      dni: values.dni,
      phone: values.phone,
      email: values.email,
      password: values.password,
    }

    await onSubmit(payload)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Nuevo socio</DialogTitle>
          <DialogDescription>
            Creá la cuenta con una contraseña inicial. El socio quedará
            pendiente de habilitación.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            noValidate
            className="space-y-4"
          >
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nombre</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Juan"
                        autoComplete="given-name"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="lastname"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Apellido</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Pérez"
                        autoComplete="family-name"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="dni"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>DNI</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="38999888"
                        maxLength={8}
                        inputMode="numeric"
                        className="font-mono"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Teléfono</FormLabel>
                    <FormControl>
                      <Input
                        type="tel"
                        placeholder="1145678901"
                        autoComplete="tel"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Correo electrónico</FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      placeholder="socio@email.com"
                      autoComplete="email"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {inactiveMatch && (
              <Alert variant="warning">
                <AlertTriangle />
                <AlertDescription>
                  Ya existe un socio dado de baja con ese email (
                  {inactiveMatch.name} {inactiveMatch.lastname}). Cerrá este
                  formulario y tocá "Habilitar" en la lista para reactivarlo.
                </AlertDescription>
              </Alert>
            )}

            <div className="grid grid-cols-1 items-start gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Contraseña inicial</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder="Mínimo 8 caracteres"
                        autoComplete="new-password"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Confirmar contraseña</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder="Repetí la contraseña"
                        autoComplete="new-password"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <PasswordPolicyNote />

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
                    <Loader2 className="size-3.5 animate-spin" />
                    Creando...
                  </>
                ) : (
                  <>
                    <UserPlus className="size-3.5" />
                    Crear socio
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
