import { useState, useEffect } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { AppSidebar } from '@/components/app-sidebar'
import { SiteHeader } from '@/components/site-header'
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from '@/components/ui/field'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { useAuthStore } from '@/hooks/use-auth'
import { useUpdateProfile } from '@/hooks/queries/use-auth'
import { Role } from '@/types/auth'
import { Skeleton } from '@/components/ui/skeleton'
import { toast } from 'sonner'

export const Route = createFileRoute('/_authenticated/me')({
  component: ProfilePage,
})

function ProfilePage() {
  const user = useAuthStore((state) => state.user)
  const updateProfileMutation = useUpdateProfile()
  const currentUser = useAuthStore((state) => state.user)
  const isAdmin = currentUser?.role === Role.ADMIN

  const [name, setName] = useState('')
  const [picture, setPicture] = useState('')
  const [role, setRole] = useState<Role>(Role.USER)

  useEffect(() => {
    if (user) {
      setName(user.name || '')
      setPicture(user.picture || '')
      setRole(user.role)
    }
  }, [user])

  if (!user) {
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
                <Card>
                  <CardHeader>
                    <Skeleton className="h-8 w-48" />
                    <Skeleton className="h-4 w-64 mt-2" />
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-24 w-full" />
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </SidebarInset>
      </SidebarProvider>
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const updateData: {
      name?: string
      picture?: string
      role?: string
    } = {}

    if (name !== user?.name) {
      updateData.name = name
    }

    if (picture !== user?.picture) {
      updateData.picture = picture || undefined
    }

    if (isAdmin && role !== user?.role) {
      updateData.role = role
    }

    if (Object.keys(updateData).length === 0) {
      toast.info('No changes to save')
      return
    }

    updateProfileMutation.mutate(updateData, {
      onSuccess: () => {
        toast.success('Profile updated successfully')
      },
      onError: (error: unknown) => {
        const message =
          error instanceof Error ? error.message : 'Failed to update profile'
        toast.error(message)
      },
    })
  }

  const hasChanges =
    name !== (user?.name || '') ||
    picture !== (user?.picture || '') ||
    (isAdmin && role !== user?.role)

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
              <div className="max-w-2xl">
                <div className="mb-6">
                  <h1 className="text-2xl font-bold tracking-tight">Profile</h1>
                  <p className="text-muted-foreground mt-1">
                    This is how others will see you on the site.
                  </p>
                </div>

                <form onSubmit={handleSubmit}>
                  <Card>
                    <CardContent className="pt-6">
                      <FieldGroup>
                        <Field>
                          <FieldLabel htmlFor="name">Username</FieldLabel>
                          <Input
                            id="name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Enter your name"
                          />
                          <FieldDescription>
                            This is your public display name. It can be your real name or a pseudonym. You can only change this once every 30 days.
                          </FieldDescription>
                        </Field>

                        <Field>
                          <FieldLabel htmlFor="email">Email</FieldLabel>
                          <Input
                            id="email"
                            value={user.email}
                            disabled
                            className="bg-muted cursor-not-allowed"
                          />
                          <FieldDescription>
                            Email cannot be changed as it is linked to your Google account.
                          </FieldDescription>
                        </Field>

                        <Field>
                          <FieldLabel htmlFor="picture">Profile Picture URL</FieldLabel>
                          <Input
                            id="picture"
                            type="url"
                            value={picture}
                            onChange={(e) => setPicture(e.target.value)}
                            placeholder="https://example.com/avatar.jpg"
                          />
                          <FieldDescription>
                            Enter a URL for your profile picture. Leave empty to remove.
                          </FieldDescription>
                        </Field>

                        {isAdmin && (
                          <Field>
                            <FieldLabel htmlFor="role">Role</FieldLabel>
                            <Select
                              value={role}
                              onValueChange={(value) => setRole(value as Role)}
                            >
                              <SelectTrigger id="role" className="w-full">
                                <SelectValue placeholder="Select a role" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value={Role.USER}>USER</SelectItem>
                                <SelectItem value={Role.ADMIN}>ADMIN</SelectItem>
                                <SelectItem value={Role.VIEWER}>VIEWER</SelectItem>
                                <SelectItem value={Role.EDITOR}>EDITOR</SelectItem>
                              </SelectContent>
                            </Select>
                            <FieldDescription>
                              Change your role. Only administrators can modify roles.
                            </FieldDescription>
                          </Field>
                        )}

                        <div className="flex justify-end pt-4">
                          <Button
                            type="submit"
                            disabled={
                              updateProfileMutation.isPending || !hasChanges
                            }
                          >
                            {updateProfileMutation.isPending
                              ? 'Saving...'
                              : 'Save changes'}
                          </Button>
                        </div>
                      </FieldGroup>
                    </CardContent>
                  </Card>
                </form>
              </div>
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
