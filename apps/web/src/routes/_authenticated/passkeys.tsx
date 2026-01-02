import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import { AppSidebar } from '@/components/app-sidebar'
import { SiteHeader } from '@/components/site-header'
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { passkeysApi } from '@/api/passkeys'
import { toast } from 'sonner'
import { IconTrash, IconKey, IconCalendar, IconPlus } from '@tabler/icons-react'
import { AddPasskeyModal } from '@/components/add-passkey-modal'
const formatDistanceToNow = (date: Date, options?: { addSuffix?: boolean }) => {
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffSecs = Math.floor(diffMs / 1000)
  const diffMins = Math.floor(diffSecs / 60)
  const diffHours = Math.floor(diffMins / 60)
  const diffDays = Math.floor(diffHours / 24)

  let result = ''
  if (diffDays > 0) {
    result = `${diffDays} day${diffDays > 1 ? 's' : ''} ago`
  } else if (diffHours > 0) {
    result = `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`
  } else if (diffMins > 0) {
    result = `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`
  } else {
    result = 'just now'
  }

  return options?.addSuffix ? result : result.replace(' ago', '')
}

export const Route = createFileRoute('/_authenticated/passkeys')({
  component: PasskeysPage,
})

function PasskeysPage() {
  const queryClient = useQueryClient()
  const [isModalOpen, setIsModalOpen] = useState(false)

  const { data: passkeys, isLoading } = useQuery({
    queryKey: ['passkeys'],
    queryFn: passkeysApi.getMyPasskeys,
  })

  const deletePasskeyMutation = useMutation({
    mutationFn: passkeysApi.deletePasskey,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['passkeys'] })
      toast.success('Passkey deleted successfully')
    },
    onError: () => {
      toast.error('Failed to delete passkey')
    },
  })

  const handleDeletePasskey = (passkeyId: string) => {
    if (confirm('Are you sure you want to delete this passkey?')) {
      deletePasskeyMutation.mutate(passkeyId)
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
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-3xl font-bold tracking-tight">Passkeys</h1>
                  <p className="text-muted-foreground">
                    Manage your passkeys for passwordless authentication
                  </p>
                </div>
                <Button onClick={() => setIsModalOpen(true)}>
                  <IconPlus className="h-4 w-4 mr-2" />
                  Add Passkey
                </Button>
              </div>

              {isLoading ? (
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-center text-muted-foreground">Loading passkeys...</div>
                  </CardContent>
                </Card>
              ) : !passkeys || passkeys.length === 0 ? (
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-center text-muted-foreground">
                      No passkeys registered. Add a passkey to enable passwordless authentication.
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid gap-4">
                  {passkeys.map((passkey) => (
                    <Card key={passkey.id}>
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-primary/10">
                              <IconKey className="h-5 w-5 text-primary" />
                            </div>
                            <div>
                              <CardTitle className="text-lg">
                                {passkey.deviceName || 'Unnamed Passkey'}
                              </CardTitle>
                              <CardDescription>
                                Credential ID: {passkey.credentialId.slice(0, 20)}...
                              </CardDescription>
                            </div>
                          </div>
                          <Badge variant="default">Active</Badge>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="grid gap-2 text-sm">
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <IconCalendar className="h-4 w-4" />
                            <span>
                              Created:{' '}
                              {formatDistanceToNow(new Date(passkey.createdAt), {
                                addSuffix: true,
                              })}
                            </span>
                          </div>
                          {passkey.lastUsedAt && (
                            <div className="flex items-center gap-2 text-muted-foreground">
                              <IconCalendar className="h-4 w-4" />
                              <span>
                                Last used:{' '}
                                {formatDistanceToNow(new Date(passkey.lastUsedAt), {
                                  addSuffix: true,
                                })}
                              </span>
                            </div>
                          )}
                        </div>
                        <div className="mt-4 flex justify-end">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeletePasskey(passkey.id)}
                            disabled={deletePasskeyMutation.isPending}
                          >
                            <IconTrash className="h-4 w-4 mr-2" />
                            Delete Passkey
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </SidebarInset>
      <AddPasskeyModal open={isModalOpen} onOpenChange={setIsModalOpen} />
    </SidebarProvider>
  )
}

