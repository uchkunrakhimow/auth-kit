import { createFileRoute, redirect } from '@tanstack/react-router'
import { queryClient } from '@/lib/query-client'
import { useAuthStore } from '@/stores/auth.store'
import { AUTH_KEYS } from '@/hooks/queries/use-auth'
import { authApi } from '@/api/auth'

export const Route = createFileRoute('/')({
  beforeLoad: async () => {
    // Check if user is authenticated by checking store or cache
    const store = useAuthStore.getState()
    const cachedUser = queryClient.getQueryData(AUTH_KEYS.currentUser)

    if (store.isAuthenticated || cachedUser) {
      throw redirect({ to: '/dashboard' })
    }

    // Try to fetch user to check if session exists
    try {
      const user = await authApi.getCurrentUser()
      useAuthStore.getState().setUser(user)
      queryClient.setQueryData(AUTH_KEYS.currentUser, user)
      throw redirect({ to: '/dashboard' })
    } catch {
      // No valid session, redirect to login
      throw redirect({ to: '/auth/login' })
    }
  },
})
