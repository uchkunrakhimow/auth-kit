import { apiClient } from './axios'

export type Passkey = {
  id: string
  userId: string
  credentialId: string
  deviceName?: string | null
  createdAt: string
  lastUsedAt?: string | null
}

export type PasskeysResponse = {
  message: string
  passkeys: Passkey[]
}

export type CreatePasskeyRequest = {
  credentialId: string
  publicKey: string
  deviceName?: string
}

export const passkeysApi = {
  getMyPasskeys: async (): Promise<Passkey[]> => {
    const response = await apiClient.get<PasskeysResponse>('/passkeys')
    return response.data.passkeys
  },

  createPasskey: async (data: CreatePasskeyRequest): Promise<Passkey> => {
    const response = await apiClient.post<{ message: string; passkey: Passkey }>('/passkeys', data)
    return response.data.passkey
  },

  deletePasskey: async (passkeyId: string): Promise<void> => {
    await apiClient.delete(`/passkeys/${passkeyId}`)
  },
}

