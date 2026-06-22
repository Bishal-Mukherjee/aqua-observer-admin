const fs = require("fs");
const https = require("https");
const path = require("path");

const certDir = path.join(__dirname, "..", "certs");
const certPath = path.join(certDir, "global-bundle.pem");
const certUrl =
  "https://truststore.pki.rds.amazonaws.com/global/global-bundle.pem";

function downloadCert() {
  return new Promise((resolve, reject) => {
    https
      .get(certUrl, (response) => {
        if (response.statusCode !== 200) {
          reject(new Error(`HTTP ${response.statusCode}`));
          return;
        }

        const file = fs.createWriteStream(certPath);
        response.pipe(file);

        file.on("finish", () => {
          file.close(() => resolve(certPath));
        });

        file.on("error", reject);
      })
      .on("error", reject);
  });
}

async function main() {
  if (fs.existsSync(certPath)) {
    console.log(`RDS CA cert already exists at ${certPath}`);
    return;
  }

  if (!fs.existsSync(certDir)) {
    fs.mkdirSync(certDir, { recursive: true });
  }

  try {
    await downloadCert();
    console.log(`Downloaded RDS CA cert to ${certPath}`);
  } catch (error) {
    console.error("Failed to download RDS CA cert:", error.message);
    process.exit(1);
  }
}

main();
