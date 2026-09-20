const selfsigned = require("selfsigned");
const fs = require("fs");
const path = require("path");

const CERT_DIR = path.join(__dirname, "..", "certs");

const attrs = [
  { name: "commonName", value: "localhost" },
  { name: "organizationName", value: "FactoryFlow Dev" },
  { name: "organizationalUnitName", value: "Development" },
  { name: "countryName", value: "Ethiopia" },
];

const opts = {
  keySize: 2048,
  days: 365,
  algorithm: "sha256",
  extensions: [
    {
      name: "subjectAltName",
      altNames: [
        { type: 2, value: "localhost" },
        { type: 7, ip: "127.0.0.1" },
      ],
    },
  ],
};

console.log("Generating self-signed certificate...");

const pems = selfsigned.generate(attrs, opts);

if (!fs.existsSync(CERT_DIR)) {
  fs.mkdirSync(CERT_DIR, { recursive: true });
}

const certPath = path.join(CERT_DIR, "server.cert");
const keyPath = path.join(CERT_DIR, "server.key");

fs.writeFileSync(certPath, pems.cert);
fs.writeFileSync(keyPath, pems.private);

console.log("Certificate generated successfully:");
console.log("  Cert : " + certPath);
console.log("  Key  : " + keyPath);
console.log("\nTo enable HTTPS, set SSL_ENABLED=true in your .env file.");
console.log(
  "\nWARNING: This is a SELF-SIGNED certificate for development only.",
);
console.log(
  "  Your browser will show a security warning - click Advanced -> Proceed.",
);
console.log(
  "  For production, use a certificate from a trusted CA (e.g. Let's Encrypt).",
);
