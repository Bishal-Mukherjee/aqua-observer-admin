interface Config {
  nodeEnv: string;
  db: {
    host: string;
    port: number;
    name: string;
    user: string;
    password: string;
  };
  twilio: {
    serviceSid: string;
    accountSid: string;
    authToken: string;
  };
  redis: {
    username: string;
    password: string;
    host: string;
    port: number;
  };
  jwtSecret: string;
}

export const config: Config = {
  nodeEnv: process.env.NODE_ENV || "development",
  jwtSecret: process.env.JWT_SECRET || "secret",
  db: {
    host: process.env.DB_HOST || "",
    port: Number(process.env.DB_PORT),
    name: process.env.DB_NAME || "",
    user: process.env.DB_USER || "",
    password: process.env.DB_PASSWORD || "",
  },
  twilio: {
    serviceSid: process.env.TWILIO_SERVICE_SID || "",
    accountSid: process.env.TWILIO_ACCOUNT_SID || "",
    authToken: process.env.TWILIO_AUTH_TOKEN || "",
  },
  redis: {
    username: process.env.REDIS_USERNAME || "",
    password: process.env.REDIS_PASSWORD || "",
    host: process.env.REDIS_HOST || "",
    port: Number(process.env.REDIS_PORT),
  },
};
