import { createFileRoute } from '@tanstack/react-router'
import { AppSidebar } from '@/components/app-sidebar'
import { SiteHeader } from '@/components/site-header'
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { adminApi } from '@/api/admin'
import { toast } from 'sonner'
import { IconShield, IconUser } from '@tabler/icons-react'
import type { Role } from '@/types/auth'
import { useAuthStore } from '@/hooks/use-auth'

export const Route = createFileRoute('/_authenticated/admin/users')({
  component: AdminUsersPage,
})

function AdminUsersPage() {
  const queryClient = useQueryClient()
  const currentUser = useAuthStore((state) => state.user)

  const { data: users, isLoading } = useQuery({
    queryKey: ['admin', 'users'],
    queryFn: adminApi.getAllUsers,
  })

  const updateRoleMutation = useMutation({
    mutationFn: ({ userId, role }: { userId: string; role: Role }) =>
      adminApi.updateUserRole(userId, role),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] })
      toast.success('User role updated successfully')
    },
    onError: () => {
      toast.error('Failed to update user role')
    },
  })

  const handleRoleChange = (userId: string, newRole: Role) => {
    updateRoleMutation.mutate({ userId, role: newRole })
  }

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case 'ADMIN':
        return 'destructive'
      case 'EDITOR':
        return 'default'
      case 'VIEWER':
        return 'secondary'
      default:
        return 'outline'
    }
  }

  return (
    <SidebarProvider
      style={
        {
          '--sidebar-width': 'calc(var(--spacing) * 72)',
          '--header-height': 'calc(var(--spacing) * 12)',
        } as React.CSSProperties
      }
    >
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader />
        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-2">
            <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6 px-4 lg:px-6">
              <div>
                <h1 className="text-3xl font-bold tracking-tight">User Management</h1>
                <p className="text-muted-foreground">
                  Manage user roles and permissions
                </p>
              </div>

              {isLoading ? (
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-center text-muted-foreground">Loading users...</div>
                  </CardContent>
                </Card>
              ) : !users || users.length === 0 ? (
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-center text-muted-foreground">No users found</div>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid gap-4">
                  {users.map((user) => (
                    <Card key={user.id}>
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-primary/10">
                              <IconUser className="h-5 w-5 text-primary" />
                            </div>
                            <div>
                              <CardTitle className="text-lg">
                                {user.name || 'Unnamed User'}
                              </CardTitle>
                              <CardDescription>{user.email}</CardDescription>
                            </div>
                          </div>
                          <Badge variant={getRoleBadgeVariant(user.role)}>
                            <IconShield className="h-3 w-3 mr-1" />
                            {user.role}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="flex items-center justify-between">
                          <div className="text-sm text-muted-foreground">
                            ID: {user.id}
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium">Role:</span>
                            <Select
                              value={user.role}
                              onValueChange={(value) =>
                                handleRoleChange(user.id, value as Role)
                              }
                              disabled={
                                updateRoleMutation.isPending ||
                                user.id === currentUser?.id
                              }
                            >
                              <SelectTrigger className="w-32">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value={Role.USER}>USER</SelectItem>
                                <SelectItem value={Role.VIEWER}>VIEWER</SelectItem>
                                <SelectItem value={Role.EDITOR}>EDITOR</SelectItem>
                                <SelectItem value={Role.ADMIN}>ADMIN</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                        {user.id === currentUser?.id && (
                          <p className="text-xs text-muted-foreground mt-2">
                            You cannot change your own role
                          </p>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
