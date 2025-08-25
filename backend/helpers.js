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
    httpOnly: false,
    secure: IS_PROD,
    sameSite: COOKIE_SAMESITE_POLICY,
    maxAge: JWT_EXP_MS,
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
