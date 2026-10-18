import { Plus, Search, Loader2 } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
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
      <div className="flex items-center justify-center py-12">
        <Loader2 className="size-6 animate-spin text-primary" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-12 text-destructive">
        Error al cargar perfiles deportivos: {(error as Error).message}
        <Button variant="outline" className="ml-4" onClick={() => refetch()}>
          Reintentar
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Perfiles deportivos</h1>
          <p className="text-muted-foreground">Objetivos y datos de entrenamiento por socio</p>
        </div>
        <Button onClick={openCreate}>
          <Plus className="size-4 mr-2" />
          Nuevo perfil
        </Button>
      </div>

      <Card>
        <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <CardTitle>Lista de perfiles ({filtered.length})</CardTitle>
          <div className="relative max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por socio, objetivo, nivel..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardHeader>
        <CardContent>
          <SportProfilesTable
            profiles={filtered}
            getUserLabel={userLabel}
            onView={(p) => setViewingId(p.id)}
            onEdit={openEdit}
            onDelete={setDeletingProfile}
          />
        </CardContent>
      </Card>

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
