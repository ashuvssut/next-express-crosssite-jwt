// ====== CONFIG ======
const NODE_ENV = process.env.NODE_ENV || "development";
export const IS_PROD = NODE_ENV === "production";
export const APP_ORIGIN = process.env.APP_ORIGIN || "http://localhost:3000";
export const COOKIE_NAME = process.env.COOKIE_NAME || "accessToken";
export const CSRF_COOKIE = process.env.CSRF_COOKIE || "csrfToken";
export const JWT_SECRET = process.env.JWT_SECRET || "super-secret";
export const JWT_EXP_MS = 1000 * 60 * 60; // 1h
export const COOKIE_SAMESITE = process.env.COOKIE_SAMESITE || "strict"; // 'strict' or 'lax'

// CSRF required only for Lax (or None) SameSite
export const CSRF_REQUIRED = COOKIE_SAMESITE !== "strict";
