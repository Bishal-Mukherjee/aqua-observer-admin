import { Pool, PoolConfig } from "pg";
import { config } from "@/app/api/config";
import fs from "fs";
import path from "path";

let poolConfig: PoolConfig = {
  user: config.db.user,
  database: config.db.name,
  host: config.db.host,
  port: config.db.port,
  password: config.db.password,
  ssl: {
    rejectUnauthorized: false,
  },
};

if (config.db.ssl) {
  const caCertPath = path.join(process.cwd(), "certs/global-bundle.pem");

  poolConfig = {
    ...poolConfig,
    ssl: {
      rejectUnauthorized: true,
      ca: fs.readFileSync(caCertPath).toString(),
    },
  };
}

export const pool = new Pool(poolConfig);
