import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2 } from 'lucide-react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { registerSchema, type RegisterFormValues } from '@/features/auth/schema'
import { useAuth } from '@/features/auth/useAuth'
import { FormAlert, type FormAlertType } from '@/features/auth/components/FormAlert'
import { getErrorMessage } from '@/features/auth/utils'
import type { UserCreate } from '@/types/user'

interface RegisterFormProps {
  onRegistered: (email: string) => void
}

export function RegisterForm({ onRegistered }: RegisterFormProps) {
  const { register } = useAuth()
  const [alert, setAlert] = useState<{ type: FormAlertType; message: string } | null>(
    null,
  )

  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: '',
      lastname: '',
      dni: '',
      phone: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
  })

  async function onSubmit(values: RegisterFormValues) {
    setAlert(null)
    const payload: UserCreate = {
      name: values.name,
      lastname: values.lastname,
      dni: values.dni,
      phone: values.phone,
      email: values.email,
      password: values.password,
    }

    try {
      await register(payload)
      setAlert({
        type: 'success',
        message: '¡Cuenta creada con éxito! Ya podés iniciar sesión con tus credenciales.',
      })
      toast.success('Socio registrado correctamente')
      form.reset()
      onRegistered(values.email)
    } catch (error) {
      const message = getErrorMessage(error)
      setAlert({ type: 'error', message })
      toast.error(message)
    }
  }

  return (
    <>
      <div className="mb-5 text-left">
        <h2 className="text-xl font-semibold text-foreground">Alta de nuevo socio</h2>
        <p className="mt-0.5 text-[0.825rem] text-muted-foreground">
          Registrá tus datos personales para darte de alta en el gimnasio
        </p>
      </div>

      {alert && <FormAlert type={alert.type} message={alert.message} />}

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} noValidate>
          <div className="grid grid-cols-2 gap-3.5">
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

          <div className="mt-4 grid grid-cols-2 gap-3.5">
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
              <FormItem className="mt-4">
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

          <div className="mt-4 grid grid-cols-2 gap-3.5">
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Contraseña</FormLabel>
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
                      placeholder="Repetí contraseña"
                      autoComplete="new-password"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <Button
            type="submit"
            className="mt-3 w-full"
            disabled={form.formState.isSubmitting}
          >
            {form.formState.isSubmitting && (
              <Loader2 className="size-3.5 animate-spin" />
            )}
            Crear cuenta de socio
          </Button>
        </form>
      </Form>
    </>
  )
}
