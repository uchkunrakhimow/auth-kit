import axios from 'axios'
import { API_BASE_URL } from '@/lib/config'

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
})

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      if (!window.location.pathname.startsWith('/auth/login')) {
        window.location.href = '/auth/login'
      }
    }
    return Promise.reject(error)
  },
)
