interface PlaceholderPageProps {
  title: string
}

export function PlaceholderPage({ title }: PlaceholderPageProps) {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-2 text-center">
      <h1 className="text-xl font-bold tracking-tight text-foreground">{title}</h1>
      <p className="max-w-sm text-sm text-muted-foreground">
        Esta sección se habilitará cuando la API exponga sus endpoints
        correspondientes.
      </p>
    </div>
  )
}
