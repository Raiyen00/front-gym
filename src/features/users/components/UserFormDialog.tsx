import { useEffect } from 'react'
import { Loader2, Save } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'

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
import { userUpdateSchema, type UserUpdateFormValues } from '@/features/users/schema'
import type { User, UserUpdate } from '@/types/user'

interface UserFormDialogProps {
  user: User | null
  isPending: boolean
  onSubmit: (data: UserUpdate) => Promise<void>
  onOpenChange: (open: boolean) => void
}

const EMPTY_VALUES: UserUpdateFormValues = {
  name: '',
  lastname: '',
  dni: '',
  phone: '',
  email: '',
}

export function UserFormDialog({
  user,
  isPending,
  onSubmit,
  onOpenChange,
}: UserFormDialogProps) {
  const form = useForm<UserUpdateFormValues>({
    resolver: zodResolver(userUpdateSchema),
    defaultValues: EMPTY_VALUES,
  })

  useEffect(() => {
    if (!user) return
    form.reset({
      name: user.name,
      lastname: user.lastname,
      dni: user.dni,
      phone: user.phone ?? '',
      email: user.email,
    })
  }, [user, form])

  async function handleSubmit(values: UserUpdateFormValues) {
    const dirty = form.formState.dirtyFields
    const payload: UserUpdate = {}
    if (dirty.name) payload.name = values.name
    if (dirty.lastname) payload.lastname = values.lastname
    if (dirty.dni) payload.dni = values.dni
    if (dirty.phone) payload.phone = values.phone
    if (dirty.email) payload.email = values.email

    if (Object.keys(payload).length === 0) {
      onOpenChange(false)
      return
    }

    await onSubmit(payload)
  }

  return (
    <Dialog open={user !== null} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Editar socio</DialogTitle>
          <DialogDescription>
            {user ? `${user.name} ${user.lastname}` : ''} — solo se envían los campos modificados.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} noValidate className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nombre</FormLabel>
                    <FormControl>
                      <Input placeholder="Juan" {...field} />
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
                      <Input placeholder="Pérez" {...field} />
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
                      <Input type="tel" placeholder="1145678901" {...field} />
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
                    <Input type="email" placeholder="socio@email.com" {...field} />
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
              <Button type="submit" disabled={isPending}>
                {isPending ? (
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
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
