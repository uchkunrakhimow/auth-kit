import { z } from "zod";
import { Role } from "../types/enums";

const roleEnum = z.nativeEnum(Role);

export const updateUserRoleDto = z.object({
  params: z.object({
    userId: z.uuid("Invalid user ID format"),
  }),
  body: z.object({
    role: roleEnum,
  }),
});

export type UpdateUserRoleDto = z.infer<typeof updateUserRoleDto>;
