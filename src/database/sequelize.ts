import { Sequelize } from "sequelize";
require("dotenv").config();

const configs = {
  development: {
    dialect: "mysql" as const,
    host: "127.0.0.1",
    username: "root",
    password: "root",
    database: "assist_app",
    port: 8889,
    logging: false,
  },
  production: {
    dialect: "mysql" as const,
    host: process.env.DB_HOST,
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: Number(process.env.DB_PORT),
    logging: false,
  },
  test: {
    dialect: "mysql" as const,
    host: process.env.TEST_DB_HOST || "127.0.0.1",
    username: process.env.TEST_DB_USER || "root",
    password: process.env.TEST_DB_PASSWORD || "root",
    database: process.env.TEST_DB_NAME || "assist_app_test",
    port: Number(process.env.TEST_DB_PORT) || 8889,
    logging: false,
  },
};

const env = process.env.NODE_ENV || "development";
console.log("🚀 ~ env:", env);
const config = {
  ...configs[env as keyof typeof configs],
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000,
  },
};

const sequelize = new Sequelize(config);

export async function initDatabase(): Promise<void> {
  try {
    await sequelize.authenticate();
    console.log(`Database connection established successfully in ${env} mode`);
  } catch (err) {
    console.error("Unable to connect to database:", err);
    process.exit(1);
  }
}

export default sequelize;
