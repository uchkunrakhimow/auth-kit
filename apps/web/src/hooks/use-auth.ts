import {
  AUTH_KEYS,
  useCurrentUser as useCurrentUserQuery,
  useLogout,
} from './queries/use-auth'
import { useAuthStore } from '@/stores/auth.store'

// Re-export for convenience
export { useCurrentUserQuery as useCurrentUser, useLogout, AUTH_KEYS }
export { useAuthStore }

// Convenience hook that combines store state and query
export function useAuth() {
  const user = useAuthStore((state) => state.user)
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
  const { isLoading } = useCurrentUserQuery()

  return {
    user,
    isAuthenticated,
    loading: isLoading,
  }
}
