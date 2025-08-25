import express, { ErrorRequestHandler } from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import helmet from "helmet";
import compression from "compression";
import rateLimit from "express-rate-limit";
import jwt from "jsonwebtoken";
import {
  requireCsrf,
  issueCsrf,
  isAuth,
  hasRole,
  issueJwtCookie,
} from "./helpers.js";
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
/**
 * CORS configuration:
 * - Allows ONLY our frontend (`APP_URL`) to make cross-origin requests.
 * - `credentials: true` ensures cookies (JWT + CSRF) are sent automatically on allowed origins (i.e. `APP_URL`).
 * - This does NOT bypass CSRF protections: cross-site origins cannot read our cookies or send `x-csrf-token`
 *   because of our `sameSite` + `httpOnly` settings on cookies, so double-submit CSRF remains effective.
 */
app.use(cors({ origin: APP_URL, credentials: true }));

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
  issueJwtCookie(res, token);

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
    httpOnly: true, // only accessible by the server
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
const errorHandler: ErrorRequestHandler = (err, req, res, next) => {
  console.error("Server error:", err);
  res
    .status(500)
    .json({ message: "An unexpected error occurred. Please try again" });
};
app.use(errorHandler);

export default app;
