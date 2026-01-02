import { apiClient } from './axios'
import type { User, Role } from '@/types/auth'

export type UsersResponse = {
  message: string
  users: User[]
}

export type UpdateUserRoleRequest = {
  role: Role
}

export const adminApi = {
  getAllUsers: async (): Promise<User[]> => {
    const response = await apiClient.get<UsersResponse>('/admin/users')
    return response.data.users
  },

  updateUserRole: async (userId: string, role: Role): Promise<User> => {
    const response = await apiClient.patch<{ message: string; user: User }>(
      `/admin/users/${userId}`,
      { role }
    )
    return response.data.user
  },
}

