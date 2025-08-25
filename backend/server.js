import "dotenv/config";

import fs from "fs";
import https from "https";
import app from "./app.js";
import { API_URL } from "./config.js";

const key = fs.readFileSync("./certs/backend-key.pem");
const cert = fs.readFileSync("./certs/backend-cert.pem");

const server = https.createServer({ key, cert }, app);

const { port, hostname } = new URL(API_URL);
server.listen(port, hostname, () => {
  console.log(`🚀 Express API running at ${API_URL}\n`);
});
