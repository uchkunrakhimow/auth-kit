import { createFileRoute } from '@tanstack/react-router'
import { AppSidebar } from '@/components/app-sidebar'
import { SiteHeader } from '@/components/site-header'
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { sessionsApi } from '@/api/sessions'
import { toast } from 'sonner'
import { IconTrash, IconDeviceDesktop, IconCalendar, IconMapPin } from '@tabler/icons-react'
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

export const Route = createFileRoute('/_authenticated/sessions')({
  component: SessionsPage,
})

function SessionsPage() {
  const queryClient = useQueryClient()

  const { data: sessions, isLoading } = useQuery({
    queryKey: ['sessions'],
    queryFn: sessionsApi.getMySessions,
  })

  const deleteSessionMutation = useMutation({
    mutationFn: sessionsApi.logoutDevice,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sessions'] })
      toast.success('Device logged out successfully')
    },
    onError: () => {
      toast.error('Failed to logout device')
    },
  })

  const handleLogoutDevice = (sessionId: string) => {
    if (confirm('Are you sure you want to logout this device?')) {
      deleteSessionMutation.mutate(sessionId)
    }
  }

  const getDeviceIcon = (deviceType?: string | null) => {
    return IconDeviceDesktop
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
                <h1 className="text-3xl font-bold tracking-tight">Active Sessions</h1>
                <p className="text-muted-foreground">
                  Manage your active sessions and devices
                </p>
              </div>

              {isLoading ? (
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-center text-muted-foreground">Loading sessions...</div>
                  </CardContent>
                </Card>
              ) : !sessions || sessions.length === 0 ? (
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-center text-muted-foreground">No active sessions</div>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid gap-4">
                  {sessions.map((session) => {
                    const DeviceIcon = getDeviceIcon(session.deviceType)
                    const isExpired = new Date(session.expiresAt) < new Date()

                    return (
                      <Card key={session.id}>
                        <CardHeader>
                          <div className="flex items-start justify-between">
                            <div className="flex items-center gap-3">
                              <div className="p-2 rounded-lg bg-primary/10">
                                <DeviceIcon className="h-5 w-5 text-primary" />
                              </div>
                              <div>
                                <CardTitle className="text-lg">
                                  {session.deviceName || session.deviceType || 'Unknown Device'}
                                </CardTitle>
                                <CardDescription>
                                  {session.userAgent || 'No user agent information'}
                                </CardDescription>
                              </div>
                            </div>
                            {isExpired ? (
                              <Badge variant="secondary">Expired</Badge>
                            ) : (
                              <Badge variant="default">Active</Badge>
                            )}
                          </div>
                        </CardHeader>
                        <CardContent>
                          <div className="grid gap-2 text-sm">
                            {session.ipAddress && (
                              <div className="flex items-center gap-2 text-muted-foreground">
                                <IconMapPin className="h-4 w-4" />
                                <span>IP: {session.ipAddress}</span>
                              </div>
                            )}
                            <div className="flex items-center gap-2 text-muted-foreground">
                              <IconCalendar className="h-4 w-4" />
                              <span>
                                Last active:{' '}
                                {formatDistanceToNow(new Date(session.lastActivity), {
                                  addSuffix: true,
                                })}
                              </span>
                            </div>
                            <div className="flex items-center gap-2 text-muted-foreground">
                              <IconCalendar className="h-4 w-4" />
                              <span>
                                Created:{' '}
                                {formatDistanceToNow(new Date(session.createdAt), {
                                  addSuffix: true,
                                })}
                              </span>
                            </div>
                          </div>
                          <div className="mt-4 flex justify-end">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleLogoutDevice(session.id)}
                              disabled={deleteSessionMutation.isPending || isExpired}
                            >
                              <IconTrash className="h-4 w-4 mr-2" />
                              Logout Device
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    )
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}

