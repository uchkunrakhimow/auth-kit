import { createFileRoute } from '@tanstack/react-router'
import { z } from 'zod'

import { SignIn } from '@/features/auth/login'

const searchSchema = z.object({
  redirect: z.string().optional(),
})

export const Route = createFileRoute('/auth/login')({
  component: SignIn,
  validateSearch: searchSchema,
})
