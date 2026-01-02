import { useState } from 'react'
import { Link } from '@tanstack/react-router'
import { FaApple } from 'react-icons/fa6'
import { FcGoogle } from 'react-icons/fc'

import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldSeparator,
} from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { authApi } from '@/api/auth'
import { useLogin } from '@/hooks/queries/use-auth'
import { PasswordField } from '@/components/password-field'
import { AuthFooter } from '@/components/auth-footer'

export function SignIn({ className, ...props }: React.ComponentProps<'div'>) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const loginMutation = useLogin()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!email || !password) {
      toast.error('Please fill in all fields')
      return
    }

    loginMutation.mutate(
      { email, password },
      {
        onError: (error: unknown) => {
          const message =
            error instanceof Error ? error.message : 'Login failed'
          toast.error(message)
        },
      },
    )
  }

  return (
    <div
      className={cn('min-h-screen flex items-center justify-center', className)}
      {...props}
    >
      <div className="w-full max-w-md flex flex-col gap-6">
        <Card>
          <CardHeader className="text-center gap-1.5">
            <CardTitle className="text-xl">Welcome back</CardTitle>
            <CardDescription>
              Login with your Apple or Google account
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit}>
              <FieldGroup className="gap-3">
                <Field className="gap-2 flex-row">
                  <Button
                    variant="outline"
                    type="button"
                    disabled
                    className="flex-1"
                  >
                    <FaApple />
                    Login with Apple
                  </Button>
                  <Button
                    variant="outline"
                    type="button"
                    onClick={() => authApi.initiateGoogleAuth()}
                    className="flex-1"
                  >
                    <FcGoogle />
                    Login with Google
                  </Button>
                </Field>
                <FieldSeparator className="*:data-[slot=field-separator-content]:bg-card">
                  Or continue with
                </FieldSeparator>
                <Field className="gap-2">
                  <FieldLabel htmlFor="email">Email</FieldLabel>
                  <Input
                    id="email"
                    type="email"
                    placeholder="m@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={loginMutation.isPending}
                  />
                </Field>
                <Field className="gap-2">
                  <div className="flex items-center">
                    <FieldLabel htmlFor="password">Password</FieldLabel>
                    <a
                      href="#"
                      className="ml-auto text-xs underline-offset-4 hover:underline"
                    >
                      Forgot your password?
                    </a>
                  </div>
                  <PasswordField
                    id="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={loginMutation.isPending}
                  />
                </Field>
                <Field className="gap-2">
                  <Button type="submit" disabled={loginMutation.isPending}>
                    {loginMutation.isPending ? 'Logging in...' : 'Login'}
                  </Button>
                  <FieldDescription className="text-center text-xs">
                    Don&apos;t have an account?{' '}
                    <Link to="/auth/register">Sign up</Link>
                  </FieldDescription>
                </Field>
              </FieldGroup>
            </form>
          </CardContent>
        </Card>
        <AuthFooter />
      </div>
    </div>
  )
}
