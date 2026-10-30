import { useEffect, useState } from 'react'
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
import { PasswordInput } from '@/components/ui/password-input'
import { FormAlert, type FormAlertType } from '@/features/auth/components/FormAlert'
import { LoginChangePasswordDialog } from '@/features/auth/components/LoginChangePasswordDialog'
import { loginSchema, type LoginFormValues } from '@/features/auth/schema'
import { useAuth } from '@/features/auth/useAuth'
import { getErrorMessage } from '@/features/auth/utils'

interface LoginFormProps {
  defaultEmail?: string
}

export function LoginForm({ defaultEmail = '' }: LoginFormProps) {
  const { login } = useAuth()
  const [changePasswordOpen, setChangePasswordOpen] = useState(false)
  const [alert, setAlert] = useState<{ type: FormAlertType; message: string } | null>(
    null,
  )

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: defaultEmail, password: '' },
  })

  useEffect(() => {
    if (defaultEmail) {
      form.setValue('email', defaultEmail)
      form.setFocus('password')
    }
  }, [defaultEmail, form])

  async function onSubmit(values: LoginFormValues) {
    setAlert(null)
    try {
      const user = await login(values.email, values.password)
      toast.success(`¡Bienvenido/a, ${user.name || 'Socio'}!`)
    } catch (error) {
      const message = getErrorMessage(error)
      setAlert({ type: 'error', message })
      toast.error(message)
    }
  }

  return (
    <>
      <div className="mb-6">
        <h1 className="text-[1.375rem] leading-tight font-semibold tracking-[-0.03em] text-foreground">
          Ingreso al sistema
        </h1>
        <p className="mt-1.5 text-[0.8125rem] text-muted-foreground">
          Usá el correo con el que te registraste.
        </p>
      </div>

      {alert && <FormAlert type={alert.type} message={alert.message} />}

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} noValidate>
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem className="mb-4">
                <FormLabel>Correo electrónico</FormLabel>
                <FormControl>
                  <Input
                    type="email"
                    placeholder="ejemplo@gymsass.com"
                    autoComplete="email"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem className="mb-4">
                <FormLabel>Contraseña</FormLabel>
                <FormControl>
                  <PasswordInput
                    placeholder="••••••••"
                    autoComplete="current-password"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="-mt-2 text-right">
            <button
              type="button"
              onClick={() => setChangePasswordOpen(true)}
              className="rounded-sm text-xs font-medium text-state-positive-ink hover:underline focus-visible:ring-[3px] focus-visible:ring-ring/25 focus-visible:outline-none"
            >
              ¿Olvidaste tu contraseña?
            </button>
          </div>

          <Button
            type="submit"
            className="mt-6 h-10 w-full"
            disabled={form.formState.isSubmitting}
          >
            {form.formState.isSubmitting && (
              <Loader2 className="size-3.5 animate-spin" />
            )}
            Ingresar al sistema
          </Button>
        </form>
      </Form>

      <LoginChangePasswordDialog
        open={changePasswordOpen}
        defaultEmail={form.getValues('email')}
        onOpenChange={setChangePasswordOpen}
      />
    </>
  )
}
