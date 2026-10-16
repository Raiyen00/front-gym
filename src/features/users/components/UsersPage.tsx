import { Plus, Search, Loader2 } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { UsersTable } from '@/features/users/components/UsersTable'
import { UserFormDialog } from '@/features/users/components/UserFormDialog'
import { DeleteUserDialog } from '@/features/users/components/DeleteUserDialog'
import { UserDetailDialog } from '@/features/users/components/UserDetailDialog'
import {
  useUsers,
  useUpdateUser,
  useEnableUser,
  useDeleteUser,
} from '@/features/users/queries'
import { useAuth } from '@/features/auth/useAuth'
import { getErrorMessage } from '@/features/auth/utils'
import type { User, UserUpdate } from '@/types/user'

export function UsersPage() {
  const { user } = useAuth()
  const { data: users, isLoading, error, refetch } = useUsers()
  const [search, setSearch] = useState('')
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [deletingUser, setDeletingUser] = useState<User | null>(null)
  const [viewingUserId, setViewingUserId] = useState<number | null>(null)

  const isAdmin = user?.rol === 'admin'
  const updateUser = useUpdateUser(editingUser?.id ?? 0)
  const enableUser = useEnableUser()
  const deleteUser = useDeleteUser()

  const filteredUsers = users?.filter((u) =>
    `${u.name} ${u.lastname} ${u.email} ${u.dni}`.toLowerCase().includes(search.toLowerCase())
  ) ?? []

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
      <div className="flex items-center justify-center py-12">
        <Loader2 className="size-6 animate-spin text-primary" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-12 text-destructive">
        Error al cargar socios: {(error as Error).message}
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
          <h1 className="text-2xl font-bold">Socios</h1>
          <p className="text-muted-foreground">Gestión de socios del gimnasio</p>
        </div>
        {isAdmin && (
          <Button>
            <Plus className="size-4 mr-2" />
            Nuevo socio
          </Button>
        )}
      </div>

      <Card>
        <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <CardTitle>Lista de socios ({filteredUsers.length})</CardTitle>
          <div className="relative max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por nombre, email, DNI..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardHeader>
        <CardContent>
          <UsersTable
            users={filteredUsers}
            canManage={isAdmin}
            onView={(u) => setViewingUserId(u.id)}
            onEdit={setEditingUser}
            onEnable={handleEnable}
            onDelete={setDeletingUser}
          />
        </CardContent>
      </Card>

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
