import {
  AlertCircle,
  CheckCircle2,
  Info,
  TriangleAlert,
  type LucideIcon,
} from 'lucide-react'

import { Alert, AlertDescription } from '@/components/ui/alert'

export type FormAlertType = 'error' | 'warning' | 'success' | 'info'

const ICONS: Record<FormAlertType, LucideIcon> = {
  error: AlertCircle,
  warning: TriangleAlert,
  success: CheckCircle2,
  info: Info,
}

interface FormAlertProps {
  type: FormAlertType
  message: string
}

export function FormAlert({ type, message }: FormAlertProps) {
  const Icon = ICONS[type]
  return (
    <Alert variant={type} className="mb-4">
      <Icon />
      <AlertDescription className="text-current">{message}</AlertDescription>
    </Alert>
  )
}
