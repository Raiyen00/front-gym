import { useState } from 'react'
import { Loader2, Save, AlertCircle } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import { useAuth } from '@/features/auth/useAuth'

import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { userUpdateSchema, type UserUpdateFormValues } from '@/features/users/schema'
import { buildUserUpdate } from '@/features/users/payload'
import { useUpdateUser } from '@/features/users/queries'
import { getErrorMessage } from '@/features/auth/utils'
import { ROL_LABELS, USER_STATE_LABELS } from '@/types/enums'

export function ProfilePage() {
  const { user, updateCurrentUser } = useAuth()
  const updateUser = useUpdateUser(user?.id ?? 0)
  const [alert, setAlert] = useState<{ type: 'success' | 'error'; message: string } | null>(null)

  const form = useForm<UserUpdateFormValues>({
    resolver: zodResolver(userUpdateSchema),
    defaultValues: {
      name: user?.name || '',
      lastname: user?.lastname || '',
      dni: user?.dni || '',
      phone: user?.phone || '',
      email: user?.email || '',
    },
  })

  async function onSubmit(values: UserUpdateFormValues) {
    setAlert(null)
    const payload = buildUserUpdate(values, form.formState.dirtyFields)
    if (Object.keys(payload).length === 0) {
      toast.info('No hay cambios para guardar')
      return
    }

    try {
      const updated = await updateUser.mutateAsync(payload)
      form.reset({
        name: updated.name,
        lastname: updated.lastname,
        dni: updated.dni,
        phone: updated.phone ?? '',
        email: updated.email,
      })
      updateCurrentUser(updated)
      setAlert({ type: 'success', message: 'Perfil actualizado correctamente' })
      toast.success('Perfil actualizado')
    } catch (error) {
      const message = getErrorMessage(error)
      setAlert({ type: 'error', message })
      toast.error(message)
    }
  }

  return (
    <div className="flex flex-col gap-6 lg:max-w-5xl">
      <header>
        <h1 className="text-[1.5rem] leading-tight font-semibold tracking-[-0.02em] text-foreground">
          Mi perfil
        </h1>
        <p className="mt-1 text-[0.8125rem] text-muted-foreground">
          Tus datos personales y de contacto.
        </p>
      </header>

      {alert && (
        <Alert variant={alert.type === 'error' ? 'error' : 'success'}>
          <AlertCircle className="size-4" />
          <AlertDescription>{alert.message}</AlertDescription>
        </Alert>
      )}

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)] lg:items-stretch">
        <section className="rounded-xl bg-card px-5 py-5 md:px-6 md:py-6">
          <div>
            <h2 className="text-[0.9375rem] font-semibold text-foreground">
              Información personal
            </h2>
            <p className="mt-1 text-[0.8125rem] text-muted-foreground">
              Solo se guardan los campos que modifiques.
            </p>
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} noValidate>
              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nombre</FormLabel>
                      <FormControl>
                        <Input placeholder="Juan" autoComplete="given-name" {...field} />
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
                        <Input placeholder="Pérez" autoComplete="family-name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
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
                        <Input type="tel" placeholder="1145678901" autoComplete="tel" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="sm:col-span-2">
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
                </div>
              </div>

              <div className="mt-6 flex justify-end border-t border-border pt-5">
                <Button
                  type="submit"
                  disabled={form.formState.isSubmitting || updateUser.isPending}
                >
                  {form.formState.isSubmitting || updateUser.isPending ? (
                    <>
                      <Loader2 className="size-3.5 animate-spin" />
                      Guardando...
                    </>
                  ) : (
                    <>
                      <Save className="size-4" strokeWidth={1.75} />
                      Guardar cambios
                    </>
                  )}
                </Button>
              </div>
            </form>
          </Form>
        </section>

        <aside className="flex flex-col rounded-xl bg-card px-5 py-5 md:px-6 md:py-6">
          <h2 className="text-[0.9375rem] font-semibold text-foreground">Tu cuenta</h2>
          <p className="mt-1 text-[0.8125rem] text-muted-foreground">
            Datos de solo lectura.
          </p>

          <dl className="mt-5 flex flex-col gap-4">
            <div className="flex items-center justify-between gap-4 border-b border-border pb-3">
              <dt className="text-[0.8125rem] text-text-muted">Rol</dt>
              <dd className="text-[0.8125rem] font-medium text-foreground">
                {user ? ROL_LABELS[user.rol] : '-'}
              </dd>
            </div>
            <div className="flex items-center justify-between gap-4 border-b border-border pb-3">
              <dt className="text-[0.8125rem] text-text-muted">Estado</dt>
              <dd>
                {user && (
                  <Badge
                    variant={
                      user.state === 'activo' || user.state === 'habilitado_entrenar'
                        ? 'default'
                        : user.state === 'pendiente_habilitacion'
                          ? 'warning'
                          : 'destructive'
                    }
                  >
                    {USER_STATE_LABELS[user.state]}
                  </Badge>
                )}
              </dd>
            </div>
            <div className="flex items-center justify-between gap-4">
              <dt className="text-[0.8125rem] text-text-muted">Registrado</dt>
              <dd className="num text-[0.8125rem] font-medium text-foreground">
                {user?.register_date
                  ? new Date(user.register_date).toLocaleDateString('es-AR')
                  : '-'}
              </dd>
            </div>
          </dl>

          <p className="mt-auto border-t border-border pt-4 text-xs leading-relaxed text-text-muted">
            El rol y el estado los asigna un administrador del gimnasio.
          </p>
        </aside>
      </div>
    </div>
  )
}
