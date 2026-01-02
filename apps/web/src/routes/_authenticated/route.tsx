import { Outlet, createFileRoute, redirect } from '@tanstack/react-router'
import { queryClient } from '@/lib/query-client'
import { useAuthStore } from '@/stores/auth.store'
import { AUTH_KEYS, useCurrentUser } from '@/hooks/queries/use-auth'
import { authApi } from '@/api/auth'

export const Route = createFileRoute('/_authenticated')({
  beforeLoad: async ({ location }) => {
    // Check Zustand store first (fastest check)
    const store = useAuthStore.getState()
    if (store.isAuthenticated && store.user) {
      return
    }

    // Check QueryClient cache
    const cachedData = queryClient.getQueryData(AUTH_KEYS.currentUser)
    if (cachedData) {
      useAuthStore.getState().setUser(cachedData as typeof store.user)
      return
    }

    // If not cached, try to fetch user data
    // Retry once in case of timing issues (e.g., after OAuth redirect)
    let lastError: Error | null = null
    for (let attempt = 0; attempt < 2; attempt++) {
      try {
        const user = await authApi.getCurrentUser()
        useAuthStore.getState().setUser(user)
        queryClient.setQueryData(AUTH_KEYS.currentUser, user)
        return
      } catch (error) {
        lastError = error instanceof Error ? error : new Error('Failed to fetch user')
        // Wait a bit before retrying (only on first attempt)
        if (attempt === 0) {
          await new Promise((resolve) => setTimeout(resolve, 500))
        }
      }
    }

    // If all attempts failed, redirect to login
    throw redirect({
      to: '/auth/login',
      search: {
        redirect: location.href,
      },
    })
  },
  component: AuthenticatedLayout,
})

function AuthenticatedLayout() {
  const { isAuthenticated } = useAuthStore()
  useCurrentUser() // Keep user data fresh

  if (!isAuthenticated) {
    return null
  }

  return <Outlet />
}
