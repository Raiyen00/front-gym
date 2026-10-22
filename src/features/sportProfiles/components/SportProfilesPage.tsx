import { Plus, Search, Loader2 } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { SportProfilesTable } from '@/features/sportProfiles/components/SportProfilesTable'
import { SportProfileFormDialog } from '@/features/sportProfiles/components/SportProfileFormDialog'
import { SportProfileDetailDialog } from '@/features/sportProfiles/components/SportProfileDetailDialog'
import { DeleteSportProfileDialog } from '@/features/sportProfiles/components/DeleteSportProfileDialog'
import {
  useSportProfiles,
  useCreateSportProfile,
  useUpdateSportProfile,
  useDeleteSportProfile,
} from '@/features/sportProfiles/queries'
import { useUsers } from '@/features/users/queries'
import { getErrorMessage } from '@/features/auth/utils'
import type {
  SportProfile,
  SportProfileCreate,
  SportProfileUpdate,
} from '@/types/sportProfile'

export function SportProfilesPage() {
  const { data: profiles, isLoading, error, refetch } = useSportProfiles()
  const { data: users } = useUsers()
  const [search, setSearch] = useState('')
  const [formOpen, setFormOpen] = useState(false)
  const [editingProfile, setEditingProfile] = useState<SportProfile | null>(null)
  const [deletingProfile, setDeletingProfile] = useState<SportProfile | null>(null)
  const [viewingId, setViewingId] = useState<number | null>(null)

  const createProfile = useCreateSportProfile()
  const updateProfile = useUpdateSportProfile(editingProfile?.id ?? 0)
  const deleteProfile = useDeleteSportProfile()

  const userLabel = (userId: number) => {
    const u = users?.find((item) => item.id === userId)
    return u ? `${u.name} ${u.lastname}` : `Socio #${userId}`
  }

  const filtered = profiles?.filter((p) => {
    const label = userLabel(p.user_id)
    const haystack = `${label} ${p.goal} ${p.level}`.toLowerCase()
    return haystack.includes(search.toLowerCase())
  }) ?? []

  function openCreate() {
    setEditingProfile(null)
    setFormOpen(true)
  }

  function openEdit(profile: SportProfile) {
    setEditingProfile(profile)
    setFormOpen(true)
  }

  async function handleSubmit(payload: SportProfileCreate | SportProfileUpdate) {
    try {
      if (editingProfile) {
        await updateProfile.mutateAsync(payload as SportProfileUpdate)
        toast.success('Perfil deportivo actualizado')
      } else {
        await createProfile.mutateAsync(payload as SportProfileCreate)
        toast.success('Perfil deportivo creado')
      }
      setFormOpen(false)
      setEditingProfile(null)
    } catch (err) {
      toast.error(getErrorMessage(err))
    }
  }

  async function handleDelete() {
    if (!deletingProfile) return
    try {
      await deleteProfile.mutateAsync(deletingProfile.id)
      toast.success('Perfil deportivo eliminado')
      setDeletingProfile(null)
    } catch (err) {
      toast.error(getErrorMessage(err))
    }
  }

  function handleEditFromDetail(profileId: number) {
    const profile = profiles?.find((p) => p.id === profileId)
    setViewingId(null)
    if (profile) openEdit(profile)
  }

  function handleDeleteFromDetail(profileId: number) {
    const profile = profiles?.find((p) => p.id === profileId)
    setViewingId(null)
    if (profile) setDeletingProfile(profile)
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="size-5 animate-spin text-text-muted" />
        <span className="sr-only">Cargando perfiles deportivos</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-start gap-3 rounded-xl bg-card p-6">
        <p className="text-sm text-foreground">
          No se pudieron cargar los perfiles deportivos.
        </p>
        <p className="text-[0.8125rem] text-muted-foreground">
          {(error as Error).message}
        </p>
        <Button variant="outline" size="sm" onClick={() => refetch()}>
          Reintentar
        </Button>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-[1.5rem] leading-tight font-semibold tracking-[-0.02em] text-foreground">
            Perfiles deportivos
          </h1>
          <p className="mt-1 text-[0.8125rem] text-muted-foreground">
            Objetivos, nivel y seguimiento de entrenamiento por socio.
          </p>
        </div>
        <Button onClick={openCreate}>
          <Plus className="size-4" strokeWidth={2} />
          Nuevo perfil
        </Button>
      </header>

      <section className="overflow-hidden rounded-xl bg-card">
        <div className="flex flex-col gap-3 border-b border-border px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative w-full sm:w-[19rem]">
            <Search
              className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-text-muted"
              strokeWidth={1.75}
            />
            <Input
              placeholder="Buscar por socio, objetivo o nivel"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-9 pl-9"
              aria-label="Buscar perfiles deportivos"
            />
          </div>
          <p className="num text-xs text-text-muted">
            {filtered.length} de {profiles?.length ?? 0} perfiles
          </p>
        </div>

        <SportProfilesTable
          profiles={filtered}
          getUserLabel={userLabel}
          onView={(p) => setViewingId(p.id)}
          onEdit={openEdit}
          onDelete={setDeletingProfile}
        />
      </section>

      <SportProfileFormDialog
        key={formOpen ? (editingProfile?.id ?? 'nuevo') : 'cerrado'}
        open={formOpen}
        profile={editingProfile}
        isPending={createProfile.isPending || updateProfile.isPending}
        onSubmit={handleSubmit}
        onOpenChange={(open) => {
          setFormOpen(open)
          if (!open) setEditingProfile(null)
        }}
      />

      <SportProfileDetailDialog
        profileId={viewingId}
        getUserLabel={userLabel}
        onEdit={handleEditFromDetail}
        onDelete={handleDeleteFromDetail}
        onOpenChange={(open) => {
          if (!open) setViewingId(null)
        }}
      />

      <DeleteSportProfileDialog
        profile={deletingProfile}
        isPending={deleteProfile.isPending}
        onConfirm={handleDelete}
        onOpenChange={(open) => {
          if (!open) setDeletingProfile(null)
        }}
      />
    </div>
  )
}
