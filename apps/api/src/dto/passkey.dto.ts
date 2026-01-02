import { z } from "zod";

export const createPasskeyDto = z.object({
  body: z.object({
    credentialId: z.string().min(1, "Credential ID is required"),
    publicKey: z.string().min(1, "Public key is required"),
    deviceName: z.string().optional(),
  }),
});

export const deletePasskeyDto = z.object({
  params: z.object({
    passkeyId: z.uuid("Invalid passkey ID format"),
  }),
});

export type CreatePasskeyDto = z.infer<typeof createPasskeyDto>;
export type DeletePasskeyDto = z.infer<typeof deletePasskeyDto>;
