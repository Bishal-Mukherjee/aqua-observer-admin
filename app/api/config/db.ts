import { Pool, PoolConfig } from "pg";
import { config } from "@/app/api/config";
import fs from "fs";
import path from "path";

let pgPool: Pool | undefined;

function getSslConfig(): PoolConfig["ssl"] {
  if (!config.db.ssl) {
    return { rejectUnauthorized: false };
  }

  const caCertPath =
    process.env.DB_CA_CERT_PATH ||
    path.join(process.cwd(), "certs/global-bundle.pem");

  return {
    rejectUnauthorized: true,
    ca: fs.readFileSync(caCertPath).toString(),
  };
}

function createPool(): Pool {
  return new Pool({
    user: config.db.user,
    database: config.db.name,
    host: config.db.host,
    port: config.db.port,
    password: config.db.password,
    ssl: getSslConfig(),
  });
}

function getPool(): Pool {
  if (!pgPool) {
    pgPool = createPool();
  }
  return pgPool;
}

export const pool = new Proxy({} as Pool, {
  get(_target, prop) {
    const value = getPool()[prop as keyof Pool];
    return typeof value === "function"
      ? (value as (...args: unknown[]) => unknown).bind(getPool())
      : value;
  },
});
