import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import helmet from "helmet";
import compression from "compression";
import rateLimit from "express-rate-limit";
import jwt from "jsonwebtoken";
import { requireCsrf, issueCsrf } from "./csrf.js";
import {
  APP_URL,
  AUTH_COOKIE_KEY,
  COOKIE_SAMESITE,
  CSRF_COOKIE_KEY,
  CSRF_REQUIRED,
  IS_PROD,
  JWT_EXP_MS,
  JWT_SECRET,
} from "./config.js";
import morgan from "morgan";

const app = express();

app.set("trust proxy", 1);
app.use(helmet({ contentSecurityPolicy: false }));
app.use(compression());
app.use(cookieParser());
app.use(express.json());
app.use(cors({ origin: APP_URL, credentials: true }));
app.use(rateLimit({ windowMs: 60_000, max: 120 }));
app.use(requireCsrf);

// ====== LOGGING ======
app.use(morgan("dev"));
// morgan.token("body", (req) => JSON.stringify(req.body));
// app.use(
//   morgan(":method :url :status :res[content-length] - :response-time ms :body")
// );

// ====== AUTH + ROUTES ======
function isAuth(req, res, next) {
  const token = req.cookies[AUTH_COOKIE_KEY];
  if (!token) return res.status(401).json({ loggedIn: false });

  try {
    req.auth = jwt.verify(token, JWT_SECRET);
    next();
  } catch {
    return res.status(401).json({ loggedIn: false, reason: "invalid/expired" });
  }
}

function hasRole(role) {
  return (req, res, next) => {
    if (!req.auth) return res.status(401).json({ error: "Unauthorized" });
    if (req.auth.role !== role)
      return res.status(403).json({ error: "Forbidden" });
    next();
  };
}

app.post("/login", (req, res) => {
  const userId = "u_123";
  const role = req.body?.role === "admin" ? "admin" : "user";

  const token = jwt.sign({ userId, role }, JWT_SECRET, {
    expiresIn: JWT_EXP_MS / 1000,
  });
  res.cookie(AUTH_COOKIE_KEY, token, {
    httpOnly: true,
    secure: IS_PROD,
    sameSite: COOKIE_SAMESITE,
    maxAge: JWT_EXP_MS,
    path: "/",
  });

  const csrf = issueCsrf(res);
  console.log("CSRF token cookie issued:", csrf);
  res.json({ success: true, userId, role });
});

app.post("/logout", isAuth, (req, res) => {
  res.clearCookie(AUTH_COOKIE_KEY, {
    httpOnly: true,
    secure: IS_PROD,
    sameSite: COOKIE_SAMESITE,
    path: "/",
  });
  if (CSRF_REQUIRED) {
    res.clearCookie(CSRF_COOKIE_KEY, {
      httpOnly: false,
      secure: IS_PROD,
      sameSite: COOKIE_SAMESITE,
      maxAge: JWT_EXP_MS,
      path: "/",
    });
  }
  res.json({ success: true, message: "Logged out" });
});

app.get("/public", (req, res) => res.json({ public: true }));
app.get("/me", isAuth, (req, res) => res.json({ loggedIn: true, ...req.auth }));
app.get("/admin", isAuth, hasRole("admin"), (req, res) =>
  res.json({ admin: true, message: "Welcome, admin!" })
);

export default app;
