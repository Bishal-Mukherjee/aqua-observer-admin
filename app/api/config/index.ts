interface Config {
  nodeEnv: string;
  db: {
    host: string;
    port: number;
    name: string;
    user: string;
    password: string;
    ssl: boolean;
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
  aws: {
    region: string;
    accessKeyId: string;
    secretAccessKey: string;
  };
  s3: {
    bucket: string;
    lookupPrefix: string;
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
    ssl: process.env.DB_SSL !== "false",
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
  aws: {
    region: process.env.AWS_REGION || "",
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || "",
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || "",
  },
  s3: {
    bucket: process.env.AWS_S3_BUCKET || "",
    lookupPrefix: process.env.AWS_S3_LOOKUP_PREFIX || "",
  },
};
