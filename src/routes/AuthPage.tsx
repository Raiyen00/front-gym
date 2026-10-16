import { useState } from 'react'
import { Loader2 } from 'lucide-react'

import { AuthLayout } from '@/app/layouts/AuthLayout'
import { AuthTabs, type AuthTab } from '@/features/auth/components/AuthTabs'
import { LoginForm } from '@/features/auth/components/LoginForm'
import { RegisterForm } from '@/features/auth/components/RegisterForm'
import { SessionView } from '@/features/auth/components/SessionView'
import { useAuth } from '@/features/auth/useAuth'

export function AuthPage() {
  const { status } = useAuth()
  const [tab, setTab] = useState<AuthTab>('login')
  const [prefillEmail, setPrefillEmail] = useState('')

  if (status === 'loading') {
    return (
      <AuthLayout>
        <div className="flex items-center justify-center py-8">
          <Loader2 className="size-6 animate-spin text-primary" />
        </div>
      </AuthLayout>
    )
  }

  if (status === 'authenticated') {
    return (
      <AuthLayout>
        <SessionView />
      </AuthLayout>
    )
  }

  function handleRegistered(email: string) {
    window.setTimeout(() => {
      setPrefillEmail(email)
      setTab('login')
    }, 1600)
  }

  return (
    <AuthLayout>
      <AuthTabs
        value={tab}
        onChange={(next) => {
          setTab(next)
          if (next !== 'login') setPrefillEmail('')
        }}
      />
      {tab === 'login' ? (
        <LoginForm defaultEmail={prefillEmail} />
      ) : (
        <RegisterForm onRegistered={handleRegistered} />
      )}
    </AuthLayout>
  )
}
