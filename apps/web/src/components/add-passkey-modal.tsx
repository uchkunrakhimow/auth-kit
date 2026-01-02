import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { passkeysApi } from '@/api/passkeys'
import { IconLoader2 } from '@tabler/icons-react'
import { useAuth } from '@/hooks/use-auth'

interface AddPasskeyModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

// Helper function to convert ArrayBuffer to base64url
function arrayBufferToBase64Url(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer)
  let binary = ''
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i])
  }
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '')
}


export function AddPasskeyModal({ open, onOpenChange }: AddPasskeyModalProps) {
  const [deviceName, setDeviceName] = useState('')
  const [isCreating, setIsCreating] = useState(false)
  const queryClient = useQueryClient()
  const { user } = useAuth()

  const createPasskeyMutation = useMutation({
    mutationFn: passkeysApi.createPasskey,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['passkeys'] })
      toast.success('Passkey created successfully')
      setDeviceName('')
      onOpenChange(false)
    },
    onError: (error: unknown) => {
      const message = error instanceof Error ? error.message : 'Failed to create passkey'
      toast.error(message)
    },
    onSettled: () => {
      setIsCreating(false)
    },
  })

  const handleCreatePasskey = async () => {
    if (!user) {
      toast.error('You must be logged in to create a passkey')
      return
    }

    if (!navigator.credentials || !navigator.credentials.create) {
      toast.error('WebAuthn is not supported in this browser')
      return
    }

    setIsCreating(true)

    try {
      // Generate a random challenge
      const challenge = new Uint8Array(32)
      crypto.getRandomValues(challenge)

      // Convert user email to ArrayBuffer for WebAuthn user.id
      const userEmail = user?.email || 'user@example.com'
      const userIdBuffer = new TextEncoder().encode(userEmail.toLowerCase())

      // Create WebAuthn credential
      const publicKeyCredentialCreationOptions: PublicKeyCredentialCreationOptions = {
        challenge: challenge.buffer,
        rp: {
          name: 'OAuth Mono',
          id: window.location.hostname,
        },
        user: {
          id: userIdBuffer,
          name: userEmail,
          displayName: user?.name || userEmail,
        },
        pubKeyCredParams: [
          { alg: -7, type: 'public-key' }, // ES256
          { alg: -257, type: 'public-key' }, // RS256
        ],
        authenticatorSelection: {
          authenticatorAttachment: 'platform',
          userVerification: 'preferred',
        },
        timeout: 60000,
        attestation: 'direct',
      }

      const credential = (await navigator.credentials.create({
        publicKey: publicKeyCredentialCreationOptions,
      })) as PublicKeyCredential | null

      if (!credential) {
        throw new Error('Failed to create passkey')
      }

      const response = credential.response as AuthenticatorAttestationResponse

      // Extract credential ID
      const credentialId = arrayBufferToBase64Url(credential.rawId)

      // Extract public key from attestation object
      const attestationObject = new Uint8Array(response.attestationObject)
      const publicKey = arrayBufferToBase64Url(attestationObject.buffer)

      // Send to backend
      await createPasskeyMutation.mutateAsync({
        credentialId,
        publicKey,
        deviceName: deviceName.trim() || undefined,
      })
    } catch (error) {
      if (error instanceof Error) {
        if (error.name === 'NotAllowedError') {
          toast.error('Passkey creation was cancelled or timed out')
        } else if (error.name === 'NotSupportedError') {
          toast.error('Passkeys are not supported on this device')
        } else {
          toast.error(error.message || 'Failed to create passkey')
        }
      } else {
        toast.error('Failed to create passkey')
      }
      setIsCreating(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add New Passkey</DialogTitle>
          <DialogDescription>
            Create a new passkey for passwordless authentication. You'll be prompted to use your
            device's biometric authentication or security key.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="device-name">Device Name (Optional)</Label>
            <Input
              id="device-name"
              placeholder="e.g., My iPhone, Work Laptop"
              value={deviceName}
              onChange={(e) => setDeviceName(e.target.value)}
              disabled={isCreating}
            />
            <p className="text-sm text-muted-foreground">
              Give your passkey a name to help you identify it later.
            </p>
          </div>
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isCreating}
          >
            Cancel
          </Button>
          <Button onClick={handleCreatePasskey} disabled={isCreating}>
            {isCreating ? (
              <>
                <IconLoader2 className="h-4 w-4 mr-2 animate-spin" />
                Creating...
              </>
            ) : (
              'Create Passkey'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

