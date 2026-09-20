require("dotenv").config();

const http = require("http");
const https = require("https");
const fs = require("fs");
const path = require("path");

const app = require("./app");
const db = require("./config/database");

const HTTP_PORT = process.env.PORT || 5000;
const HTTPS_PORT = process.env.HTTPS_PORT || 5443;
const SSL_ENABLED = process.env.SSL_ENABLED === "true";

async function startServer() {
  try {
    await db.query("SELECT 1");
    console.log("MySQL database connected successfully");

    http.createServer(app).listen(HTTP_PORT, () => {
      console.log(`HTTP  server running on http://localhost:${HTTP_PORT}`);
    });

    // ── HTTPS server (optional, requires SSL_ENABLED=true + cert files) ──
    if (SSL_ENABLED) {
      const certPath = path.resolve(
        process.env.SSL_CERT_PATH || "./certs/server.cert",
      );
      const keyPath = path.resolve(
        process.env.SSL_KEY_PATH || "./certs/server.key",
      );

      if (!fs.existsSync(certPath) || !fs.existsSync(keyPath)) {
        console.warn(
          "SSL_ENABLED=true but certificate files were not found.\n" +
            `  Expected cert : ${certPath}\n` +
            `  Expected key  : ${keyPath}\n` +
            "  Run: node scripts/generate-cert.js  to generate a self-signed certificate.\n" +
            "  HTTPS server will NOT start.",
        );
      } else {
        const sslOptions = {
          cert: fs.readFileSync(certPath),
          key: fs.readFileSync(keyPath),
        };

        https.createServer(sslOptions, app).listen(HTTPS_PORT, () => {
          console.log(
            `HTTPS server running on https://localhost:${HTTPS_PORT}`,
          );
        });
      }
    }
  } catch (error) {
    console.error("Database connection failed:", error.message);
    process.exit(1);
  }
}

startServer();
