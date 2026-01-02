import { apiClient } from './axios'
import type { AuthResponse, User, LoginRequest, RegisterRequest } from '@/types/auth'
import { API_BASE_URL } from '@/lib/config'

export const authApi = {
  login: async (credentials: LoginRequest): Promise<AuthResponse> => {
    const response = await apiClient.post<AuthResponse>('/auth/login', credentials)
    return response.data
  },

  register: async (data: RegisterRequest): Promise<AuthResponse> => {
    const response = await apiClient.post<AuthResponse>('/auth/register', data)
    return response.data
  },

  getCurrentUser: async (): Promise<User> => {
    const response = await apiClient.get<AuthResponse>('/users/me')
    return response.data.user
  },

  updateProfile: async (data: {
    name?: string
    picture?: string
    role?: string
  }): Promise<AuthResponse> => {
    const response = await apiClient.patch<AuthResponse>('/users/me', data)
    return response.data
  },

  initiateGoogleAuth: () => {
    window.location.href = `${API_BASE_URL}/auth/google`
  },

  logout: async (): Promise<void> => {
    await apiClient.post('/auth/logout')
  },
}
