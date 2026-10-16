import { useState } from 'react'
import { Loader2, Save, AlertCircle } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import { useAuth } from '@/features/auth/useAuth'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
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
import { useUpdateUser } from '@/features/users/queries'
import { getErrorMessage } from '@/features/auth/utils'

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
    try {
      const updated = await updateUser.mutateAsync(values)
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
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Mi perfil</h1>
        <p className="text-muted-foreground">Gestión de tu información personal</p>
      </div>

      {alert && (
        <Alert className={alert.type === 'error' ? 'border-destructive' : ''}>
          <AlertCircle className="size-4" />
          <AlertDescription>{alert.message}</AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Información personal</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} noValidate className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
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
                        <Input type="tel" placeholder="1145678901" autoComplete="tel" {...field} />
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
                      <Input type="email" placeholder="socio@email.com" autoComplete="email" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button type="submit" className="w-full sm:w-auto" disabled={form.formState.isSubmitting || updateUser.isPending}>
                {form.formState.isSubmitting || updateUser.isPending ? (
                  <>
                    <Loader2 className="size-3.5 animate-spin mr-2" />
                    Guardando...
                  </>
                ) : (
                  <>
                    <Save className="size-3.5 mr-2" />
                    Guardar cambios
                  </>
                )}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      <Card className="border-warning/50">
        <CardHeader>
          <CardTitle className="text-warning flex items-center gap-2">
            <AlertCircle className="size-4" />
            Información de solo lectura
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <div className="grid grid-cols-2 gap-2">
            <span className="text-muted-foreground">Rol</span>
            <span className="font-medium">{user?.rol || '-'}</span>
            <span className="text-muted-foreground">Estado</span>
            <span className="font-medium">{user?.state || '-'}</span>
            <span className="text-muted-foreground">Registrado</span>
            <span className="font-medium">{user?.register_date ? new Date(user.register_date).toLocaleDateString('es-AR') : '-'}</span>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}