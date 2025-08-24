import {
  COOKIE_SAMESITE,
  CSRF_COOKIE,
  CSRF_REQUIRED,
  IS_PROD,
  JWT_EXP_MS,
} from "./config.js";

export function issueCsrf(res) {
  if (!CSRF_REQUIRED) return null;

  const csrf = crypto.randomBytes(32).toString("hex");
  res.cookie(CSRF_COOKIE, csrf, {
    httpOnly: false,
    secure: IS_PROD,
    sameSite: COOKIE_SAMESITE,
    maxAge: JWT_EXP_MS,
    path: "/",
  });
  return csrf;
}

export function requireCsrf(req, res, next) {
  if (!CSRF_REQUIRED) return next();
  if (!/^(POST|PUT|PATCH|DELETE)$/i.test(req.method)) return next();

  const cookieVal = req.cookies[CSRF_COOKIE];
  const headerVal = req.get("x-csrf-token");
  if (!cookieVal || !headerVal || cookieVal !== headerVal) {
    return res.status(403).json({ error: "CSRF validation failed" });
  }
  next();
}
