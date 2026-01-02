import { useEffect, useState } from 'react'
import { Link } from '@tanstack/react-router'
import { z } from 'zod'
import { toast } from 'sonner'
import { CheckCircle2, XCircle } from 'lucide-react'

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
} from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { PasswordField } from '@/components/password-field'
import { useRegister } from '@/hooks/queries/use-auth'
import { AuthFooter } from '@/components/auth-footer'

const registerSchema = z
  .object({
    name: z.string().min(1, 'Name is required'),
    email: z.email('Invalid email format'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    confirmPassword: z.string(),
    profilePic: z.url('Invalid URL format').optional().or(z.literal('')),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  })

type RegisterFormData = z.infer<typeof registerSchema>

export function RegisterForm({
  className,
  ...props
}: React.ComponentProps<'div'>) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [profilePic, setProfilePic] = useState('')
  const [errors, setErrors] = useState<
    Partial<Record<keyof RegisterFormData, string>>
  >({})
  const [confirmPasswordStatus, setConfirmPasswordStatus] = useState<
    'idle' | 'matching' | 'not-matching'
  >('idle')
  const registerMutation = useRegister()

  // Real-time validation for confirm password
  useEffect(() => {
    if (confirmPassword.length === 0) {
      setConfirmPasswordStatus('idle')
      if (errors.confirmPassword) {
        setErrors((prev) => ({ ...prev, confirmPassword: undefined }))
      }
      return
    }

    if (password === confirmPassword) {
      setConfirmPasswordStatus('matching')
      if (errors.confirmPassword) {
        setErrors((prev) => ({ ...prev, confirmPassword: undefined }))
      }
    } else {
      setConfirmPasswordStatus('not-matching')
      if (password.length > 0) {
        setErrors((prev) => ({
          ...prev,
          confirmPassword: "Passwords don't match",
        }))
      }
    }
  }, [password, confirmPassword, errors.confirmPassword])

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setErrors({})

    const formData = {
      name,
      email,
      password,
      confirmPassword,
      profilePic: profilePic.trim() || undefined,
    }

    const result = registerSchema.safeParse(formData)
    if (!result.success) {
      result.error.issues.forEach((error) => {
        setErrors((prev) => ({
          ...prev,
          [error.path[0] as keyof RegisterFormData]: error.message,
        }))
      })
      // Show first error as toast
      if (result.error.issues.length > 0) {
        toast.error(result.error.issues[0]?.message || 'Validation failed')
      }
      return
    }

    registerMutation.mutate(
      {
        name: result.data.name,
        email: result.data.email,
        password: result.data.password,
        profilePic: result.data.profilePic,
      },
      {
        onError: (error: unknown) => {
          const message =
            error instanceof Error ? error.message : 'Registration failed'
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
            <CardTitle className="text-xl">Create your account</CardTitle>
            <CardDescription>
              Enter your email below to create your account
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit}>
              <FieldGroup className="gap-3">
                <Field className="gap-2">
                  <FieldLabel htmlFor="name">Full Name</FieldLabel>
                  <Input
                    id="name"
                    type="text"
                    placeholder="John Doe"
                    value={name}
                    onChange={(e) => {
                      setName(e.target.value)
                      if (errors.name) setErrors({ ...errors, name: undefined })
                    }}
                    required
                    disabled={registerMutation.isPending}
                    aria-invalid={!!errors.name}
                  />
                  {errors.name && (
                    <FieldDescription className="text-destructive text-xs mt-0.5">
                      {errors.name}
                    </FieldDescription>
                  )}
                </Field>
                <Field className="gap-2">
                  <FieldLabel htmlFor="email">Email</FieldLabel>
                  <Input
                    id="email"
                    type="email"
                    placeholder="m@example.com"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value)
                      if (errors.email)
                        setErrors({ ...errors, email: undefined })
                    }}
                    required
                    disabled={registerMutation.isPending}
                    aria-invalid={!!errors.email}
                  />
                  {errors.email && (
                    <FieldDescription className="text-destructive text-xs mt-0.5">
                      {errors.email}
                    </FieldDescription>
                  )}
                </Field>
                <Field className="gap-2">
                  <div className="grid grid-cols-2 gap-3">
                    <Field className="gap-2">
                      <FieldLabel htmlFor="password">Password</FieldLabel>
                      <PasswordField
                        id="password"
                        value={password}
                        onChange={(e) => {
                          setPassword(e.target.value)
                          if (errors.password)
                            setErrors({ ...errors, password: undefined })
                        }}
                        required
                        disabled={registerMutation.isPending}
                        aria-invalid={!!errors.password}
                      />
                      {errors.password && (
                        <FieldDescription className="text-destructive text-xs mt-0.5">
                          {errors.password}
                        </FieldDescription>
                      )}
                    </Field>
                    <Field className="gap-2">
                      <FieldLabel htmlFor="confirm-password">
                        Confirm Password
                      </FieldLabel>
                      <div className="relative">
                        <PasswordField
                          id="confirm-password"
                          value={confirmPassword}
                          onChange={(e) => {
                            setConfirmPassword(e.target.value)
                          }}
                          required
                          disabled={registerMutation.isPending}
                          aria-invalid={
                            confirmPasswordStatus === 'not-matching'
                          }
                          className={cn(
                            confirmPasswordStatus === 'matching' &&
                              'pr-16 border-green-500 dark:border-green-600 focus-visible:border-green-500 dark:focus-visible:border-green-600',
                            confirmPasswordStatus === 'not-matching' &&
                              'pr-16 border-destructive',
                          )}
                        />
                        {confirmPasswordStatus === 'matching' && (
                          <CheckCircle2 className="absolute right-9 top-1/2 -translate-y-1/2 size-5 text-green-500 dark:text-green-600 pointer-events-none z-10" />
                        )}
                        {confirmPasswordStatus === 'not-matching' && (
                          <XCircle className="absolute right-9 top-1/2 -translate-y-1/2 size-5 text-destructive pointer-events-none z-10" />
                        )}
                      </div>
                      {confirmPasswordStatus === 'matching' && (
                        <FieldDescription className="text-green-600 dark:text-green-500 text-xs mt-0.5 flex items-center gap-1">
                          <CheckCircle2 className="size-3.5" />
                          Passwords match
                        </FieldDescription>
                      )}
                      {confirmPasswordStatus === 'not-matching' && (
                        <FieldDescription className="text-destructive text-xs mt-0.5 flex items-center gap-1">
                          <XCircle className="size-3.5" />
                          {errors.confirmPassword || "Passwords don't match"}
                        </FieldDescription>
                      )}
                    </Field>
                  </div>
                  <FieldDescription className="text-xs">
                    Must be at least 8 characters long.
                  </FieldDescription>
                </Field>
                <Field className="gap-2">
                  <FieldLabel htmlFor="profilePic">
                    Profile Picture URL (Optional)
                  </FieldLabel>
                  <Input
                    id="profilePic"
                    type="url"
                    placeholder="https://example.com/avatar.jpg"
                    value={profilePic}
                    onChange={(e) => {
                      setProfilePic(e.target.value)
                      if (errors.profilePic)
                        setErrors({ ...errors, profilePic: undefined })
                    }}
                    disabled={registerMutation.isPending}
                    aria-invalid={!!errors.profilePic}
                  />
                  {errors.profilePic && (
                    <FieldDescription className="text-destructive text-xs mt-0.5">
                      {errors.profilePic}
                    </FieldDescription>
                  )}
                  <FieldDescription className="text-xs">
                    Optional: Provide a URL to your profile picture
                  </FieldDescription>
                </Field>
                <Field className="gap-2">
                  <Button type="submit" disabled={registerMutation.isPending}>
                    {registerMutation.isPending
                      ? 'Creating account...'
                      : 'Create Account'}
                  </Button>
                  <FieldDescription className="text-center text-xs">
                    Already have an account?{' '}
                    <Link to="/auth/login">Sign in</Link>
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
