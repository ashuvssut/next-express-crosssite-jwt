import "dotenv/config";

import fs from "fs";
import https from "https";
import app from "./app.js";

import { API_URL, COOKIE_SAMESITE_POLICY } from "./config.js";

const key = fs.readFileSync("./certs/backend-key.pem");
const cert = fs.readFileSync("./certs/backend-cert.pem");

const server = https.createServer({ key, cert }, app);

const { port, hostname } = new URL(API_URL);

server.listen(port, hostname, () => {
  console.log(`🚀 Express API running at ${API_URL}`);
  console.log(`   - SameSite Policy: ${sameSitePolicyMessage()}\n`);
});

const sameSitePolicyMessage = () => {
  if (COOKIE_SAMESITE_POLICY === "strict") {
    return "Strict — CSRF tokens not required.";
  } else if (COOKIE_SAMESITE_POLICY === "lax") {
    return "Lax — Frontend must send back CSRF tokens for state-changing HTTP requests.";
  } else {
    throw new Error(`Unsupported SameSite policy: ${COOKIE_SAMESITE_POLICY}`);
  }
};
