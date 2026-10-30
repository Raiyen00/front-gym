import { useEffect, useState } from 'react'
import { Loader2, ShieldCheck } from 'lucide-react'
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
import { PasswordInput } from '@/components/ui/password-input'
import { PasswordPolicyNote } from '@/components/PasswordPolicyNote'
import { FormAlert, type FormAlertType } from '@/features/auth/components/FormAlert'
import { useLoginChangePassword } from '@/features/auth/queries'
import {
  loginChangePasswordSchema,
  type LoginChangePasswordFormValues,
} from '@/features/auth/schema'
import { getErrorMessage } from '@/features/auth/utils'

const EMPTY_VALUES: LoginChangePasswordFormValues = {
  email: '',
  oldPassword: '',
  newPassword: '',
  confirmPassword: '',
}

interface LoginChangePasswordDialogProps {
  open: boolean
  defaultEmail?: string
  onOpenChange: (open: boolean) => void
}

export function LoginChangePasswordDialog({
  open,
  defaultEmail = '',
  onOpenChange,
}: LoginChangePasswordDialogProps) {
  const changePassword = useLoginChangePassword()
  const [alert, setAlert] = useState<{
    type: FormAlertType
    message: string
  } | null>(null)

  const form = useForm<LoginChangePasswordFormValues>({
    resolver: zodResolver(loginChangePasswordSchema),
    defaultValues: EMPTY_VALUES,
  })

  // Al abrir, precarga el correo que ya estaba escrito en el login.
  useEffect(() => {
    if (!open) return
    form.reset({ ...EMPTY_VALUES, email: defaultEmail })
  }, [open, defaultEmail, form])

  const isPending = changePassword.isPending

  function handleOpenChange(next: boolean) {
    if (!next) setAlert(null)
    onOpenChange(next)
  }

  async function onSubmit(values: LoginChangePasswordFormValues) {
    setAlert(null)
    try {
      await changePassword.mutateAsync({
        email: values.email,
        oldPassword: values.oldPassword,
        newPassword: values.newPassword,
      })
      // El login con la contraseña nueva redirige al panel.
      toast.success('Contraseña actualizada correctamente')
    } catch (error) {
      const message = getErrorMessage(error)
      setAlert({ type: 'error', message })
      toast.error(message)
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Cambiar contraseña</DialogTitle>
          <DialogDescription>
            Verificá tu identidad con la contraseña actual y elegí una nueva de
            al menos 8 caracteres. Si no la recordás, contactá al gimnasio para
            restablecerla.
          </DialogDescription>
        </DialogHeader>

        {alert && <FormAlert type={alert.type} message={alert.message} />}

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} noValidate className="space-y-4">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
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
              name="oldPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Contraseña actual</FormLabel>
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

            <FormField
              control={form.control}
              name="newPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nueva contraseña</FormLabel>
                  <FormControl>
                    <PasswordInput
                      placeholder="••••••••"
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
                  <FormLabel>Confirmar nueva contraseña</FormLabel>
                  <FormControl>
                    <PasswordInput
                      placeholder="••••••••"
                      autoComplete="new-password"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <PasswordPolicyNote />

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => handleOpenChange(false)}
                disabled={isPending}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending ? (
                  <>
                    <Loader2 className="size-3.5 animate-spin" />
                    Cambiando...
                  </>
                ) : (
                  <>
                    <ShieldCheck className="size-3.5" />
                    Cambiar contraseña
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
