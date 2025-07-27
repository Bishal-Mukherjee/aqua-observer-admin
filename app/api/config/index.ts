interface Config {
  nodeEnv: string;
  db: {
    host: string;
    port: number;
    name: string;
    user: string;
    password: string;
  };
  //   redis: {
  //     username: string;
  //     password: string;
  //     host: string;
  //     port: number;
  //   };
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
  //   redis: redisConfig(),
};
