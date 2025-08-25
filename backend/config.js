const NODE_ENV = process.env.NODE_ENV || "development";
export const IS_PROD = NODE_ENV === "production";

/** Webapp client URL */
export const APP_URL = process.env.APP_URL;
/** Express API URL */
export const API_URL = process.env.API_URL;

export const AUTH_COOKIE_KEY = "accessToken";
export const CSRF_COOKIE_KEY = "csrfToken";

export const JWT_EXP_MS = 1000 * 60 * 60; // 1h
export const JWT_SECRET = process.env.JWT_SECRET;

// export const COOKIE_SAMESITE_POLICY = "strict";
export const COOKIE_SAMESITE_POLICY = "lax";
export const CSRF_REQUIRED = COOKIE_SAMESITE_POLICY !== "strict";
