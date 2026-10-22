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
    <button
      type="button"
      onClick={handleClick}
      title={`${url} — clic para cambiar la URL de la API`}
      className="inline-flex h-7 max-w-[13rem] cursor-pointer items-center gap-2 rounded-full border border-border px-2.5 text-[0.6875rem] text-text-muted transition-colors hover:border-border-muted hover:text-foreground focus-visible:ring-[3px] focus-visible:ring-ring/25 focus-visible:outline-none"
    >
      <span className="size-1.5 shrink-0 rounded-full bg-state-positive-ink" aria-hidden="true" />
      <span className="truncate font-mono">{url.replace(/^https?:\/\//, '')}</span>
    </button>
  )
}
