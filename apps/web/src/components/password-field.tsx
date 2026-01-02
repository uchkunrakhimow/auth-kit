import { useState } from 'react'
import { FiEye, FiEyeOff } from 'react-icons/fi'

import { cn } from '@/lib/utils'
import { Input } from '@/components/ui/input'

export function PasswordField({
  id,
  className,
  ...props
}: React.ComponentProps<'input'> & { id: string }) {
  const [showPassword, setShowPassword] = useState(false)
  const inputType = showPassword ? 'text' : 'password'
  const Icon = showPassword ? FiEyeOff : FiEye

  return (
    <div className="relative">
      <Input
        id={id}
        type={inputType}
        required
        className={cn('pr-10', className)}
        {...props}
      />
      <button
        type="button"
        onClick={() => setShowPassword(!showPassword)}
        className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground"
        aria-label={showPassword ? 'Hide password' : 'Show password'}
      >
        <Icon />
      </button>
    </div>
  )
}
