import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import helmet from "helmet";
import compression from "compression";
import rateLimit from "express-rate-limit";
import jwt from "jsonwebtoken";
import { requireCsrf, issueCsrf, isAuth, hasRole } from "./helpers.js";
import {
  APP_URL,
  AUTH_COOKIE_KEY,
  COOKIE_SAMESITE_POLICY,
  CSRF_COOKIE_KEY,
  CSRF_REQUIRED,
  IS_PROD,
  JWT_EXP_MS,
  JWT_SECRET,
} from "./config.js";
import morgan from "morgan";

const app = express();

// ====== MIDDLEWARE ======
app.set("trust proxy", 1); // We use Next.js API rewrites to proxy requests
app.use(helmet({ contentSecurityPolicy: false }));
app.use(compression());
app.use(cookieParser());
app.use(express.json());
app.use(cors({ origin: APP_URL, credentials: true }));
app.use(rateLimit({ windowMs: 60_000, max: 120 }));
app.use((req, res, next) => {
  // Apply CSRF protection only to routes other than /login and /logout
  if (["/login", "/logout"].includes(req.path)) return next();
  requireCsrf(req, res, next);
});

// ====== LOGGING ======
app.use(morgan("dev"));
// morgan.token("body", (req) => JSON.stringify(req.body));
// app.use(morgan(":method :url :status :res[content-length] - :response-time ms :body"));

// ====== ROUTES ======
app.post("/login", (req, res) => {
  const userId = "u_123";
  const role = req.body?.role === "admin" ? "admin" : "user";

  const token = jwt.sign({ userId, role }, JWT_SECRET, {
    expiresIn: JWT_EXP_MS / 1000,
  });

  res.cookie(AUTH_COOKIE_KEY, token, {
    httpOnly: true,
    secure: IS_PROD,
    sameSite: COOKIE_SAMESITE_POLICY,
    maxAge: JWT_EXP_MS,
    path: "/",
  });

  const csrf = issueCsrf(res);
  console.log("CSRF token cookie issued:", csrf);

  res.json({
    success: true,
    message: "Login successful",
    userId,
    role,
  });
});

app.post("/logout", isAuth, (req, res) => {
  res.clearCookie(AUTH_COOKIE_KEY, {
    httpOnly: true,
    secure: IS_PROD,
    sameSite: COOKIE_SAMESITE_POLICY,
    path: "/",
  });

  if (CSRF_REQUIRED) {
    res.clearCookie(CSRF_COOKIE_KEY, {
      httpOnly: false,
      secure: IS_PROD,
      sameSite: COOKIE_SAMESITE_POLICY,
      maxAge: JWT_EXP_MS,
      path: "/",
    });
  }

  res.json({ success: true, message: "Logged out successfully" });
});

app.get("/public", (req, res) =>
  res.json({ public: true, message: "This is a public endpoint" })
);

app.get("/me", isAuth, (req, res) =>
  res.json({
    loggedIn: true,
    message: "Fetched user info successfully",
    ...req.auth,
  })
);

app.get("/admin", isAuth, hasRole("admin"), (req, res) =>
  res.json({ admin: true, message: "Welcome, admin!" })
);

// ====== 404 HANDLER ======
app.use((req, res) => {
  res.status(404).json({ message: "The requested endpoint does not exist" });
});

// ====== ERROR HANDLER ======
app.use((err, req, res) => {
  console.error("Server error:", err);
  res
    .status(500)
    .json({ message: "An unexpected error occurred. Please try again" });
});

export default app;
