import { createFileRoute } from '@tanstack/react-router'
import { RegisterForm } from '@/features/auth/register'

export const Route = createFileRoute('/auth/register')({
  component: RouteComponent,
})

function RouteComponent() {
  return <RegisterForm />
}
