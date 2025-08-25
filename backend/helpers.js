import {
  COOKIE_SAMESITE_POLICY,
  CSRF_COOKIE_KEY,
  CSRF_REQUIRED,
  IS_PROD,
  JWT_EXP_MS,
  AUTH_COOKIE_KEY,
  JWT_SECRET,
} from "./config.js";
import jwt from "jsonwebtoken";
import crypto from "crypto";

export function issueCsrf(res) {
  if (!CSRF_REQUIRED) return null;

  const csrf = crypto.randomBytes(32).toString("hex");
  res.cookie(CSRF_COOKIE_KEY, csrf, {
    /**
     * httpOnly: false
     * - This cookie must be readable by frontend JS so that it can be sent back
     *   in the `x-csrf-token` header (double-submit pattern)..
     *
     * * Important note:
     * - Our server CORS policy only allows `APP_URL` as origin.
     *   So, any other evil cross-site origin cannot set this CSRF cookie in the browser.
     * - Even if an attacker tries a cross-site fetch/XHR with `x-csrf-token` header,
     *   `requireCsrf()` will reject it because the CSRF cookie is not set/missing.
     * - Conclusion: only your frontend at `APP_URL` can successfully receive & read this
     *   CSRF cookie and send back this cookie in the `x-csrf-token` header
     */
    httpOnly: false,
    secure: IS_PROD, // sent only over HTTPS
    /**
     * sameSite: "strict" ensures this CSRF cookie is only sent automatically on requests
     * originating from our own site (same-site), unlike how `AUTH_COOKIE_KEY` can be
     * sent automatically when:-
     * - `AUTH_COOKIE_KEY`'s sameSite is "none" which allows the `AUTH_COOKIE_KEY` cookie to
     * be sent from evil cross-site's top-level POST navigations like form submissions. So, This is
     * harmful without CSRF protection.
     * - `AUTH_COOKIE_KEY`'s sameSite is "lax" which allows the `AUTH_COOKIE_KEY` cookie to
     * be sent from evil cross-site's top-level GET navigations like top-level navigations. But,
     * this is not harmful in nature as GET is not an unsafe method.
     *
     * So basically sameSite: "strict" ensures:
     * - Prevents the browser from automatically including this cookie in cross-site requests
     *   - e.g., any cross-site request like top-level POST navigations initiated from evil.com
     * - Browser's SOP (Same-Origin Policy) prevents cross-sites from setting or reading this cookie in the browser.
     * - This way, combined with `httpOnly: false`, only our frontend (`APP_URL` origin) can read
     *   this cookie and send back the CSRF token to the server in the `x-csrf-token` header.
     */
    sameSite: "strict",
    maxAge: JWT_EXP_MS, // Same expiry as JWT
    path: "/",
  });

  return csrf;
}

export function requireCsrf(req, res, next) {
  if (!CSRF_REQUIRED) return next();
  if (!/^(POST|PUT|PATCH|DELETE)$/i.test(req.method)) return next();

  const cookieVal = req.cookies[CSRF_COOKIE_KEY];
  const headerVal = req.get("x-csrf-token");
  if (!cookieVal || !headerVal || cookieVal !== headerVal) {
    return res.status(403).json({ error: "CSRF validation failed" });
  }
  next();
}

export const issueJwtCookie = (res, token) => {
  res.cookie(AUTH_COOKIE_KEY, token, {
    httpOnly: true, // Not accessible by the browser JS
    secure: IS_PROD, // only sent over HTTPS
    /**
     * sameSite behavior:
     * "strict" - cookie automatically sent only on same-site requests; and prevents
     *            ALL top-level navigations from other sites from sending it
     * "lax"    - cookie automatically sent on same-site requests and top-level GET navigations
     *            from cross-site, but not unsafe methods (POST/PUT/DELETE) from cross-site.
     *            So CSRF attacks on unsafe methods are still blocked.
     * "none"   - cookie sent on any requests
     */
    sameSite: COOKIE_SAMESITE_POLICY,
    maxAge: JWT_EXP_MS,
    path: "/",
  });
};

export function isAuth(req, res, next) {
  const token = req.cookies[AUTH_COOKIE_KEY];
  if (!token) {
    return res.status(401).json({
      loggedIn: false,
      message: "You must be logged in to perform this action",
    });
  }

  try {
    req.auth = jwt.verify(token, JWT_SECRET);
    next();
  } catch {
    return res.status(401).json({
      loggedIn: false,
      message: "Your session has expired or is invalid. Please login again",
    });
  }
}

export function hasRole(role) {
  return (req, res, next) => {
    if (!req.auth) {
      return res.status(401).json({ message: "Unauthorized access" });
    }
    if (req.auth.role !== role) {
      return res.status(403).json({
        message: "You do not have permission to access this resource",
      });
    }
    next();
  };
}
