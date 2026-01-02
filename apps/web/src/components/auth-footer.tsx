import { FieldDescription } from '@/components/ui/field'

export function AuthFooter() {
  return (
    <FieldDescription className="px-6 text-center text-xs">
      By clicking continue, you agree to our{' '}
      <a href="#">Terms of Service</a> and <a href="#">Privacy Policy</a>.
    </FieldDescription>
  )
}

