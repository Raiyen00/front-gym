import { Plus, Search, Loader2 } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { UsersTable } from '@/features/users/components/UsersTable'
import { UserFormDialog } from '@/features/users/components/UserFormDialog'
import { UserCreateDialog } from '@/features/users/components/UserCreateDialog'
import { DeleteUserDialog } from '@/features/users/components/DeleteUserDialog'
import { UserDetailDialog } from '@/features/users/components/UserDetailDialog'
import {
  useUsers,
  useCreateUser,
  useUpdateUser,
  useEnableUser,
  useDeleteUser,
} from '@/features/users/queries'
import { useAuth } from '@/features/auth/useAuth'
import { getErrorMessage } from '@/features/auth/utils'
import type { User, UserCreate, UserUpdate } from '@/types/user'

export function UsersPage() {
  const { user } = useAuth()
  const { data: users, isLoading, error, refetch } = useUsers()
  const [search, setSearch] = useState('')
  const [createOpen, setCreateOpen] = useState(false)
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [deletingUser, setDeletingUser] = useState<User | null>(null)
  const [viewingUserId, setViewingUserId] = useState<number | null>(null)

  const isAdmin = user?.rol === 'admin'
  const createUser = useCreateUser()
  const updateUser = useUpdateUser(editingUser?.id ?? 0)
  const enableUser = useEnableUser()
  const deleteUser = useDeleteUser()

  const filteredUsers = users?.filter((u) =>
    `${u.name} ${u.lastname} ${u.email} ${u.dni}`.toLowerCase().includes(search.toLowerCase())
  ) ?? []

  async function handleCreate(data: UserCreate) {
    try {
      await createUser.mutateAsync(data)
      toast.success('Socio creado. Queda pendiente de habilitación.')
      setCreateOpen(false)
    } catch (err) {
      toast.error(getErrorMessage(err))
    }
  }

  async function handleEdit(data: UserUpdate) {
    if (!editingUser) return
    try {
      await updateUser.mutateAsync(data)
      toast.success('Socio actualizado')
      setEditingUser(null)
    } catch (err) {
      toast.error(getErrorMessage(err))
    }
  }

  async function handleEnable(target: User) {
    try {
      await enableUser.mutateAsync(target.id)
      toast.success(`${target.name} ${target.lastname} habilitado para entrenar`)
    } catch (err) {
      toast.error(getErrorMessage(err))
    }
  }

  async function handleDelete() {
    if (!deletingUser) return
    try {
      await deleteUser.mutateAsync(deletingUser.id)
      toast.success('Socio eliminado')
      setDeletingUser(null)
    } catch (err) {
      toast.error(getErrorMessage(err))
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="size-5 animate-spin text-text-muted" />
        <span className="sr-only">Cargando socios</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-start gap-3 rounded-xl bg-card p-6">
        <p className="text-sm text-foreground">
          No se pudieron cargar los socios.
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
            Socios
          </h1>
          <p className="mt-1 text-[0.8125rem] text-muted-foreground">
            Altas, estado y datos de contacto de cada socio del gimnasio.
          </p>
        </div>
        {isAdmin && (
          <Button onClick={() => setCreateOpen(true)}>
            <Plus className="size-4" strokeWidth={2} />
            Nuevo socio
          </Button>
        )}
      </header>

      <section className="overflow-hidden rounded-xl bg-card">
        <div className="flex flex-col gap-3 border-b border-border px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative w-full sm:w-[19rem]">
            <Search
              className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-text-muted"
              strokeWidth={1.75}
            />
            <Input
              placeholder="Buscar por nombre, email o DNI"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-9 pl-9"
              aria-label="Buscar socios"
            />
          </div>
          <p className="num text-xs text-text-muted">
            {filteredUsers.length} de {users?.length ?? 0} socios
          </p>
        </div>

        <UsersTable
          users={filteredUsers}
          canManage={isAdmin}
          onView={(u) => setViewingUserId(u.id)}
          onEdit={setEditingUser}
          onEnable={handleEnable}
          onDelete={setDeletingUser}
        />
      </section>

      <UserDetailDialog
        userId={viewingUserId}
        canManage={isAdmin}
        onEnable={handleEnable}
        onDelete={(u) => {
          setViewingUserId(null)
          setDeletingUser(u)
        }}
        onOpenChange={(open) => {
          if (!open) setViewingUserId(null)
        }}
      />

      <UserFormDialog
        user={editingUser}
        isPending={updateUser.isPending}
        onSubmit={handleEdit}
        onOpenChange={(open) => {
          if (!open) setEditingUser(null)
        }}
      />

      <UserCreateDialog
        open={createOpen}
        isPending={createUser.isPending}
        onSubmit={handleCreate}
        onOpenChange={setCreateOpen}
      />

      <DeleteUserDialog
        user={deletingUser}
        isPending={deleteUser.isPending}
        onConfirm={handleDelete}
        onOpenChange={(open) => {
          if (!open) setDeletingUser(null)
        }}
      />
    </div>
  )
}
