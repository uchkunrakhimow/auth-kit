import { apiClient } from './axios'

export type Session = {
  id: string
  userId: string
  sessionToken: string
  deviceName?: string | null
  deviceType?: string | null
  userAgent?: string | null
  ipAddress?: string | null
  lastActivity: string
  createdAt: string
  expiresAt: string
}

export type SessionsResponse = {
  message: string
  sessions: Session[]
}

export const sessionsApi = {
  getMySessions: async (): Promise<Session[]> => {
    const response = await apiClient.get<SessionsResponse>('/sessions')
    return response.data.sessions
  },

  logoutDevice: async (sessionId: string): Promise<void> => {
    await apiClient.delete(`/sessions/${sessionId}`)
  },
}

