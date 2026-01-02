import { createFileRoute, redirect } from '@tanstack/react-router'
import { useAuthStore } from '@/hooks/use-auth'
import { Role } from '@/types/auth'

export const Route = createFileRoute('/_authenticated/admin')({
  beforeLoad: () => {
    const user = useAuthStore.getState().user
    if (user?.role !== Role.ADMIN) {
      throw redirect({
        to: '/dashboard',
        search: {
          error: 'Unauthorized: Admin access required',
        },
      })
    }
  },
})
