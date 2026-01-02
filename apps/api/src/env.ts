import { z } from "zod";

const envSchema = z.object({
  PORT: z.string().default("3000"),
  DATABASE_URL: z.string(),
  GOOGLE_CLIENT_ID: z.string().optional(),
  GOOGLE_CLIENT_SECRET: z.string().optional(),
  CALLBACK_URL: z.string().optional(),
  ORIGIN_URL: z.string().default("http://localhost:5173"),
  SESSION_SECRET: z.string().default("change-me-in-production"),
});

export const env = envSchema.parse(process.env);
