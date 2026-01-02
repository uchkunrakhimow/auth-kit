import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import type { LoginRequest, RegisterRequest } from '@/types/auth'
import { authApi } from '@/api/auth'
import { useAuthStore } from '@/stores/auth.store'

export const AUTH_KEYS = {
  currentUser: ['auth', 'currentUser'] as const,
}

export function useCurrentUser() {
  const setUser = useAuthStore((state) => state.setUser)
  const clearAuth = useAuthStore((state) => state.clearAuth)

  return useQuery({
    queryKey: AUTH_KEYS.currentUser,
    queryFn: async () => {
      try {
        const user = await authApi.getCurrentUser()
        setUser(user)
        return user
      } catch (error) {
        clearAuth()
        throw error
      }
    },
    retry: false,
    staleTime: 1000 * 60 * 5, // 5 minutes
  })
}

export function useLogin() {
  const queryClient = useQueryClient()
  const setUser = useAuthStore((state) => state.setUser)
  const navigate = useNavigate()

  return useMutation({
    mutationFn: (credentials: LoginRequest) => authApi.login(credentials),
    onSuccess: (response) => {
      setUser(response.user)
      queryClient.setQueryData(AUTH_KEYS.currentUser, response.user)
      navigate({ to: '/dashboard' })
    },
  })
}

export function useRegister() {
  const queryClient = useQueryClient()
  const setUser = useAuthStore((state) => state.setUser)
  const navigate = useNavigate()

  return useMutation({
    mutationFn: (data: RegisterRequest) => authApi.register(data),
    onSuccess: (response) => {
      setUser(response.user)
      queryClient.setQueryData(AUTH_KEYS.currentUser, response.user)
      navigate({ to: '/dashboard' })
    },
  })
}

export function useUpdateProfile() {
  const queryClient = useQueryClient()
  const setUser = useAuthStore((state) => state.setUser)

  return useMutation({
    mutationFn: (data: { name?: string; picture?: string; role?: string }) =>
      authApi.updateProfile(data),
    onSuccess: (response) => {
      setUser(response.user)
      queryClient.setQueryData(AUTH_KEYS.currentUser, response.user)
    },
  })
}

export function useLogout() {
  const queryClient = useQueryClient()
  const clearAuth = useAuthStore((state) => state.clearAuth)
  const navigate = useNavigate()

  return useMutation({
    mutationFn: authApi.logout,
    onSuccess: () => {
      clearAuth()
      queryClient.clear()
      navigate({ to: '/auth/login' })
    },
    onError: () => {
      // Even if logout fails, clear local state
      clearAuth()
      queryClient.clear()
      navigate({ to: '/auth/login' })
    },
  })
}
