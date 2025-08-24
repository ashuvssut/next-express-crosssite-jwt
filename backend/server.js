const express = require("express");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const crypto = require("crypto");

const app = express();
app.use(cookieParser());
app.use(express.json());
app.use(
  cors({
    origin: "http://localhost:3000", // explicitly allow Next.js app
    credentials: true,
  })
);

// Fake login endpoint
app.post("/login", (req, res) => {
  // Generate a random secure token
  const token = crypto.randomBytes(32).toString("hex") + Date.now();

  res.cookie("accessToken", token, {
    httpOnly: true, // prevent JS access
    secure: true, // cookie only over HTTPS
    sameSite: "strict", // prevent CSRF
    maxAge: 1000 * 60 * 60, // 1 hour expiry
    path: "/", // valid for all routes
  });

  res.json({ success: true, message: "Secure cookie set!" });
});

// Protected endpoint
app.get("/me", (req, res) => {
  const token = req.cookies.accessToken;
  if (token) {
    console.log("Token found: ", token);
    res.json({ loggedIn: true, token });
  } else {
    console.log("Unauthorized. No token: ", token.toString());
    res.status(401).json({ loggedIn: false });
  }
});

app.listen(4000, () => console.log("Backend running on http://localhost:4000"));
