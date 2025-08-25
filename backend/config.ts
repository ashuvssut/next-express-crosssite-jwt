import { z } from "zod";

// Environment variables schema
const envSchema = z.object({
  NODE_ENV: z.enum(["development", "production"]).default("development"),
  APP_URL: z.url(),
  API_URL: z.url(),
  JWT_SECRET: z.string().min(1, "JWT_SECRET must be set"),
  COOKIE_SAMESITE_POLICY: z.enum(["strict", "lax", "none"]).default("lax"),
});

// Parse and validate process.env
const env = envSchema.parse(process.env);

type Env = z.infer<typeof envSchema>;
export type EnvKeys = keyof Env;

export const NODE_ENV = env.NODE_ENV;
export const IS_PROD = NODE_ENV === "production";

export const APP_URL = env.APP_URL;
export const API_URL = env.API_URL;

export const AUTH_COOKIE_KEY = "accessToken";
export const CSRF_COOKIE_KEY = "csrfToken";

export const JWT_EXP_MS = 1000 * 60 * 60; // 1 hour
export const JWT_SECRET = env.JWT_SECRET;

export const COOKIE_SAMESITE_POLICY =
  env.COOKIE_SAMESITE_POLICY as Env["COOKIE_SAMESITE_POLICY"];
export const CSRF_REQUIRED = COOKIE_SAMESITE_POLICY !== "strict";
