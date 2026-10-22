interface PlaceholderPageProps {
  title: string
}

export function PlaceholderPage({ title }: PlaceholderPageProps) {
  return (
    <div className="flex min-h-[56vh] items-center justify-center py-10">
      <div className="w-full max-w-[24rem] border-t border-border pt-6">
        <div className="flex items-center gap-3">
          <span className="font-mono text-xs text-text-muted">Módulo</span>
          <span className="h-3 w-px bg-border-muted" aria-hidden="true" />
          <span className="text-xs text-text-muted">Sin endpoint activo</span>
        </div>

        <h1 className="mt-4 text-2xl leading-tight font-semibold tracking-[-0.03em] text-foreground">
          {title}
        </h1>
        <p className="mt-2.5 text-sm leading-relaxed text-muted-foreground">
          Esta sección se habilitará cuando la API exponga sus endpoints
          correspondientes.
        </p>
      </div>
    </div>
  )
}
