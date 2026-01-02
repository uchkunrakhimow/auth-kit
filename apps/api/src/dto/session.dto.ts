import { z } from "zod";

export const logoutDeviceDto = z.object({
  params: z.object({
    sessionId: z.uuid("Invalid session ID format"),
  }),
});

export type LogoutDeviceDto = z.infer<typeof logoutDeviceDto>;
