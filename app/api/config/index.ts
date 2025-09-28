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
  nodeEnv: process.env.NEXT_PUBLIC_NODE_ENV || "development",
  jwtSecret: process.env.NEXT_PUBLIC_JWT_SECRET || "secret",
  db: {
    host: process.env.NEXT_PUBLIC_DB_HOST || "",
    port: Number(process.env.NEXT_PUBLIC_DB_PORT),
    name: process.env.NEXT_PUBLIC_DB_NAME || "",
    user: process.env.NEXT_PUBLIC_DB_USER || "",
    password: process.env.NEXT_PUBLIC_DB_PASSWORD || "",
  },
  twilio: {
    serviceSid: process.env.NEXT_PUBLIC_TWILIO_SERVICE_SID || "",
    accountSid: process.env.NEXT_PUBLIC_TWILIO_ACCOUNT_SID || "",
    authToken: process.env.NEXT_PUBLIC_TWILIO_AUTH_TOKEN || "",
  },
  redis: {
    username: process.env.NEXT_PUBLIC_REDIS_USERNAME || "",
    password: process.env.NEXT_PUBLIC_REDIS_PASSWORD || "",
    host: process.env.NEXT_PUBLIC_REDIS_HOST || "",
    port: Number(process.env.NEXT_PUBLIC_REDIS_PORT),
  },
};
