import { useState } from 'react'

import { getApiBaseUrl, setApiBaseUrl } from '@/lib/api/config'

export function ApiUrlBadge() {
  const [url] = useState(getApiBaseUrl)

  function handleClick() {
    const next = window.prompt('Configurar URL de la API externa:', getApiBaseUrl())
    if (next && next.trim()) {
      setApiBaseUrl(next)
      window.location.reload()
    }
  }

  return (
    <code
      onClick={handleClick}
      title="Clic para cambiar la URL de la API"
      className="cursor-pointer rounded border border-border bg-surface-elevated px-1.5 py-0.5 text-primary"
    >
      {url}
    </code>
  )
}
