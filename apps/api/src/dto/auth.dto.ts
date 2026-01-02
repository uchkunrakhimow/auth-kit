import { z } from "zod";

export const loginDto = z.object({
  body: z.object({
    email: z.email("Invalid email format"),
    password: z.string().min(1, "Password is required"),
  }),
});

export const registerDto = z.object({
  body: z.object({
    name: z.string().min(1, "Name is required"),
    email: z.email("Invalid email format"),
    password: z.string().min(8, "Password must be at least 8 characters"),
    profilePic: z.url("Invalid URL format").optional().or(z.literal("")),
  }),
});

export const logoutDto = z.object({
  body: z.object({}),
});

export const updateProfileDto = z.object({
  body: z.object({
    name: z.string().min(1, "Name is required").optional(),
    picture: z.string().url("Invalid URL format").optional().or(z.literal("")),
    role: z.enum(["USER", "ADMIN", "VIEWER", "EDITOR"]).optional(),
  }),
});

export type LoginDto = z.infer<typeof loginDto>;
export type RegisterDto = z.infer<typeof registerDto>;
export type LogoutDto = z.infer<typeof logoutDto>;
export type UpdateProfileDto = z.infer<typeof updateProfileDto>;
